package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatistiquesEmployeDTO {
    private Integer tauxPresence;
    private Integer objectifsAtteints;
    private Integer formationsSuivies;
    private Integer formationsTotal;
    private Integer tachesCompletes;
    private Integer tachesTotal;
    private Integer congesRestants;
    private Integer congesTotal;
}
