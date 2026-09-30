package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TYPE_CONGE")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TypeConge {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "ACTIF")
    private Integer actif;

    @Column(name = "CODE", length = 50)
    private String code;

    @Column(name = "COULEUR", length = 10)
    private String couleur;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "ICONE", length = 100)
    private String icone;

    @Column(name = "LIBELLE", length = 100)
    private String libelle;

    @Column(name = "NOMBRE_JOURS")
    private Integer nombreJours;

    @Column(name = "PAYE")
    private Integer paye;
}