package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Indicateurs de performance agrégés d'un chef de projet.
 * Correspond à {@code PerformanceChef} côté Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PerformanceChefDTO {

    private double tauxLivraisonProjet;   // Project Delivery — % on time (0–100)
    private double satisfactionClient;       // Client Satisfaction (0–5)
    private double collaborationEquipe;      // Team Collaboration score (0–100)
    private double qualiteCode;            // Code Quality team avg (0–100)
    private double tempsResolutionBugs;     // Bug Resolution Time avg (days)
}
