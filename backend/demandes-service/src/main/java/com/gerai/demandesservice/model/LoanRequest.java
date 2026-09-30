package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité mappée sur GERAI.LOAN_REQUESTS.
 *
 * Statuts valides (CHECK Oracle CK_LOAN_STATUS) :
 *   EN_ATTENTE | EN_ETUDE_DG | VALIDEE_DG | APPROUVE | REFUSE | REMBOURSE
 */
@Entity
@Table(name = "LOAN_REQUESTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REQUEST_ID")
    private Long requestId;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    /** Montant du prêt — NUMBER(12,2) NN */
    @Column(name = "AMOUNT", nullable = false)
    private BigDecimal amount;

    /** Devise — VARCHAR2(10) NN (ex: "TND") */
    @Column(name = "CURRENCY", nullable = false, length = 10)
    @Builder.Default
    private String currency = "TND";

    /** Durée de remboursement en mois — NUMBER(3) NN */
    @Column(name = "DURATION_MONTHS", nullable = false)
    private Integer durationMonths;

    /** Mensualité calculée — NUMBER(10,2) */
    @Column(name = "MONTHLY_PAYMENT")
    private BigDecimal monthlyPayment;

    /** Motif/justification — VARCHAR2(500) */
    @Column(name = "REASON", length = 500)
    private String reason;

    /**
     * VARCHAR2(20).
     * Valeurs : EN_ATTENTE | EN_ETUDE_DG | VALIDEE_DG | APPROUVE | REFUSE | REMBOURSE
     */
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private String status = "EN_ATTENTE";

    /** FK → EMPLOYEES.employee_id */
    @Column(name = "APPROVED_BY")
    private Long approvedBy;

    @Column(name = "APPROVED_AT")
    private LocalDateTime approvedAt;

    /** Motif du refus */
    @Column(name = "REJECTION_REASON", length = 500)
    private String rejectionReason;

    /** FK → EMPLOYEES.employee_id — agent RH qui valide/rejette (étape 2) */
    @Column(name = "APPROVED_BY_RH")
    private Long approvedByRh;

    @Column(name = "APPROVED_AT_RH")
    private LocalDateTime approvedAtRh;

    /** Nom complet extrait du JWT Keycloak au moment de la validation RH */
    @Column(name = "APPROVED_BY_RH_NAME", length = 200)
    private String approvedByRhName;

    /* ── Champs DG (décision finale) ─────────────────── */

    /** Montant approuvé par le DG (peut différer du montant demandé) */
    @Column(name = "MONTANT_APPROUVE")
    private BigDecimal montantApprouve;

    /** Nombre de mensualités accordées */
    @Column(name = "NB_TRANCHES")
    private Integer nbTranches;

    /** Montant de chaque tranche = MONTANT_APPROUVE / NB_TRANCHES */
    @Column(name = "MONTANT_TRANCHE")
    private BigDecimal montantTranche;

    /** FK → EMPLOYEES.employee_id — DG qui a rendu la décision */
    @Column(name = "DG_APPROVED_BY")
    private Long dgApprovedBy;

    @Column(name = "DG_DECISION_AT")
    private LocalDateTime dgDecisionAt;

    /** Commentaire du DG */
    @Column(name = "DG_COMMENT", length = 500)
    private String dgComment;

    /** Nom complet extrait du JWT Keycloak au moment de la décision du comité/DG */
    @Column(name = "DG_APPROVED_BY_NAME", length = 200)
    private String dgApprovedByName;

    /** Validation finale RH après décision du comité */
    @Column(name = "FINAL_APPROVED_BY")
    private Long finalApprovedBy;

    @Column(name = "FINAL_APPROVED_AT")
    private LocalDateTime finalApprovedAt;

    @Column(name = "FINAL_APPROVED_BY_NAME", length = 200)
    private String finalApprovedByName;

    /**
     * Indique si ce prêt nécessite l'avis d'une commission de prêt (workflow étape 3).
     * true  → EN_ATTENTE → (avis chef) → EN_ETUDE_DG → VALIDEE_DG → APPROUVE
     * false → EN_ATTENTE → (avis chef) → VALIDEE_DG → APPROUVE (pas de passage commission)
     *
     * Stockée en NUMBER(1) côté Oracle (pas le type BOOLEAN natif 23c).
     * SqlTypes.INTEGER (pas NUMERIC) : BooleanJavaType sait convertir vers
     * Integer (true→1, false→0), mais pas vers BigDecimal — NUMERIC déclenchait
     * "Could not convert 'java.lang.Boolean' to 'java.math.BigDecimal'" à l'insert.
     */
    @JdbcTypeCode(SqlTypes.INTEGER)
    @Column(name = "NEEDS_COMMISSION", nullable = false)
    @Builder.Default
    private boolean needsCommission = true;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "EN_ATTENTE";
    }
}