package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité mappée sur GERAI.TRAINING_REQUESTS.
 *
 * Statuts Oracle valides (CHECK) :
 *   EN_ATTENTE | APPROUVE_CHEF | APPROUVE_RH | REFUSE | ANNULE
 *
 * STATUT_ETENDU porte le vrai statut du workflow frontend (plus riche :
 * PLANIFIEE, EN_COURS, COMPLETEE, REJETE_CHEF, REJETE_RH...) — persisté
 * réellement, remplace l'ancien ConcurrentHashMap en mémoire qui perdait
 * tout au redémarrage du service.
 */
@Entity
@Table(name = "TRAINING_REQUESTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REQUEST_ID")
    private Long requestId;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "TRAINING_TITLE", nullable = false, length = 200)
    private String trainingTitle;

    @Column(name = "PROVIDER", length = 150)
    private String provider;

    @Column(name = "ESTIMATED_COST")
    private BigDecimal estimatedCost;

    @Column(name = "PLANNED_DATE")
    private LocalDate plannedDate;

    @Column(name = "DURATION_DAYS")
    private Integer durationDays;

    @Column(name = "LIEU", length = 200)
    private String lieu;

    @Column(name = "MODE_FORMATION", length = 20)
    private String modeFormation;

    @Column(name = "REASON", length = 500)
    private String reason;

    /** VARCHAR2(20). Valeurs Oracle : EN_ATTENTE | APPROUVE_CHEF | APPROUVE_RH | REFUSE | ANNULE */
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private String status = "EN_ATTENTE";

    /** FK → EMPLOYEES.employee_id — chef qui valide (étape 1). Sert aussi de chefId côté frontend. */
    @Column(name = "APPROVED_BY")
    private Long approvedBy;

    @Column(name = "APPROVED_BY_RH")
    private Long approvedByRh;

    @Column(name = "APPROVED_AT_RH")
    private LocalDateTime approvedAtRh;

    @Column(name = "APPROVED_BY_RH_NAME", length = 200)
    private String approvedByRhName;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /* ── Champs étendus, désormais réellement persistés (V19) ────── */

    @Column(name = "TYPE", length = 50)
    private String type;

    @Column(name = "DATE_DEBUT_SOUHAITEE")
    private LocalDate dateDebutSouhaitee;

    @Column(name = "DATE_FIN_SOUHAITEE")
    private LocalDate dateFinSouhaitee;

    /** Liste de compétences visées, sérialisée en JSON — parsing fait dans le contrôleur/DTO. */
    @Lob
    @Column(name = "COMPETENCES_VISEES_JSON")
    private String competencesViseesJson;

    @Column(name = "COMMENTAIRE_CHEF", length = 500)
    private String commentaireChef;

    @Column(name = "DATE_TRAITEMENT_CHEF")
    private LocalDateTime dateTraitementChef;

    @Column(name = "COMMENTAIRE_RH", length = 500)
    private String commentaireRh;

    @Column(name = "TRAITEE_PAR_RH", length = 200)
    private String traiteeParRh;

    @Column(name = "DATE_DEBUT_REELLE")
    private LocalDate dateDebutReelle;

    @Column(name = "DATE_FIN_REELLE")
    private LocalDate dateFinReelle;

    /**
     * Stockée en NUMBER(1) (pas le BOOLEAN natif Oracle 23c) — mapping
     * explicite requis, même correctif que LoanRequest.needsCommission
     * et Candidate.shortliste (SqlTypes.INTEGER, pas NUMERIC).
     */
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "CERTIFICAT_OBTENU")
    @Builder.Default
    private Boolean certificatObtenu = false;

    @Column(name = "EVALUATION")
    private Integer evaluation;

    @Column(name = "NOTE_EVALUATION", length = 500)
    private String noteEvaluation;

    /** Statut du workflow frontend — remplace l'ancien ConcurrentHashMap en mémoire. */
    @Column(name = "STATUT_ETENDU", length = 20)
    @Builder.Default
    private String statutEtendu = "EN_ATTENTE";

    /* ── Champs d'enrichissement à l'exécution, jamais persistés ──── */
    @Transient
    private String employeNom;
    @Transient
    private String employePrenom;
    @Transient
    private String employePhoto;
    @Transient
    private String departement;
    @Transient
    private String chefNom;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "EN_ATTENTE";
        if (this.statutEtendu == null) this.statutEtendu = "EN_ATTENTE";
        if (this.certificatObtenu == null) this.certificatObtenu = false;
    }
}