package com.gerai_backend.gerai.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEmployeDTO {
    private Long id;
    private String employeId;
    private String nom;
    private String type;          // pdf | excel | word | image
    private String categorie;     // personnel | contractuel | administratif | formation
    private String taille;
    private Long tailleBytes;
    private String dateAjout;
    private String dateModification;
    private String url;
    private String description;
}
