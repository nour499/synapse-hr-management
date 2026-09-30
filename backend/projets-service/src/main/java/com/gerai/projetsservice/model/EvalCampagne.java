package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Campagne d'évaluation (espace Admin RH).
 * Correspond au modèle CampagneEvaluation du frontend.
 */
@Entity
@Table(name = "EVAL_CAMPAGNES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvalCampagne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CAMPAGNE_ID")
    private Long campagneId;

    @Column(name = "TITRE", nullable = false, length = 200)
    private String titre;

    /** T1 | T2 | T3 | T4 | ANNUEL */
    @Column(name = "PERIODE", length = 6)
    private String periode;

    @Column(name = "ANNEE")
    private Integer annee;

    @Column(name = "DATE_DEBUT")
    private LocalDate dateDebut;

    @Column(name = "DATE_FIN")
    private LocalDate dateFin;

    /** BROUILLON | PLANIFIEE | ACTIVE | CLOTUREE */
    @Column(name = "STATUT", nullable = false, length = 20)
    @Builder.Default
    private String statut = "BROUILLON";

    @Column(name = "CREE_PAR", length = 200)
    private String creePar;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    /** Liste des départements ciblés (JSON). Vide = tous. */
    @Lob
    @Column(name = "DEPARTEMENTS_JSON")
    private String departementsJson;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
