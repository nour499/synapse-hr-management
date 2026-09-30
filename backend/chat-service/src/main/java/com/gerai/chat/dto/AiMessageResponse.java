package com.gerai.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Réponse renvoyée au composant Angular.
 * Contrat : { "reply": string, "success": boolean, "error": string }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiMessageResponse {
    private String reply;
    private boolean success;
    private String error;
}
