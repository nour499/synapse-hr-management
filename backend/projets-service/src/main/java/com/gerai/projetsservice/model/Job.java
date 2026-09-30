package com.gerai.projetsservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Offre d'emploi (Job). Correspond au modèle Job du frontend.
 * Les questions killer/screening sont gérées via des entités liées (OneToMany).
 */
@Entity
@Table(name = "JOBS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JOB_ID")
    private Long jobId;

    @Column(name = "TITRE", length = 200, nullable = false)
    private String titre;

    @Column(name = "STATUT", length = 20)
    @Builder.Default
    private String statut = "OUVERT";

    @Column(name = "DATE_PUBLICATION")
    private LocalDateTime datePublication;

    @Column(name = "ROLE", length = 30)
    private String role;

    @Column(name = "POSTES")
    private Integer postes;

    @Column(name = "DEPARTEMENT", length = 100)
    private String departement;

    @Column(name = "TYPE_CONTRAT", length = 30)
    private String typeContrat;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "LIEU", length = 200)
    private String lieu;

    @JsonIgnore
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobKillerQuestion> killerQuestions = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobScreeningQuestion> screeningQuestions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.datePublication == null) this.datePublication = LocalDateTime.now();
        if (this.statut == null) this.statut = "OUVERT";
    }
}
