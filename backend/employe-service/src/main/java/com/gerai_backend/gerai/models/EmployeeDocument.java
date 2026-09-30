package com.gerai_backend.gerai.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEE_DOCUMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DOC_ID")
    private Long id;

    /** Keycloak user id (sub) du propriétaire du document */
    @Column(name = "EMPLOYE_ID", nullable = false, length = 255)
    private String employeId;

    @Column(name = "NOM", nullable = false, length = 255)
    private String nom;

    @Column(name = "TYPE", length = 20)
    private String type;          // pdf | excel | word | image

    @Column(name = "CATEGORIE", length = 30)
    private String categorie;     // personnel | contractuel | administratif | formation

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "TAILLE", length = 50)
    private String taille;

    @Column(name = "TAILLE_BYTES")
    private Long tailleBytes;

    @Column(name = "URL", length = 1000)
    private String url;

    @Column(name = "DATE_AJOUT", nullable = false)
    private LocalDateTime dateAjout;

    @Column(name = "DATE_MODIFICATION")
    private LocalDateTime dateModification;
}
