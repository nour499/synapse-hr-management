package com.gerai.demandesservice.dto;

import lombok.*;

/**
 * Corps de la requête de décision du comité médical
 * (congé longue maladie — EN_ETUDE_MEDICALE).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalDecisionRequest {

    /** true = avis favorable (transmis au chef), false = refus. */
    private boolean approuve;

    private String commentaire;
}
