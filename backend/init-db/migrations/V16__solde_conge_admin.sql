-- ═══════════════════════════════════════════════════════════════
-- Table SOLDE_CONGE_ADMIN — solde de congés administré par RH
-- (remplace le stockage en mémoire ConcurrentHashMap de SoldesCongesController)
-- Distinct du calcul dynamique de DemandeService.getCongesSolde()
-- (celui-ci se base sur LEAVE_REQUESTS + une limite fixe de 30 j).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE SOLDE_CONGE_ADMIN (
                                   ID                  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                   EMPLOYEE_ID         NUMBER NOT NULL,
                                   EMPLOYE_NOM         VARCHAR2(200),
                                   EMPLOYE_PHOTO       VARCHAR2(500),
                                   DEPARTEMENT         VARCHAR2(100),
                                   POSTE               VARCHAR2(200),
                                   ANNEE               NUMBER(4) NOT NULL,
                                   SOLDE_PRECEDENT     NUMBER DEFAULT 0,
                                   SOLDE_ACTUEL        NUMBER DEFAULT 0,
                                   SOLDE_TOTAL         NUMBER DEFAULT 0,
                                   REPORT_SOLDE        NUMBER DEFAULT 0,
                                   CONGES_UTILISES     NUMBER DEFAULT 0,
                                   CONGES_ACCEPTES     NUMBER DEFAULT 0,
                                   CONGES_REJETES      NUMBER DEFAULT 0,
                                   CONGES_EXPIRES      NUMBER DEFAULT 0,
                                   CONSTRAINT UQ_SOLDE_EMP_ANNEE UNIQUE (EMPLOYEE_ID, ANNEE)
);

COMMENT ON TABLE SOLDE_CONGE_ADMIN IS 'Solde de congés administré par RH, par employé et par année';