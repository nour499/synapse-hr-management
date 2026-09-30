package com.gerai.projetsservice.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CvScoreResultDTO {
    private Double score;
    private String niveau;
    private List<String> competencesMatchees;
    private List<String> competencesManquantes;
    private List<String> pointsForts;
    private String recommandation;
}
