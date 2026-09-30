package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "COMPETENCE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOM", nullable = false, length = 150)
    private String nom;

    @Column(name = "CATEGORIE", length = 100)
    private String categorie;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    /** Déjà en BOOLEAN natif Oracle 23c — confirmé, pas de mapping explicite. */
    @Column(name = "ACTIF")
    private Boolean actif;
}