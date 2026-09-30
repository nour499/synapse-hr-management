package com.gerai.demandesservice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Avis de commission renvoyé au frontend (ComiteVoteInfo).
 * Noms de champs alignés sur le modèle Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionVoteResponse {

    private Long      voteId;
    private Long      loanId;
    private Long      memberId;
    private String    memberNom;
    private String    vote;          // FAVORABLE | DEFAVORABLE
    private String    commentaire;
    private BigDecimal montantSuggere;
    private Integer   nbTranchesSuggeres;
    private LocalDateTime votedAt;
}
