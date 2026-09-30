package com.gerai.projetsservice.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScreeningBundleDTO {
    private List<KillerQuestionDTO> killerQuestions;
    private List<ScreeningQuestionDTO> screeningQuestions;
}
