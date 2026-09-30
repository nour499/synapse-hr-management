package com.gerai.demandesservice.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entité mappée sur GERAI_USER.SOLDE_CONGE_ADMIN.
 *
 * Solde de congés administré manuellement par RH — distinct du calcul
 * dynamique effectué par DemandeService.getCongesSolde() (celui-ci se
 * base sur LEAVE_REQUESTS + une limite annuelle fixe de 30 jours).
 *
 * Remplace le stockage en mémoire (ConcurrentHashMap) de l'ancien
 * SoldesCongesController.
 */
@Entity
@Table(name = "SOLDE_CONGE_ADMIN",
        uniqueConstraints = @UniqueConstraint(
                name = "UQ_SOLDE_EMP_ANNEE",
                columnNames = {"EMPLOYEE_ID", "ANNEE"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SoldeCongeAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Integer employeId;

    @Column(name = "EMPLOYE_NOM", length = 200)
    private String employeNom;

    @Column(name = "EMPLOYE_PHOTO", length = 500)
    private String employePhoto;

    @Column(name = "DEPARTEMENT", length = 100)
    private String departement;

    @Column(name = "POSTE", length = 200)
    private String poste;

    @Column(name = "ANNEE", nullable = false)
    private Integer annee;

    @Column(name = "SOLDE_PRECEDENT")
    @Builder.Default
    private Integer soldePrecedent = 0;

    @Column(name = "SOLDE_ACTUEL")
    @Builder.Default
    private Integer soldeActuel = 0;

    @Column(name = "SOLDE_TOTAL")
    @Builder.Default
    private Integer soldeTotal = 0;

    @Column(name = "REPORT_SOLDE")
    @Builder.Default
    private Integer reportSolde = 0;

    @Column(name = "CONGES_UTILISES")
    @Builder.Default
    private Integer congesUtilises = 0;

    @Column(name = "CONGES_ACCEPTES")
    @Builder.Default
    private Integer congesAcceptes = 0;

    @Column(name = "CONGES_REJETES")
    @Builder.Default
    private Integer congesRejetes = 0;

    @Column(name = "CONGES_EXPIRES")
    @Builder.Default
    private Integer congesExpires = 0;
}