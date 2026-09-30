package com.gerai.demandesservice.dto;

import lombok.*;

/**
 * Événement de notification publié sur le topic Kafka
 * "notification-events" (consommé par le notification-service).
 *
 * Construit par DemandeService.notifier*().
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    /** employee_id Oracle du destinataire (utilisé comme clé Kafka). */
    private Long    employeeId;
    private String  email;
    /** Type sémantique : EN_ATTENTE | VALIDEE_CHEF | VALIDEE_RH | REJETEE | ANNULEE … */
    private String  type;
    private String  title;
    private String  content;
    private String  referenceId;     // request_id de la table source
    private String  referenceType;   // CONGE | FORMATION | PRET | DOCUMENT | AUTORISATION
    private String  actionUrl;       // route frontend vers laquelle rediriger
    private String  sourceService;    // "DEMANDES-SERVICE"
    private Integer nbJours;         // pour les stats congés
}
