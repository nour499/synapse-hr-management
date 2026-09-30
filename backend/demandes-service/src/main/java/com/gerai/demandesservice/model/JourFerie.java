package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "JOUR_FERIE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourFerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "LIBELLE", nullable = false, length = 200)
    private String libelle;

    @Column(name = "DATE_JOUR", nullable = false)
    private String date;

    /** Déjà en BOOLEAN natif Oracle 23c — confirmé, pas de mapping explicite. */
    @Column(name = "RECURRENT")
    private Boolean recurrent;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;
}