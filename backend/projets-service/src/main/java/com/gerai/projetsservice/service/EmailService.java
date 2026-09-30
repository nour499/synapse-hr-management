package com.gerai.projetsservice.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Envoi d'e-mails via JavaMailSender.
 * Renvoie une map {sent, to, error?} afin que le contrôleur puisse répondre
 * même si le SMTP n'est pas configuré (fallback gracieux).
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@synapse.ma}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public Map<String, Object> send(String to, String objet, String corps) {
        if (to == null || to.isBlank()) {
            return Map.of("sent", false, "to", "", "error", "Destinataire absent");
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(objet);
            helper.setText(corps, true);
            mailSender.send(message);
            log.info("[EmailService] Email envoyé à {}", to);
            return Map.of("sent", true, "to", to);
        } catch (Exception e) {
            log.warn("[EmailService] Échec envoi vers {}: {}", to, e.getMessage());
            return Map.of("sent", false, "to", to, "error", e.getMessage());
        }
    }
}
