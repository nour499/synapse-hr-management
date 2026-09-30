-- ═══════════════════════════════════════════════════════════
--  GerAI — V22__fix_dem_urgence_constraint.sql
--  Corrige CK_DEM_URGENCE pour accepter 'URGENTE' au lieu de 'HAUTE',
--  afin de matcher le type Angular Urgence ('NORMALE'|'URGENTE'|'CRITIQUE').
-- ═══════════════════════════════════════════════════════════

ALTER TABLE DEMANDES_RECRUTEMENT DROP CONSTRAINT CK_DEM_URGENCE;

ALTER TABLE DEMANDES_RECRUTEMENT
    ADD CONSTRAINT CK_DEM_URGENCE
        CHECK (urgence IN ('NORMALE','URGENTE','CRITIQUE'));

-- Migre les éventuelles lignes existantes portant l'ancienne valeur
UPDATE DEMANDES_RECRUTEMENT SET urgence = 'URGENTE' WHERE urgence = 'HAUTE';