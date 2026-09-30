package com.gerai.projetsservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DemandeRecrutementDTO {
    private Long   id;
    private String chefId;
    private String chefNom;
    private String chefPhoto;
    private String departement;
    private String titrePoste;
    private String role;
    private Integer nombrePostes;
    private String typeContrat;
    private String justification;
    private String urgence;
    private String statut;
    private LocalDateTime dateDemande;
    private String commentaireRh;
    private String traiteePar;
    private LocalDateTime dateTraitement;
    private Long   jobId;
}
