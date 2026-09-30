package com.gerai.projetsservice.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobDTO {
    private Long   id;
    private String titre;
    private String statut;
    private LocalDate datePublication;
    private String role;
    private Integer postes;
    private String departement;
    private String typeContrat;
    private String description;
    private String lieu;
}