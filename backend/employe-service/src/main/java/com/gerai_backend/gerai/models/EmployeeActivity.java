package com.gerai_backend.gerai.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEE_ACTIVITES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACTIVITE_ID")
    private Long id;

    /** Keycloak user id (sub) de l'employé */
    @Column(name = "EMPLOYE_ID", nullable = false, length = 255)
    private String employeId;

    @Column(name = "TITRE", nullable = false, length = 255)
    private String titre;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "DATE_ACTIVITE", nullable = false)
    private LocalDateTime date;

    @Column(name = "TYPE", length = 30)
    private String type;          // demande | tache | formation | document | conge | presence

    @Column(name = "STATUT", length = 30)
    private String statut;        // validee | refusee | en_attente | terminee | en_cours

    @Column(name = "BADGE", length = 50)
    private String badge;

    @Column(name = "ICONE", length = 50)
    private String icone;

    @Column(name = "LIEN", length = 500)
    private String lien;
}