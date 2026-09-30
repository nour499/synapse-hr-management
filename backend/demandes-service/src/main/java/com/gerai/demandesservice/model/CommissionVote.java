package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité mappée sur GERAI.LOAN_COMMISSION_VOTES.
 * Stocke les avis des membres de la commission de crédit
 * (FAVORABLE / DEFAVORABLE) pour chaque demande de prêt.
 */
@Entity
@Table(name = "LOAN_COMMISSION_VOTES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommissionVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VOTE_ID")
    private Long voteId;

    /** FK → LOAN_REQUESTS.request_id */
    @Column(name = "LOAN_REQUEST_ID", nullable = false)
    private Long loanId;

    /** employee_id Oracle du membre de la commission. */
    @Column(name = "MEMBER_ID")
    private Long memberId;

    /** Nom complet du membre (figé au moment du vote). */
    @Column(name = "MEMBER_NOM", length = 200)
    private String memberNom;

    /** Avis : FAVORABLE | DEFAVORABLE */
    @Column(name = "VOTE", nullable = false, length = 20)
    private String vote;

    @Column(name = "COMMENTAIRE", length = 500)
    private String commentaire;

    /** Montant suggéré par le membre (avis favorable). */
    @Column(name = "MONTANT_SUGGERE")
    private BigDecimal montantSuggere;

    /** Nombre de tranches suggéré. */
    @Column(name = "NB_TRANCHES_SUGGERE")
    private Integer nbTranchesSuggeres;

    @Column(name = "VOTED_AT", nullable = false, updatable = false)
    private LocalDateTime votedAt;

    @PrePersist
    protected void onCreate() {
        this.votedAt = LocalDateTime.now();
    }
}
