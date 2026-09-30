package com.gerai.projetsservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CandidateDTO {
    private Long   id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String photo;
    private Long   jobId;
    private String jobTitre;
    private String departement;
    private String statut;
    private LocalDateTime datePostulation;
    private Integer experience;
    private List<String> competences;
    private Boolean shortliste;
    private String cvUrl;
    private String linkedin;
    private String localisation;
    private String noteRecruteur;
    private Double score;
    private Double screeningScore;
}
