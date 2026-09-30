package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Facteur de risque d'attrition.
 * Correspond à {@code RiskFactor} côté Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskFactorDTO {

    private String label;
    private int    impact;   // points contribués au score (0–25)
    private String icon;     // tabler-icon class e.g. "ti ti-calendar-off"
}
