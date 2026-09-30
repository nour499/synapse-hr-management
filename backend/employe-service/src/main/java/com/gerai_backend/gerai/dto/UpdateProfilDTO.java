package com.gerai_backend.gerai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfilDTO {
    private String telephone;
    private String emailPersonnel;
    private String dateNaissance;
    private String lieuNaissance;
    private String adresse;
    private String ville;
    private String codePostal;
    private String genre;
    private String situationFamiliale;
    private Integer nombreEnfants;
    private String nationalite;
    private String cin;
    private String contactUrgenceNom;
    private String contactUrgenceTel;
    private String contactUrgenceLien;
    private List<String> competences;
    private List<LangueDTO> langues;
    private String niveauEtudes;
    private String diplome;
    private String etablissement;
}
