package com.gerai.projetsservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Reflet exact du modèle Evaluation du frontend.
 * autoEval / evalChef sont transmis tels quels (objets JSON libres).
 * L'id est "id" (et non evalId) pour coller au frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EvaluationDTO {

    private Long   id;
    private Long   campagneId;
    private String campagneTitre;
    private String periode;
    private Integer annee;

    // Employé évalué
    private Long   employeId;
    private String employeNom;
    private String employePrenom;
    private String employePoste;
    private String departement;

    // Chef évaluateur
    private Long   chefId;
    private String chefNom;

    // Données auto-alimentées
    private Double tauxPresence;
    private Integer formationsRealisees;
    private Integer tachesCompletees;
    private Integer totalTaches;

    // Workflow
    private String statut;

    // Auto-évaluation
    private Map<String, Object> autoEval;
    private LocalDateTime dateAutoEval;

    // Évaluation chef
    private Map<String, Object> evalChef;
    private LocalDateTime dateEvalChef;
    private String recommandation;
    private String commentaireRecommandation;

    // Calibration RH
    private Double scoreAjuste;
    private String commentaireRh;
    private LocalDateTime dateValidationRh;
    private String valideeParRh;

    // Scores finaux
    private Double scoreObjectifs;
    private Double scoreCompetences;
    private Double scoreFormations;
    private Double scorePresence;
    private Double scoreFinal;
    private String mention;
}
