package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité mappée sur GERAI_USER.DEMANDES_ACTIFS.
 *
 * Remplace le stockage en mémoire (ConcurrentHashMap) de l'ancien
 * ActifsController — les demandes d'actifs sont désormais persistées
 * réellement et survivent au redémarrage du service.
 *
 * type    : REPARATION | RENOUVELLEMENT
 * urgence : NORMALE | URGENTE
 * statut  : EN_ATTENTE | EN_COURS | RESOLUE | REJETEE
 */
@Entity
@Table(name = "DEMANDES_ACTIFS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeActif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DEMANDE_ACTIF_ID")
    private Long id;

    @Column(name = "ACTIF_ID")
    private Long actifId;

    @Column(name = "ACTIF_NOM", length = 200)
    private String actifNom;

    @Column(name = "ACTIF_TYPE", length = 50)
    private String actifType;

    @Column(name = "EMPLOYEE_ID")
    private Long employeId;

    @Column(name = "EMPLOYE_NOM", length = 200)
    private String employeNom;

    /** REPARATION | RENOUVELLEMENT */
    @Column(name = "TYPE", length = 30)
    private String type;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    /** NORMALE | URGENTE */
    @Column(name = "URGENCE", nullable = false, length = 20)
    @Builder.Default
    private String urgence = "NORMALE";

    /** EN_ATTENTE | EN_COURS | RESOLUE | REJETEE */
    @Column(name = "STATUT", nullable = false, length = 20)
    @Builder.Default
    private String statut = "EN_ATTENTE";

    @Column(name = "DATE_CREATION", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "DATE_TRAITEMENT")
    private LocalDateTime dateTraitement;

    @Column(name = "COMMENTAIRE_ADMIN", length = 1000)
    private String commentaireAdmin;

    @PrePersist
    protected void onCreate() {
        if (this.dateCreation == null) {
            this.dateCreation = LocalDateTime.now();
        }
        if (this.urgence == null) this.urgence = "NORMALE";
        if (this.statut == null) this.statut = "EN_ATTENTE";
    }
}