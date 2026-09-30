package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMembreDTO {
    private String prenom;
    private String nom;
    private String poste;
    private String email;
    private String statut;
    private String telephone;
    private String departement;
    private String manager;
    private java.util.List<String> competences;
    private String photo;
}
