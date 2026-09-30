-- ═══════════════════════════════════════════════════════════
--  GerAI — V14__recruitment.sql
--  Module de recrutement (projets-service, port 8087)
--  Tables  : JOBS, DEMANDES_RECRUTEMENT, CANDIDATS,
--            ENTRETIENS, JOB_KILLER_QUESTIONS, JOB_SCREENING_QUESTIONS
--  Note    : Les champs texte (date/heure d'entretien) sont
--            volontairement VARCHAR2 pour coller au format
--            attendu par le frontend (yyyy-MM-dd / HH:mm).
-- ═══════════════════════════════════════════════════════════

-- ─── JOBS ────────────────────────────────────────────────
CREATE TABLE JOBS (
                      job_id            NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                      titre             VARCHAR2(200)  NOT NULL,
                      statut            VARCHAR2(20)   DEFAULT 'OUVERT' NOT NULL
                      CONSTRAINT ck_job_statut
                      CHECK (statut IN ('OUVERT','CLOTURE','ARCHIVE','BROUILLON')),
                      date_publication  TIMESTAMP,
                      role              VARCHAR2(30),
                      postes            NUMBER(3),
                      departement       VARCHAR2(100),
                      type_contrat      VARCHAR2(30),
                      description       CLOB,
                      lieu              VARCHAR2(200)
);

-- ─── DEMANDES_RECRUTEMENT ────────────────────────────────
CREATE TABLE DEMANDES_RECRUTEMENT (
                                      demande_id        NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                      chef_id           VARCHAR2(200),
                                      chef_nom          VARCHAR2(200),
                                      departement       VARCHAR2(100),
                                      titre_poste       VARCHAR2(200),
                                      role              VARCHAR2(30),
                                      nombre_postes     NUMBER(3),
                                      type_contrat      VARCHAR2(30),
                                      justification     CLOB,
                                      urgence           VARCHAR2(20)   DEFAULT 'NORMALE' NOT NULL
                      CONSTRAINT ck_dem_urgence
                      CHECK (urgence IN ('NORMALE','HAUTE','CRITIQUE')),
                                      statut            VARCHAR2(20)   DEFAULT 'EN_ATTENTE' NOT NULL
                      CONSTRAINT ck_dem_statut
                      CHECK (statut IN ('EN_ATTENTE','APPROUVEE','REJETEE','ANNULEE','TRANSFORMEE')),
                                      date_demande      TIMESTAMP,
                                      commentaire_rh    CLOB,
                                      traitee_par       VARCHAR2(200),
                                      date_traitement   TIMESTAMP,
                                      job_id            NUMBER,
                                      CONSTRAINT fk_dem_job FOREIGN KEY (job_id) REFERENCES JOBS(job_id)
);

-- ─── CANDIDATS ───────────────────────────────────────────
CREATE TABLE CANDIDATS (
                           candidat_id       NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           job_id            NUMBER,
                           nom               VARCHAR2(100),
                           prenom            VARCHAR2(100),
                           email             VARCHAR2(200),
                           telephone         VARCHAR2(50),
                           photo             VARCHAR2(500),
                           cv_path           VARCHAR2(500),
                           cv_text           CLOB,
                           statut            VARCHAR2(20)   DEFAULT 'NOUVEAU' NOT NULL
                      CONSTRAINT ck_cand_statut
                      CHECK (statut IN ('NOUVEAU','EN_REVUE','ENTRETIEN','REFUSE','ACCEPTE','LISTE_ATTENTE')),
                           date_candidature  TIMESTAMP,
                           score             NUMBER(5,2),
                           feedback          CLOB,
                           source            VARCHAR2(50),
                           CONSTRAINT fk_cand_job FOREIGN KEY (job_id) REFERENCES JOBS(job_id)
);

-- ─── ENTRETIENS ──────────────────────────────────────────
CREATE TABLE ENTRETIENS (
                            entretien_id      NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                            candidat_id       NUMBER,
                            candidat_nom      VARCHAR2(100),
                            candidat_prenom   VARCHAR2(100),
                            candidat_photo    VARCHAR2(500),
                            job_id            NUMBER,
                            job_titre         VARCHAR2(200),
                            departement       VARCHAR2(100),
                            type              VARCHAR2(20),
                            statut            VARCHAR2(20)   DEFAULT 'PLANIFIE' NOT NULL
                      CONSTRAINT ck_ent_statut
                      CHECK (statut IN ('PLANIFIE','CONFIRME','TERMINE','ANNULE','REPORTE')),
                            decision          VARCHAR2(20)   DEFAULT 'EN_ATTENTE' NOT NULL
                      CONSTRAINT ck_ent_decision
                      CHECK (decision IN ('EN_ATTENTE','ACCEPTE','REFUSE','LISTE_ATTENTE')),
                            date_ent          VARCHAR2(20),
                            heure_debut       VARCHAR2(10),
                            heure_fin         VARCHAR2(10),
                            lieu              VARCHAR2(200),
                            lien_visio        VARCHAR2(500),
                            intervieweur      VARCHAR2(200),
                            intervieweur_photo VARCHAR2(500),
                            note_globale      NUMBER(4,2),
                            commentaire       CLOB,
                            created_at        TIMESTAMP,
                            CONSTRAINT fk_ent_cand FOREIGN KEY (candidat_id) REFERENCES CANDIDATS(candidat_id),
                            CONSTRAINT fk_ent_job  FOREIGN KEY (job_id)     REFERENCES JOBS(job_id)
);

-- ─── JOB_KILLER_QUESTIONS ────────────────────────────────
CREATE TABLE JOB_KILLER_QUESTIONS (
                                      killer_q_id       NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                      job_id            NUMBER         NOT NULL,
                                      question          VARCHAR2(500)  NOT NULL,
                                      expected_answer   VARCHAR2(50),
                                      display_order     NUMBER(3)      DEFAULT 0 NOT NULL,
                                      CONSTRAINT fk_killer_job FOREIGN KEY (job_id) REFERENCES JOBS(job_id)
);

-- ─── JOB_SCREENING_QUESTIONS ─────────────────────────────
CREATE TABLE JOB_SCREENING_QUESTIONS (
                                         screening_q_id    NUMBER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                         job_id            NUMBER         NOT NULL,
                                         question          VARCHAR2(500)  NOT NULL,
                                         type              VARCHAR2(30),
                                         options_json      CLOB,
                                         correct_answer    VARCHAR2(200),
                                         weight            NUMBER(3)      DEFAULT 5 NOT NULL,
                                         display_order     NUMBER(3)      DEFAULT 0 NOT NULL,
                                         CONSTRAINT fk_screen_job FOREIGN KEY (job_id) REFERENCES JOBS(job_id)
);

-- ─── INDEX ───────────────────────────────────────────────
CREATE INDEX idx_job_statut        ON JOBS(statut);
CREATE INDEX idx_dem_statut        ON DEMANDES_RECRUTEMENT(statut);
CREATE INDEX idx_dem_job           ON DEMANDES_RECRUTEMENT(job_id);
CREATE INDEX idx_cand_job          ON CANDIDATS(job_id);
CREATE INDEX idx_cand_statut       ON CANDIDATS(statut);
CREATE INDEX idx_ent_cand          ON ENTRETIENS(candidat_id);
CREATE INDEX idx_ent_job           ON ENTRETIENS(job_id);
CREATE INDEX idx_ent_statut        ON ENTRETIENS(statut);
CREATE INDEX idx_killer_job        ON JOB_KILLER_QUESTIONS(job_id);
CREATE INDEX idx_screen_job        ON JOB_SCREENING_QUESTIONS(job_id);
