-- ═══════════════════════════════════════════════════════════════
-- Table DEPARTS_EMPLOYES — persistance réelle des départs d'employés
-- (remplace le stockage en mémoire ConcurrentHashMap de DepartsController)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE DEPARTS_EMPLOYES (
                                  DEPART_ID       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                  EMPLOYEE_ID     NUMBER,
                                  EMPLOYE_NOM     VARCHAR2(200),
                                  EMPLOYE_POSTE   VARCHAR2(200),
                                  EMPLOYE_PHOTO   VARCHAR2(500),
                                  EMPLOYE_DEPT    VARCHAR2(100),
                                  DATE_DEPART     VARCHAR2(20),
                                  TYPE_DEPART     VARCHAR2(50),
                                  RAISON          VARCHAR2(500),
                                  STATUT          VARCHAR2(30) DEFAULT 'EN_COURS' NOT NULL,
                                  NOTES           VARCHAR2(1000),
                                  CREATED_AT      VARCHAR2(50) NOT NULL,
                                  CONSTRAINT CK_DEPART_STATUT CHECK (STATUT IN ('EN_COURS','FINALISE','ANNULE'))
);

COMMENT ON TABLE DEPARTS_EMPLOYES IS 'Départs d''employés (démission, licenciement, retraite, etc.)';