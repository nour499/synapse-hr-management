package com.gerai.demandesservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ActifDto {

    @NotBlank(message = "Le nom est requis")
    private String nom;

    @NotBlank(message = "La catégorie est requise")
    @Pattern(regexp = "TANGIBLE|NUMERIQUE", message = "La catégorie doit être TANGIBLE ou NUMERIQUE")
    private String categorie;

    @NotBlank(message = "Le type est requis")
    @Pattern(
            regexp = "ORDINATEUR|WORKSTATION|IMPRIMANTE|TELEPHONE|CASQUE|VEHICULE|ECRAN|AUTRE|LICENCE_LOGICIEL|CLE_ACCES|ABONNEMENT",
            message = "Type d'actif invalide"
    )
    private String type;

    private String marque;
    private String modele;
    private String numeroSerie;
    private String description;
    private Double valeur;
    private String dateAcquisition;
    private String dateAttribution;
    private String dateExpiration;
    private String statut;
    private Long employeId;
    private String employeNom;
}