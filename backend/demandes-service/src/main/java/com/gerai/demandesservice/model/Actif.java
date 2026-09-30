package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Entité mappée sur GERAI_USER.ACTIFS.
 *
 * Contraintes Oracle (V__fix_actifs_categorie_type.sql) :
 *   CATEGORIE : CK_ACTIF_CATEGORIE — 'TANGIBLE' | 'NUMERIQUE'
 *   TYPE      : CK_ACTIF_TYPE — voir liste dans la contrainte
 *   STATUT    : CK_ACTIF_STATUT — DISPONIBLE | ATTRIBUE | EN_MAINTENANCE | HORS_SERVICE
 */
@Entity
@Table(name = "ACTIFS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Actif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACTIF_ID")
    private Long id;

    @Column(name = "NOM", nullable = false, length = 200)
    private String nom;

    @Column(name = "CATEGORIE", nullable = false, length = 50)
    private String categorie;

    @Column(name = "TYPE", nullable = false, length = 50)
    private String type;

    @Column(name = "MARQUE", length = 100)
    private String marque;

    @Column(name = "MODELE", length = 100)
    private String modele;

    @Column(name = "NUMERO_SERIE", length = 100)
    private String numeroSerie;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "VALEUR")
    private Double valeur;

    @Column(name = "DATE_ACQUISITION")
    private LocalDate dateAcquisition;

    @Column(name = "DATE_ATTRIBUTION")
    private LocalDate dateAttribution;

    @Column(name = "DATE_EXPIRATION")
    private LocalDate dateExpiration;

    /** Valeurs : DISPONIBLE | ATTRIBUE | EN_MAINTENANCE | HORS_SERVICE */
    @Column(name = "STATUT", nullable = false, length = 30)
    @Builder.Default
    private String statut = "DISPONIBLE";

    @Column(name = "EMPLOYEE_ID")
    private Long employeId;

    @Column(name = "EMPLOYE_NOM", length = 200)
    private String employeNom;
}