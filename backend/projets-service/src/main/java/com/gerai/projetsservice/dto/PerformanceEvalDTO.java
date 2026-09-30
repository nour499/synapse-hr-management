package com.gerai.projetsservice.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO pour l'évaluation de la performance.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceEvalDTO {

    private Long    evalId;
    private Long    employeeId;
    private Long    evaluatorId;
    private Integer periodYear;
    private String  periodQuarter;
    private Double  score;
    private String  strengths;
    private String  improvements;
    private String  comments;
    private String  status;
    private LocalDateTime createdAt;
}
