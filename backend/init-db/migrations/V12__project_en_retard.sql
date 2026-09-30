-- ═══════════════════════════════════════════════════════════
--  GerAI — V12__project_en_retard.sql
--  Le frontend utilise EN_RETARD comme statut de projet de premier
--  rang (projets en retard). La contrainte ck_proj_status d'origine
--  (V2) ne l'autorisait pas — on l'étend ici.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE PROJECTS DROP CONSTRAINT ck_proj_status;

ALTER TABLE PROJECTS ADD CONSTRAINT ck_proj_status
    CHECK (status IN ('PLANIFIE','EN_COURS','EN_PAUSE','EN_RETARD','TERMINE','ANNULE'));
