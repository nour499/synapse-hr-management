package com.gerai.projetsservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KillerQuestionDTO {
    private Long   id;
    private Long   jobId;
    private String question;
    private String expectedAnswer;
    private Integer displayOrder;
}
