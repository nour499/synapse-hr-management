-- ═══════════════════════════════════════════════════════════════
-- Tables ACTIFS et DEMANDES_ACTIFS — persistance réelle
-- (remplace le stockage en mémoire ConcurrentHashMap d'ActifsController)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ACTIFS (
                        ACTIF_ID          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        NOM               VARCHAR2(200) NOT NULL,
                        CATEGORIE         VARCHAR2(50),
                        TYPE              VARCHAR2(50),
                        MARQUE            VARCHAR2(100),
                        MODELE            VARCHAR2(100),
                        NUMERO_SERIE      VARCHAR2(100),
                        DESCRIPTION       VARCHAR2(1000),
                        VALEUR            NUMBER(12,2),
                        DATE_ACQUISITION  DATE,
                        DATE_ATTRIBUTION  DATE,
                        DATE_EXPIRATION   DATE,
                        STATUT            VARCHAR2(30) DEFAULT 'DISPONIBLE' NOT NULL,
                        EMPLOYEE_ID       NUMBER,
                        EMPLOYE_NOM       VARCHAR2(200),
                        CONSTRAINT CK_ACTIF_STATUT CHECK (STATUT IN ('DISPONIBLE','ATTRIBUE','EN_MAINTENANCE','HORS_SERVICE'))
);

CREATE TABLE DEMANDES_ACTIFS (
                                 DEMANDE_ACTIF_ID  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                 ACTIF_ID          NUMBER,
                                 ACTIF_NOM         VARCHAR2(200),
                                 ACTIF_TYPE        VARCHAR2(50),
                                 EMPLOYEE_ID       NUMBER,
                                 EMPLOYE_NOM       VARCHAR2(200),
                                 TYPE              VARCHAR2(30),
                                 DESCRIPTION       VARCHAR2(1000),
                                 URGENCE           VARCHAR2(20) DEFAULT 'NORMALE' NOT NULL,
                                 STATUT            VARCHAR2(20) DEFAULT 'EN_ATTENTE' NOT NULL,
                                 DATE_CREATION     TIMESTAMP NOT NULL,
                                 DATE_TRAITEMENT   TIMESTAMP,
                                 COMMENTAIRE_ADMIN VARCHAR2(1000),
                                 CONSTRAINT CK_DEMANDE_ACTIF_TYPE    CHECK (TYPE IN ('REPARATION','RENOUVELLEMENT')),
                                 CONSTRAINT CK_DEMANDE_ACTIF_URGENCE CHECK (URGENCE IN ('NORMALE','URGENTE')),
                                 CONSTRAINT CK_DEMANDE_ACTIF_STATUT  CHECK (STATUT IN ('EN_ATTENTE','EN_COURS','RESOLUE','REJETEE'))
);

COMMENT ON TABLE ACTIFS IS 'Actifs matériels et numériques de l''entreprise (assignés aux collaborateurs)';
COMMENT ON TABLE DEMANDES_ACTIFS IS 'Demandes de réparation/renouvellement d''actifs';