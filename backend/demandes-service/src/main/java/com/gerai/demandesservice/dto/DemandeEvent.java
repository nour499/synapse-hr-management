package com.gerai.demandesservice.dto;

import lombok.*;

/**
 * Événement analytique envoyé au analytics-service
 * (REST /internal/events) à chaque décision de demande.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeEvent {

    private String  destinataireId;  // employee_id de l'employé concerné
    private String  typeDemande;    // CONGE | FORMATION | PRET | DOCUMENT | AUTORISATION
    private String  statut;         // valeur Oracle (VALIDE_RH, REFUSE, …)
    private String  referenceId;     // request_id
    private Integer nbJours;        // congés uniquement
    private String  sourceService;   // "DEMANDES-SERVICE"
}
