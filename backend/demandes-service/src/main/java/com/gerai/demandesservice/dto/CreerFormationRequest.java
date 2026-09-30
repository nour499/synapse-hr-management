package com.gerai.demandesservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de requête pour la création d'une formation.
 * Reflète les noms de champs envoyés par le frontend Angular
 * (différents des noms de colonnes Oracle utilisés dans TrainingRequest).
 */
@Data
public class CreerFormationRequest {
    private Long employeId;
    private String titre;
    private String organisme;
    private BigDecimal coutEstime;
    private LocalDate plannedDate;
    private Integer dureeJours;
    private String lieu;
    private String mode;
    private String objectifs;
    private Long chefId;
    private String type;
    private LocalDate dateDebutSouhaitee;
    private LocalDate dateFinSouhaitee;
    private List<String> competencesVisees;
}