package com.gerai.demandesservice.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Corps de la requête POST /api/demandes/comite/{loanId}/vote.
 * Avis d'un membre de la commission de crédit.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionVoteRequest {

    /** "FAVORABLE" ou "DEFAVORABLE" (insensible à la casse). */
    private String vote;

    private String  commentaire;

    /** Suggestion de montant (avis favorable). */
    private BigDecimal montantSuggere;

    /** Suggestion de nombre de tranches (avis favorable). */
    private Integer nbTranchesSuggeres;
}
