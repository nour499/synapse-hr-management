package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

/**
 * Prédiction d'attrition pour un employé.
 * Correspond à {@code AttritionPrediction} côté Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttritionPredictionDTO {

    private long                employeId;
    private String             nom;
    private String             prenom;
    private String             photo;
    private String             departement;
    private String             poste;
    private int                riskScore;     // 0–100
    private String             riskLevel;     // ELEVE | MOYEN | FAIBLE
    private List<RiskFactorDTO> facteurs;
    private List<String>       recommandations;
    private String             lastUpdated;
}
