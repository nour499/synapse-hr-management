package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Stats d'attrition par département.
 * Correspond à {@code DeptAttritionStat} côté Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeptAttritionStatDTO {

    private String departement;
    private double avgScore;
    private int    risqueEleve;
    private int    total;
}
