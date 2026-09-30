
-- ═══════════════════════════════════════════════════════════
--  GerAI — V11__evaluations.sql
--  Module d'évaluation (espace Admin RH / Chef / Employé)
--  Tables : EVAL_CAMPAGNES, EVALUATIONS
-- ═══════════════════════════════════════════════════════════


-- ─── EVAL_CAMPAGNES ──────────────────────────────────────

CREATE TABLE EVAL_CAMPAGNES (
    campagne_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titre             VARCHAR2(200) NOT NULL,
    periode           VARCHAR2(6),
    annee             NUMBER(4),
    date_debut        DATE,
    date_fin          DATE,
    statut            VARCHAR2(20) DEFAULT 'BROUILLON' NOT NULL
                      CONSTRAINT ck_evaluations_camp_statut
                      CHECK (statut IN (
                          'BROUILLON',
                          'PLANIFIEE',
                          'ACTIVE',
                          'CLOTUREE'
                      )),
    cree_par          VARCHAR2(200),
    description       CLOB,
    departements_json CLOB,
    created_at        TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);


-- ─── EVALUATIONS ─────────────────────────────────────────

CREATE TABLE EVALUATIONS (
    eval_id                    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campagne_id                NUMBER,
    campagne_titre             VARCHAR2(200),
    periode                    VARCHAR2(6),
    annee                      NUMBER(4),

    employe_id                 NUMBER NOT NULL,
    employe_nom                VARCHAR2(100),
    employe_prenom             VARCHAR2(100),
    employe_poste              VARCHAR2(100),
    departement                VARCHAR2(100),

    chef_id                    NUMBER,
    chef_nom                   VARCHAR2(100),

    statut                     VARCHAR2(20) DEFAULT 'EN_ATTENTE' NOT NULL
                               CONSTRAINT ck_evaluations_statut
                               CHECK (statut IN (
                                   'EN_ATTENTE',
                                   'AUTO_SOUMISE',
                                   'VALIDEE_CHEF',
                                   'VALIDEE_RH',
                                   'CLOTUREE'
                               )),

    taux_presence              NUMBER(5,2) DEFAULT 100,
    formations_realisees      NUMBER(3) DEFAULT 0,
    taches_completees         NUMBER(5) DEFAULT 0,
    total_taches              NUMBER(5) DEFAULT 0,

    auto_eval_json             CLOB,
    date_auto_eval             TIMESTAMP,

    eval_chef_json             CLOB,
    date_eval_chef             TIMESTAMP,

    recommandation             VARCHAR2(20),
    commentaire_recommandation CLOB,

    score_objectifs            NUMBER(5,2),
    score_competences          NUMBER(5,2),
    score_formations           NUMBER(5,2),
    score_presence             NUMBER(5,2),
    score_final                NUMBER(5,2),

    mention                    VARCHAR2(20),
    score_ajuste               NUMBER(5,2),

    commentaire_rh             CLOB,
    date_validation_rh         TIMESTAMP,
    validee_par_rh             VARCHAR2(100),

    created_at                 TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT fk_evaluations_campagne
        FOREIGN KEY (campagne_id)
        REFERENCES EVAL_CAMPAGNES(campagne_id),

    CONSTRAINT fk_evaluations_employe
        FOREIGN KEY (employe_id)
        REFERENCES EMPLOYEES(employee_id),

    CONSTRAINT fk_evaluations_chef
        FOREIGN KEY (chef_id)
        REFERENCES EMPLOYEES(employee_id)
);


-- ─── INDEX ───────────────────────────────────────────────

CREATE INDEX idx_evaluations_campagne
    ON EVALUATIONS(campagne_id);

CREATE INDEX idx_evaluations_employe
    ON EVALUATIONS(employe_id);

CREATE INDEX idx_evaluations_chef
    ON EVALUATIONS(chef_id);

CREATE INDEX idx_evaluations_statut
    ON EVALUATIONS(statut);

CREATE INDEX idx_eval_campagnes_statut
    ON EVAL_CAMPAGNES(statut);
