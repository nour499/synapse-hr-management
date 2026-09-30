package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "GRILLE_SALARIALE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrilleSalariale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NIVEAU", nullable = false, length = 50)
    private String niveau;

    @Column(name = "INTITULE", nullable = false, length = 200)
    private String intitule;

    @Column(name = "SALAIRE_MIN")
    private Double salaireMin;

    @Column(name = "SALAIRE_MAX")
    private Double salaireMax;

    @Column(name = "SALAIRE_BASE")
    private Double salaireBase;

    @Column(name = "DEVISE", length = 10)
    private String devise;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "GRILLE_SALARIALE_AVANTAGES",
            joinColumns = @JoinColumn(name = "GRILLE_ID")
    )
    @Column(name = "AVANTAGE")
    private List<String> avantages;
}