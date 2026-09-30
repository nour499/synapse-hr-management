package com.gerai_backend.gerai.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité alignée sur la table EMPLOYEES de V1__core_hr.sql.
 *
 * Changements vs l'ancienne version :
 *  - id UUID (@UuidGenerator)       → employee_id NUMBER IDENTITY (Long)
 *  - keycloak_user_id VARCHAR2(36)  → user_id VARCHAR2(255)
 *  - first_name/last_name length 50 → 100
 *  - job_title (inexistant en DB)   → supprimé (est dans POSITIONS)
 *  - salary (inexistant en DB)      → supprimé (est dans CONTRACTS)
 *  - Ajout : employee_code, dept_id, position_id, manager_id, status
 *  - Ajout : created_at, updated_at
 */
@Entity
@Table(name = "EMPLOYEES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    /* ── PK ────────────────────────────────────────────── */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EMPLOYEE_ID", nullable = false, updatable = false)
    private Long id;

    /* ── Lien Keycloak ────────────────────────────────── */

    /** UUID Keycloak. Colonne : USER_ID VARCHAR2(255) UNIQUE NOT NULL */
    @Column(name = "USER_ID", nullable = false, unique = true, length = 255)
    private String keycloakUserId;

    /* ── Matricule RH ─────────────────────────────────── */

    /** Ex : EMP-0042. Généré dans EmployeeService.createEmployee(). */
    @Column(name = "EMPLOYEE_CODE", nullable = false, unique = true, length = 30)
    private String employeeCode;

    /* ── Identité ─────────────────────────────────────── */

    @Column(name = "FIRST_NAME", nullable = false, length = 100)
    private String firstName;

    @Column(name = "LAST_NAME", nullable = false, length = 100)
    private String lastName;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "PHONE", length = 30)
    private String phone;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate;

    @Column(name = "NATIONAL_ID", unique = true, length = 50)
    private String nationalId;

    /** M | F | AUTRE */
    @Column(name = "GENDER", length = 10)
    private String gender;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Column(name = "PHOTO_URL", length = 500)
    private String photoUrl;

    /** Nom complet affiché (utile si firstName/lastName absents) */
    @Column(name = "FULL_NAME", length = 200)
    private String fullName;

    /* ── Rattachement organisationnel ─────────────────── */

    /** FK → DEPARTMENTS.dept_id. Obligatoire. */
    @Column(name = "DEPT_ID", nullable = false)
    private Long deptId;

    /** FK → POSITIONS.position_id. Obligatoire. */
    @Column(name = "POSITION_ID", nullable = false)
    private Long positionId;

    /** FK → EMPLOYEES.employee_id (auto-référence). Optionnel. */
    @Column(name = "MANAGER_ID")
    private Long managerId;

    /* ── Contrat / Statut ─────────────────────────────── */

    @Column(name = "HIRE_DATE", nullable = false)
    private LocalDate hireDate;

    /**
     * ACTIF | INACTIF | SUSPENDU | DEMISSION
     * Contrainte CHECK dans V1__core_hr.sql.
     */
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIF";

    /* ── Audit ────────────────────────────────────────── */

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /* ── Champs profil employé (riche) ────────────────── */

    @Column(name = "EMAIL_PERSONNEL", length = 255)
    private String emailPersonnel;

    @Column(name = "LIEU_NAISSANCE", length = 200)
    private String lieuNaissance;

    @Column(name = "VILLE", length = 200)
    private String ville;

    @Column(name = "CODE_POSTAL", length = 20)
    private String codePostal;

    @Column(name = "SITUATION_FAMILIALE", length = 50)
    private String situationFamiliale;

    @Column(name = "NOMBRE_ENFANTS")
    private Integer nombreEnfants;

    @Column(name = "NATIONALITE", length = 100)
    private String nationalite;

    @Column(name = "CIN", length = 50)
    private String cin;

    @Column(name = "CONTACT_URGENCE_NOM", length = 200)
    private String contactUrgenceNom;

    @Column(name = "CONTACT_URGENCE_TEL", length = 50)
    private String contactUrgenceTel;

    @Column(name = "CONTACT_URGENCE_LIEN", length = 100)
    private String contactUrgenceLien;

    @Column(name = "NIVEAU_ETUDES", length = 100)
    private String niveauEtudes;

    @Column(name = "DIPLOME", length = 200)
    private String diplome;

    @Column(name = "ETABLISSEMENT", length = 200)
    private String etablissement;

    @Column(name = "TYPE_CONTRAT", length = 20)
    private String typeContrat;

    @Column(name = "DATE_FIN_CONTRAT")
    private LocalDate dateFinContrat;

    @Column(name = "PERIODE_ESSAI_JUSQUAU")
    private LocalDate periodeEssaiJusquau;

    @Column(name = "CATEGORIE_PRO", length = 100)
    private String categoriePro;

    @Column(name = "ECHELON", length = 50)
    private String echelon;

    @Column(name = "SALAIRE_BASE")
    private java.math.BigDecimal salaireBase;

    @Column(name = "RIB", length = 100)
    private String rib;

    @Column(name = "BANQUE", length = 100)
    private String banque;

    @Column(name = "LIEU_TRAVAIL", length = 20)
    private String lieuTravail;

    @Column(name = "COMPETENCES", length = 2000)
    private String competences;   // séparées par virgule

    @Column(name = "LANGUES", length = 2000)
    private String langues;       // JSON ou séparé par virgule

    @Column(name = "CERTIFICATIONS", length = 2000)
    private String certifications;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "ACTIF";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}