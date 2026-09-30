package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceEmployeDTO {
    private Integer tachesCompletees;
    private Integer tauxCompletion;
    private Integer tempsResolutionBugs;
    private Integer documentationCompletion;
    private Integer codeQuality;
}
