package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * Entité mappée sur GERAI_USER.DEPARTS_EMPLOYES.
 *
 * Remplace le stockage en mémoire (ConcurrentHashMap) de l'ancien
 * DepartsController — les départs d'employés sont désormais persistés
 * réellement et survivent au redémarrage du service.
 *
 * Statuts valides (CHECK Oracle CK_DEPART_STATUT) :
 *   EN_COURS | FINALISE | ANNULE
 */
@Entity
@Table(name = "DEPARTS_EMPLOYES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Depart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DEPART_ID")
    private Long id;

    @Column(name = "EMPLOYEE_ID")
    private Long employeId;

    @Column(name = "EMPLOYE_NOM", length = 200)
    private String employeNom;

    @Column(name = "EMPLOYE_POSTE", length = 200)
    private String employePoste;

    @Column(name = "EMPLOYE_PHOTO", length = 500)
    private String employePhoto;

    @Column(name = "EMPLOYE_DEPT", length = 100)
    private String employeDept;

    @Column(name = "DATE_DEPART", length = 20)
    private String dateDepart;

    @Column(name = "TYPE_DEPART", length = 50)
    private String typeDepart;

    @Column(name = "RAISON", length = 500)
    private String raison;

    /** Valeurs : EN_COURS | FINALISE | ANNULE */
    @Column(name = "STATUT", nullable = false, length = 30)
    @Builder.Default
    private String statut = "EN_COURS";

    @Column(name = "NOTES", length = 1000)
    private String notes;

    @Column(name = "CREATED_AT", nullable = false, updatable = false, length = 50)
    private String createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now(ZoneOffset.UTC).toString();
        }
        if (this.statut == null) {
            this.statut = "EN_COURS";
        }
    }
}