package com.gerai.demandesservice.dto;

import lombok.*;

/**
 * Vue allégée d'une absence pour le planning congés équipe (chef).
 * N'expose que les champs nécessaires au Gantt frontend — jamais les
 * détails internes de validation (commentaires RH, montants, etc.)
 * portés par DemandeResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamAbsenceDTO {
    private String employeId;
    private String nom;
    private String prenom;
    private String type;      // code TYPE_CONGE : ANNUEL, MALADIE, RTT...
    private String dateDebut;
    private String dateFin;
    private String statut;    // EN_ATTENTE | APPROUVE | REJETE | ANNULE
}