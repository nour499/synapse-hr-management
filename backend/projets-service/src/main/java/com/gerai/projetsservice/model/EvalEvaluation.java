package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Évaluation individuelle (workflow Admin/Chef/Employé).
 * Correspond au modèle Evaluation du frontend.
 *
 * Les parties auto-évaluation et évaluation-chef sont stockées en JSON
 * (CLOB) pour rester flexibles et coller au modèle riche du frontend.
 */
@Entity
@Table(name = "EVALUATIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvalEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EVAL_ID")
    private Long evalId;

    @Column(name = "CAMPAGNE_ID")
    private Long campagneId;

    @Column(name = "CAMPAGNE_TITRE", length = 200)
    private String campagneTitre;

    @Column(name = "PERIODE", length = 6)
    private String periode;

    @Column(name = "ANNEE")
    private Integer annee;

    /* ── Employé évalué ─────────────────────────────── */
    @Column(name = "EMPLOYE_ID", nullable = false)
    private Long employeId;

    @Column(name = "EMPLOYE_NOM", length = 100)
    private String employeNom;

    @Column(name = "EMPLOYE_PRENOM", length = 100)
    private String employePrenom;

    @Column(name = "EMPLOYE_POSTE", length = 100)
    private String employePoste;

    @Column(name = "DEPARTEMENT", length = 100)
    private String departement;

    /* ── Chef évaluateur ────────────────────────────── */
    @Column(name = "CHEF_ID")
    private Long chefId;

    @Column(name = "CHEF_NOM", length = 100)
    private String chefNom;

    /** EN_ATTENTE | AUTO_SOUMISE | VALIDEE_CHEF | VALIDEE_RH | CLOTUREE */
    @Column(name = "STATUT", nullable = false, length = 20)
    @Builder.Default
    private String statut = "EN_ATTENTE";

    /* ── Données auto-alimentées ────────────────────── */
    @Column(name = "TAUX_PRESENCE")
    @Builder.Default
    private Double tauxPresence = 100.0;

    @Column(name = "FORMATIONS_REALISEES")
    @Builder.Default
    private Integer formationsRealisees = 0;

    @Column(name = "TACHES_COMPLETEES")
    @Builder.Default
    private Integer tachesCompletees = 0;

    @Column(name = "TOTAL_TACHES")
    @Builder.Default
    private Integer totalTaches = 0;

    /* ── Auto-évaluation (JSON) ─────────────────────── */
    @Lob
    @Column(name = "AUTO_EVAL_JSON")
    private String autoEvalJson;

    @Column(name = "DATE_AUTO_EVAL")
    private LocalDateTime dateAutoEval;

    /* ── Évaluation chef (JSON) ─────────────────────── */
    @Lob
    @Column(name = "EVAL_CHEF_JSON")
    private String evalChefJson;

    @Column(name = "DATE_EVAL_CHEF")
    private LocalDateTime dateEvalChef;

    @Column(name = "RECOMMANDATION", length = 20)
    private String recommandation;

    @Lob
    @Column(name = "COMMENTAIRE_RECOMMANDATION")
    private String commentaireRecommandation;

    /* ── Scores calculés ────────────────────────────── */
    @Column(name = "SCORE_OBJECTIFS")
    private Double scoreObjectifs;

    @Column(name = "SCORE_COMPETENCES")
    private Double scoreCompetences;

    @Column(name = "SCORE_FORMATIONS")
    private Double scoreFormations;

    @Column(name = "SCORE_PRESENCE")
    private Double scorePresence;

    @Column(name = "SCORE_FINAL")
    private Double scoreFinal;

    @Column(name = "MENTION", length = 20)
    private String mention;

    /* ── Calibration RH ─────────────────────────────── */
    @Column(name = "SCORE_AJUSTE")
    private Double scoreAjuste;

    @Lob
    @Column(name = "COMMENTAIRE_RH")
    private String commentaireRh;

    @Column(name = "DATE_VALIDATION_RH")
    private LocalDateTime dateValidationRh;

    @Column(name = "VALIDEE_PAR_RH", length = 100)
    private String valideeParRh;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
