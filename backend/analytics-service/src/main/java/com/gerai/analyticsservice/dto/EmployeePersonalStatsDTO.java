package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Stats personnelles (congés + formations) d'un employé, exposées via
 * l'endpoint interne /internal/employes/{id}/stats-personnelles pour
 * consommation par employee-service (ProfilEmployeController).
 *
 * Les tâches n'apparaissent pas ici : la table TASKS de ce schéma n'a
 * aucune colonne d'assignation à un employé précis (pas d'ASSIGNEE_ID),
 * donc aucune requête fiable ne peut les filtrer par employé.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeePersonalStatsDTO {

    private long congesTotal;
    private long congesValides;
    private long congesRefuses;

    /** Jours de congé validés, année courante — utilisé pour le quota restant. */
    private double joursCongePris;

    private long formationsTotal;
    private long formationsValidees;
}