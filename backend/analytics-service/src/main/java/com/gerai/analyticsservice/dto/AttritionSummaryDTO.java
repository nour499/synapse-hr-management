package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

/**
 * Résumé global de l'attrition.
 * Correspond à {@code AttritionSummary} côté Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttritionSummaryDTO {

    private int                              totalEmployes;
    private int                              risqueEleve;
    private int                              risqueMoyen;
    private int                              risqueFaible;
    private double                           avgScore;
    private List<DeptAttritionStatDTO>      deptStats;
}
