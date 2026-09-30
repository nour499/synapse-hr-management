package com.gerai.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gerai.chat.dto.AiMessageRequest;
import com.gerai.chat.dto.AiMessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Assistant RH SYNAPSE — moteur RAG "données live".
 *
 * Fonctionnement :
 *   1. Récupération (retrieval) des données réelles de l'employé via les
 *      microservices existants (employe-service, demandes-service), en
 *      forwardant le JWT de l'utilisateur.
 *   2. Détection d'intention par mots-clés pour savoir quelles données
 *      récupérer (profil, solde de congés, demandes).
 *   3. Le contexte est injecté dans le prompt système du LLM Groq, qui
 *      génère une réponse ancrée (grounded) dans les vraies données.
 */
@Slf4j
@Service
public class ChatbotService {

    private final GroqService groqService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    @Value("${services.employe.url}")
    private String employeUrl;

    @Value("${services.demandes.url}")
    private String demandesUrl;

    public ChatbotService(GroqService groqService) {
        this.groqService = groqService;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 secondes
        factory.setReadTimeout(20000);    // 20 secondes

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public AiMessageResponse answer(String message,
                                    List<AiMessageRequest.AiHistoryItem> history,
                                    String bearerToken) {

        try {
            String context = buildContext(message, bearerToken);

            List<GroqService.GroqMessage> messages = new ArrayList<>();
            messages.add(new GroqService.GroqMessage("system", buildSystemPrompt(context)));

            if (history != null) {
                for (AiMessageRequest.AiHistoryItem h : history) {
                    if (h.getContent() != null && !h.getContent().isBlank()
                            && (h.getRole().equals("user") || h.getRole().equals("assistant"))) {
                        messages.add(new GroqService.GroqMessage(h.getRole(), h.getContent()));
                    }
                }
            }
            messages.add(new GroqService.GroqMessage("user", message));

            String reply = groqService.complete(messages);
            return new AiMessageResponse(reply, true, null);

        } catch (Exception e) {
            log.error("[Chatbot] Erreur de génération : {}", e.getMessage());
            return new AiMessageResponse(null, false, e.getMessage());
        }
    }

    /* ── Construction du contexte (retrieval) ──────────────── */

    private String buildContext(String message, String bearerToken) {
        StringBuilder sb = new StringBuilder();
        String lower = (message == null ? "" : message).toLowerCase();

        // 1. Profil employé (identité, poste, manager…) — toujours utile
        JsonNode profil = callGet(employeUrl + "/api/employe/profil", bearerToken);
        if (profil != null && !profil.isMissingNode()) {
            sb.append("PROFIL EMPLOYÉ :\n");
            sb.append("- Nom complet : ").append(firstText(profil, "nomComplet", "prenom", "nom")).append("\n");
            sb.append("- Poste : ").append(text(profil, "poste")).append("\n");
            sb.append("- Département : ").append(text(profil, "departement")).append("\n");
            sb.append("- Manager : ").append(text(profil, "managerNom")).append("\n");
            sb.append("- Date d'embauche : ").append(text(profil, "dateEmbauche")).append("\n");
            sb.append("- Ancienneté : ").append(text(profil, "anciennete")).append("\n");
            sb.append("- Type de contrat : ").append(text(profil, "typeContrat")).append("\n");
        }

        // 2. Solde de congés (si la question porte sur les congés / absences)
        if (mentions(lower,
                "solde", "congé", "conge", "conges", "restant", "rtt",
                "maladie", "annuel", "poser", "demande")) {
            JsonNode solde = callGet(demandesUrl + "/api/conges/solde", bearerToken);
            if (solde != null && !solde.isMissingNode()) {
                sb.append("\nSOLDE DE CONGÉS :\n");
                sb.append("- Annuel : ").append(text(solde, "annuel")).append(" / ")
                        .append(text(solde, "annuelTotal")).append(" jours\n");
                sb.append("- RTT : ").append(text(solde, "rtt")).append(" / ")
                        .append(text(solde, "rttTotal")).append(" jours\n");
                sb.append("- Maladie : ").append(text(solde, "maladie")).append(" / ")
                        .append(text(solde, "maladieTotal")).append(" jours\n");
                sb.append("- Déjà pris cette année : ").append(text(solde, "pris")).append("\n");
                sb.append("- Année en cours : ").append(text(solde, "anneeEnCours")).append("\n");
            }
        }

        // 3. Historique des demandes de congés
        if (mentions(lower,
                "demande", "historique", "congé", "conge", "conges", "validé",
                "refus", "en attente", "appro")) {
            JsonNode demandes = callGet(demandesUrl + "/api/conges/mes-demandes", bearerToken);
            if (demandes != null && demandes.isArray() && !demandes.isEmpty()) {
                sb.append("\nMES DERNIÈRES DEMANDES DE CONGÉS :\n");
                int max = Math.min(demandes.size(), 5);
                for (int i = 0; i < max; i++) {
                    JsonNode d = demandes.get(i);
                    sb.append("- ")
                            .append(text(d, "type")).append(" du ")
                            .append(text(d, "dateDebut")).append(" au ")
                            .append(text(d, "dateFin"))
                            .append(" (").append(text(d, "statut")).append(")\n");
                }
            }
        }

        return sb.toString();
    }

    /* ── Prompt système ───────────────────────────────────── */

    private String buildSystemPrompt(String context) {
        return """
                Tu es SYNAPSE, l'assistant virtuel des Ressources Humaines d'une entreprise tunisienne.
                Tu réponds en français, de façon concise, professionnelle et bienveillante.

                Règles strictes :
                - Base-toi EXCLUSIVEMENT sur les données fournies dans la section <CONTEXTE> pour tout fait concernant l'employé (solde de congés, demandes, poste, manager, contrat…).
                - Si une information n'est pas présente dans le contexte, dis-le clairement et invite l'employé à contacter le service RH ou à utiliser l'application, sans jamais inventer de chiffre, date ou nom.
                - Pour une action (poser un congé, faire une demande), explique la démarche concrète à suivre dans l'application SYNAPSE.
                - Reste dans le périmètre RH ; redirige poliment les sujets hors périmètre.

                <CONTEXTE>
                %s
                </CONTEXTE>
                """.formatted(context.isBlank() ? "(aucune donnée employé disponible)" : context);
    }

    /* ── Helpers HTTP & JSON ──────────────────────────────── */

    private JsonNode callGet(String url, String bearerToken) {
        try {
            String body = restClient.get()
                    .uri(url)
                    .header("Authorization", bearerToken == null ? "" : bearerToken)
                    .retrieve()
                    .body(String.class);
            return objectMapper.readTree(body);
        } catch (Exception e) {
            log.warn("[Chatbot] Échec de récupération des données {} : {}", url, e.getMessage());
            return null;
        }
    }

    private boolean mentions(String text, String... keywords) {
        for (String k : keywords) {
            if (text.contains(k)) return true;
        }
        return false;
    }

    private String firstText(JsonNode node, String... keys) {
        for (String k : keys) {
            JsonNode v = node.path(k);
            if (!v.isMissingNode() && !v.asText().isBlank()) return v.asText();
        }
        return "";
    }

    private String text(JsonNode node, String key) {
        JsonNode v = node.path(key);
        return (v.isMissingNode() || v.isNull()) ? "" : v.asText();
    }
}