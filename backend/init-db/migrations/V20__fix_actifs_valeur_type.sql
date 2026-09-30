-- ═══════════════════════════════════════════════════════════════
-- V20 - Correction du type de VALEUR dans ACTIFS
-- ═══════════════════════════════════════════════════════════════
--
-- Actif.java :
--     private Double valeur;
--
-- Hibernate attend un type Oracle FLOAT pour le mapping Double.
-- V19 avait créé VALEUR en NUMBER(12,2), ce qui provoque une
-- erreur de validation du schéma au démarrage de Hibernate.
--
-- V19 étant déjà exécutée, on ne la modifie pas.
-- Cette migration corrige uniquement le type de la colonne.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE ACTIFS
    MODIFY (VALEUR FLOAT);

-- ═══════════════════════════════════════════════════════════════
-- Fin V20
-- ═══════════════════════════════════════════════════════════════
