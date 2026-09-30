package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Carte de statistique affichée en tête d'un rapport.
 * Correspond exactement à {@code StatCard} côté Angular.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StatCardDTO {

    private String        label;
    private Object        value;   // number | string
    private String        icon;
    private String        color;
    private String        trend;
    private Boolean       trendUp;
}
