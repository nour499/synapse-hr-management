package com.gerai.projetsservice.dto;

import lombok.*;

/**
 * Indicateurs de performance d'un chef de projet (espace Chef / dashboard).
 * Construit par ProjetService.getPerformanceChef().
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceChefDTO {

    /** % de projets livrés (terminés / total) */
    private double tauxLivraisonProjet;

    /** Satisfaction client (0–5) */
    private double satisfactionClient;

    /** % de collaboration équipe (tâches terminées / total) */
    private double collaborationEquipe;

    /** Qualité (score moyen des évaluations saisies par le chef, 0–100) */
    private double qualiteCode;

    /** Temps moyen de résolution des bugs (en jours) */
    private double tempsResolutionBugs;
}
