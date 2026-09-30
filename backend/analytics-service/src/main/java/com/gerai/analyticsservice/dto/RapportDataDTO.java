package com.gerai.analyticsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Payload retourné par GET /api/rapports/{type}.
 * Correspond exactement à {@code RapportData} côté Angular
 * ({@code stats: StatCard[]}, {@code rows: RapportRow[]}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RapportDataDTO {

    private List<StatCardDTO>        stats;
    private List<Map<String, Object>> rows;
}
