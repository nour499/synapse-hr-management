package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembreEquipeDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String poste;
    private String email;
    private String photo;
    private Boolean present;
    private String keycloakId;
    private String statut;        // ACTIF | CONGE | INACTIF
    private String dateEmbauche;
    private String manager;
    private java.util.List<String> competences;
    private String departement;
    private String telephone;
    private String anciennete;
    private Integer congesRestants;
    private Integer tachesCompletes;
}
