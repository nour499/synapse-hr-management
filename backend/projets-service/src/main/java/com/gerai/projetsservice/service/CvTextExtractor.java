package com.gerai.projetsservice.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * Extraction du texte brut d'un CV (PDF / DOCX / TXT).
 * Dégrade proprement : retourne null en cas d'échec ou de format non supporté,
 * ce qui permet au scoring de retomber sur les compétences déclarées.
 */
@Slf4j
@Service
public class CvTextExtractor {

    /** Longueur max du texte conservé (évite de saturer le prompt LLM). */
    private static final int MAX_CHARS = 12_000;

    /** Extraction depuis un fichier uploadé (avant transfert sur disque). */
    public String extract(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        try (InputStream in = file.getInputStream()) {
            return extractStream(in, file.getOriginalFilename());
        } catch (Exception e) {
            log.warn("[CvTextExtractor] Échec extraction (upload) {}: {}",
                    file.getOriginalFilename(), e.getMessage());
            return null;
        }
    }

    /** Extraction depuis un fichier déjà présent sur disque. */
    public String extract(File file) {
        if (file == null || !file.exists()) return null;
        try (InputStream in = new FileInputStream(file)) {
            return extractStream(in, file.getName());
        } catch (Exception e) {
            log.warn("[CvTextExtractor] Échec extraction (disque) {}: {}", file.getName(), e.getMessage());
            return null;
        }
    }

    private String extractStream(InputStream in, String filename) throws Exception {
        String name = filename != null ? filename.toLowerCase() : "";
        byte[] bytes = in.readAllBytes();
        String text;
        if (name.endsWith(".pdf")) {
            text = extractPdf(bytes);
        } else if (name.endsWith(".docx")) {
            text = extractDocx(bytes);
        } else if (name.endsWith(".txt")) {
            text = new String(bytes, StandardCharsets.UTF_8);
        } else {
            log.info("[CvTextExtractor] Format non supporté pour extraction: {}", filename);
            return null;
        }
        return clean(text);
    }

    private String extractPdf(byte[] bytes) throws Exception {
        try (PDDocument doc = PDDocument.load(new ByteArrayInputStream(bytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String extractDocx(byte[] bytes) throws Exception {
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        }
    }

    private String clean(String text) {
        if (text == null) return null;
        String cleaned = text.replaceAll("[ \\t\\x0B\\f\\r]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
        if (cleaned.isBlank()) return null;
        return cleaned.length() > MAX_CHARS ? cleaned.substring(0, MAX_CHARS) : cleaned;
    }
}
