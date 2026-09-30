package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Candidat à une offre. Correspond au modèle Candidate du frontend.
 * competences / killerAnswers / screeningAnswers sont stockés en JSON (CLOB).
 */
@Entity
@Table(name = "CANDIDATS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CANDIDAT_ID")
    private Long candidatId;

    @Column(name = "NOM", length = 100, nullable = false)
    private String nom;

    @Column(name = "PRENOM", length = 100, nullable = false)
    private String prenom;

    @Column(name = "EMAIL", length = 200)
    private String email;

    @Column(name = "TELEPHONE", length = 50)
    private String telephone;

    @Column(name = "PHOTO", length = 500)
    private String photo;

    @Column(name = "JOB_ID")
    private Long jobId;

    @Column(name = "JOB_TITRE", length = 200)
    private String jobTitre;

    @Column(name = "DEPARTEMENT", length = 100)
    private String departement;

    @Column(name = "STATUT", length = 20)
    @Builder.Default
    private String statut = "NOUVEAU";

    @Column(name = "DATE_POSTULATION")
    private LocalDateTime datePostulation;

    @Column(name = "EXPERIENCE")
    private Integer experience;

    @Lob
    @Column(name = "COMPETENCES_JSON")
    private String competencesJson;

    /**
     * Stockée en NUMBER(1) côté Oracle (pas le type BOOLEAN natif 23c).
     * SqlTypes.INTEGER (pas NUMERIC) : BooleanJavaType sait convertir vers
     * Integer (true→1, false→0), mais pas vers BigDecimal — NUMERIC déclenchait
     * "Could not convert 'java.lang.Boolean' to 'java.math.BigDecimal'" à l'insert.
     */
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "SHORTLISTE")
    @Builder.Default
    private Boolean shortliste = false;

    @Column(name = "CV_URL", length = 500)
    private String cvUrl;

    @Column(name = "LINKEDIN", length = 500)
    private String linkedin;

    @Column(name = "LOCALISATION", length = 200)
    private String localisation;

    @Lob
    @Column(name = "NOTE_RECRUTEUR")
    private String noteRecruteur;

    @Column(name = "SCORE")
    private Double score;

    @Column(name = "SCREENING_SCORE")
    private Double screeningScore;

    @Lob
    @Column(name = "KILLER_ANSWERS_JSON")
    private String killerAnswersJson;

    @Lob
    @Column(name = "SCREENING_ANSWERS_JSON")
    private String screeningAnswersJson;

    /** Texte brut extrait du fichier CV (PDF/DOCX) — utilisé pour le scoring IA. */
    @Lob
    @Column(name = "CV_TEXT")
    private String cvText;

    @PrePersist
    protected void onCreate() {
        if (this.datePostulation == null) this.datePostulation = LocalDateTime.now();
        if (this.statut == null) this.statut = "NOUVEAU";
        if (this.shortliste == null) this.shortliste = false;
    }
}