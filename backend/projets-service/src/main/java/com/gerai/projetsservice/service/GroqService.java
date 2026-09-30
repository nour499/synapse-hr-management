package com.gerai.projetsservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Client minimal vers l'API Groq (OpenAI-compatible chat/completions).
 * Dégrade proprement (retourne null) si la clé n'est pas configurée ou en cas d'erreur,
 * ce qui permet au RecrutementService d'appliquer un fallback déterministe.
 */
@Slf4j
@Service
public class GroqService {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.base-url}")
    private String baseUrl;

    @Value("${groq.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void logConfig() {
        log.info("[GroqService] Clé API configurée : {}", isConfigured());
        log.info("[GroqService] Longueur de la clé lue : {}", apiKey != null ? apiKey.length() : 0);
        log.info("[GroqService] baseUrl = {}", baseUrl);
        log.info("[GroqService] model = {}", model);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String chat(String system, String user) {
        if (!isConfigured()) {
            log.info("[GroqService] Clé API absente — appel IA ignoré (fallback appliqué)");
            return null;
        }
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("temperature", 0.4);
            body.put("messages", List.of(
                    Map.of("role", "system", "content", system),
                    Map.of("role", "user", "content", user)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    baseUrl + "/chat/completions", request, Map.class);

            Map<String, Object> bodyResp = response.getBody();
            if (bodyResp == null) return null;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) bodyResp.get("choices");
            if (choices == null || choices.isEmpty()) return null;
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return message != null ? (String) message.get("content") : null;
        } catch (Exception e) {
            // Log temporaire détaillé — stack trace complète pour diagnostiquer
            // l'échec réel (timeout, 401, 400, SSL...) avant de le simplifier.
            log.warn("[GroqService] Échec appel Groq: {} — type={}", e.getMessage(), e.getClass().getName(), e);
            return null;
        }
    }

    public <T> T chatJson(String system, String user, Class<T> type) {
        String content = chat(system, user);
        if (content == null) return null;
        String json = content.trim();
        if (json.startsWith("```")) {
            int firstNewline = json.indexOf('\n');
            int last = json.lastIndexOf("```");
            if (firstNewline > 0 && last > firstNewline) {
                json = json.substring(firstNewline + 1, last).trim();
            }
        }
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            log.warn("[GroqService] Réponse Groq non parsable en {}: {}", type.getSimpleName(), e.getMessage());
            return null;
        }
    }
}