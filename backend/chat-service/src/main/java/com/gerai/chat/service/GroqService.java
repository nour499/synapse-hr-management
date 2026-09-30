package com.gerai.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Client du LLM Groq (API OpenAI-compatible : POST /openai/v1/chat/completions).
 *
 * Groq ne fournit PAS d'endpoint d'embeddings : le RAG est donc effectué par
 * récupération de données métier réelles (voir ChatbotService), puis le LLM
 * génère une réponse ancrée (grounded) dans ce contexte.
 */
@Slf4j
@Service
public class GroqService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    public GroqService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

        // Timeout de connexion : 30 secondes
        factory.setConnectTimeout(30000);

        // Timeout de lecture : 120 secondes
        factory.setReadTimeout(120000);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    /**
     * Appelle Groq et retourne le texte de la réponse.
     *
     * @throws RuntimeException si la clé API est absente ou la réponse illisible.
     */
    public String complete(List<GroqMessage> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException(
                    "L'assistant IA n'est pas configuré : groq.api.key manquant. " +
                            "Ajoutez GROQ_API_KEY dans le fichier .env du chat-service.");
        }

        GroqRequest request = new GroqRequest(model, messages, 0.6, 900);

        log.info("[Groq] Appel API - model={}, url={}", model, baseUrl + "/chat/completions");

        String raw = restClient.post()
                .uri(baseUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(request)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new RuntimeException("Réponse Groq vide");
            }
            return content.asText();
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            log.error("[Groq] Réponse illisible : {}", raw);
            throw new RuntimeException("Réponse Groq illisible : " + e.getMessage());
        }
    }

    /* ── Records de requête Groq ───────────────────────────── */

    public record GroqMessage(String role, String content) {}

    public record GroqRequest(
            String model,
            List<GroqMessage> messages,
            double temperature,
            int max_tokens) {}
}