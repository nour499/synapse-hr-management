package com.gerai.projetsservice.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScreeningQuestionDTO {
    private Long   id;
    private Long   jobId;
    private String question;
    private String type;
    private List<String> options;
    private String correctAnswer;
    private Integer weight;
    private Integer displayOrder;
}
