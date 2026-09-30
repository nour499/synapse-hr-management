package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Demande de recrutement émise par un chef de projet et traitée par le RH/Admin.
 * Correspond au modèle DemandeRecrutement du frontend.
 * chefId stocke l'email (string) du chef, tel que fourni par le frontend.
 */
@Entity
@Table(name = "DEMANDES_RECRUTEMENT")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecrutementDemande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DEMANDE_ID")
    private Long demandeId;

    @Column(name = "CHEF_ID", length = 200)
    private String chefId;

    @Column(name = "CHEF_NOM", length = 200)
    private String chefNom;

    @Column(name = "DEPARTEMENT", length = 100)
    private String departement;

    @Column(name = "TITRE_POSTE", length = 200)
    private String titrePoste;

    @Column(name = "ROLE", length = 30)
    private String role;

    @Column(name = "NOMBRE_POSTES")
    private Integer nombrePostes;

    @Column(name = "TYPE_CONTRAT", length = 30)
    private String typeContrat;

    @Lob
    @Column(name = "JUSTIFICATION")
    private String justification;

    @Column(name = "URGENCE", length = 20)
    @Builder.Default
    private String urgence = "NORMALE";

    @Column(name = "STATUT", nullable = false, length = 20)
    @Builder.Default
    private String statut = "EN_ATTENTE";

    @Column(name = "DATE_DEMANDE")
    private LocalDateTime dateDemande;

    @Lob
    @Column(name = "COMMENTAIRE_RH")
    private String commentaireRh;

    @Column(name = "TRAITEE_PAR", length = 200)
    private String traiteePar;

    @Column(name = "DATE_TRAITEMENT")
    private LocalDateTime dateTraitement;

    @Column(name = "JOB_ID")
    private Long jobId;

    @PrePersist
    protected void onCreate() {
        if (this.dateDemande == null) this.dateDemande = LocalDateTime.now();
        if (this.statut == null) this.statut = "EN_ATTENTE";
    }
}
