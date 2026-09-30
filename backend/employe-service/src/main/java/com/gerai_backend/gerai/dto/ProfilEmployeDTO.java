package com.gerai_backend.gerai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilEmployeDTO {

    private String id;                 // Keycloak id (sub)
    private Long dbId;                 // id base de données
    private String nom;
    private String prenom;
    private String nomComplet;
    private String photo;
    private String email;
    private String telephone;
    private String emailPersonnel;

    private String poste;
    private String departement;
    private String dateEmbauche;
    private String anciennete;
    private String managerNom;
    private String managerPhoto;
    private String typeContrat;        // CDI | CDD | INTERIM | STAGE
    private String dateFinContrat;
    private String periodeEssaiJusquau;
    private String categoriePro;
    private String echelon;
    private java.math.BigDecimal salaireBase;
    private String rib;
    private String banque;

    private String genre;              // M | F | ''
    private String situationFamiliale;
    private Integer nombreEnfants;
    private String nationalite;
    private String cin;
    private String cnss;

    private String dateNaissance;
    private String lieuNaissance;
    private String adresse;
    private String ville;
    private String codePostal;

    private String contactUrgenceNom;
    private String contactUrgenceTel;
    private String contactUrgenceLien;

    private String niveauEtudes;
    private String diplome;
    private String etablissement;
    private List<String> competences;
    private List<LangueDTO> langues;
    private List<CertificationDTO> certifications;

    private Integer congesRestants;
    private Integer congesPris;
    private Integer congesTotal;
    private Integer tachesCompletes;
    private Integer tachesEnCours;
    private Integer tauxPresence;
    private Integer objectifsAtteints;
    private Integer formationsSuivies;
    private Integer formationsTotal;
}
