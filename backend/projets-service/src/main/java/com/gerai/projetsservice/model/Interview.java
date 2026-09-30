package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entretien planifié pour un candidat. Correspond au modèle Interview du frontend.
 * date / heureDebut / heureFin sont conservés en texte (yyyy-MM-dd / HH:mm) pour
 * coller au format attendu par le frontend.
 */
@Entity
@Table(name = "ENTRETIENS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENTRETIEN_ID")
    private Long interviewId;

    @Column(name = "CANDIDAT_ID")
    private Long candidatId;

    @Column(name = "CANDIDAT_NOM", length = 100)
    private String candidatNom;

    @Column(name = "CANDIDAT_PRENOM", length = 100)
    private String candidatPrenom;

    @Column(name = "CANDIDAT_PHOTO", length = 500)
    private String candidatPhoto;

    @Column(name = "JOB_ID")
    private Long jobId;

    @Column(name = "JOB_TITRE", length = 200)
    private String jobTitre;

    @Column(name = "DEPARTEMENT", length = 100)
    private String departement;

    @Column(name = "TYPE", length = 20)
    private String type;

    @Column(name = "STATUT", length = 20)
    @Builder.Default
    private String statut = "PLANIFIE";

    @Column(name = "DECISION", length = 20)
    @Builder.Default
    private String decision = "EN_ATTENTE";

    @Column(name = "DATE_ENT", length = 20)
    private String date;

    @Column(name = "HEURE_DEBUT", length = 10)
    private String heureDebut;

    @Column(name = "HEURE_FIN", length = 10)
    private String heureFin;

    @Column(name = "LIEU", length = 200)
    private String lieu;

    @Column(name = "LIEN_VISIO", length = 500)
    private String lienVisio;

    @Column(name = "INTERVIEWEUR", length = 200)
    private String intervieweur;

    @Column(name = "INTERVIEWEUR_PHOTO", length = 500)
    private String intervieweurPhoto;

    @Column(name = "NOTE_GLOBALE")
    private Double noteGlobale;

    @Lob
    @Column(name = "COMMENTAIRE")
    private String commentaire;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.statut == null) this.statut = "PLANIFIE";
        if (this.decision == null) this.decision = "EN_ATTENTE";
    }
}
