package com.gerai.demandesservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse pour /api/formations — traduit les noms de colonnes Oracle
 * / champs d'entité vers les noms exacts attendus par le frontend Angular
 * (voir DemandeFormation dans formation.model.ts).
 *
 * Sans ce DTO, les champs étaient renvoyés avec les noms Java de l'entité
 * (trainingTitle, provider, estimatedCost...) que le frontend ne reconnaît
 * pas (il attend titre, organisme, coutEstime...) — d'où les colonnes vides
 * observées dans la page Gestion des Formations malgré des données réelles
 * en base.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormationResponseDTO {

    private Long id;

    private Long employeId;
    private String employeNom;
    private String employePrenom;
    private String employePhoto;
    private String departement;
    private Long chefId;
    private String chefNom;

    private String titre;
    private String organisme;
    private String type;
    private String mode;
    private Integer dureeJours;
    private BigDecimal coutEstime;
    private String lieu;
    private LocalDate dateDebutSouhaitee;
    private LocalDate dateFinSouhaitee;
    private String objectifs;
    private List<String> competencesVisees;

    private String statut;
    private LocalDateTime dateDemande;

    private String commentaireChef;
    private LocalDateTime dateTraitementChef;

    private String commentaireRh;
    private LocalDateTime dateTraitementRh;
    private String traiteeParRh;

    private LocalDate dateDebutReelle;
    private LocalDate dateFinReelle;
    private Boolean certificatObtenu;
    private Integer evaluation;
    private String noteEvaluation;
}