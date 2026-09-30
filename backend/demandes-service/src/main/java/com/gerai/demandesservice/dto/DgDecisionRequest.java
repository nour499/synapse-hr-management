package com.gerai.demandesservice.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Corps de la requête PUT /api/demandes/credit/{id}/decision-dg.
 * Décision finale de la Direction RH sur un crédit.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DgDecisionRequest {

    /** true = approuver, false = refuser. */
    private boolean approuve;

    /** Montant accordé (peut différer du montant demandé). */
    private BigDecimal montantApprouve;

    /** Nombre de tranches / mensualités accordées. */
    private Integer nbTranches;

    /** Commentaire / motif de la décision. */
    private String commentaire;
}
