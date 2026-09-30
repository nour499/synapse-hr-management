package com.gerai.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Requête entrante du composant Angular AiAssistantComponent.
 * Contrat : { "message": string, "history": [ { "role": "user"|"assistant", "content": string } ] }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiMessageRequest {

    private String message;
    private List<AiHistoryItem> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiHistoryItem {
        private String role;
        private String content;
    }
}
