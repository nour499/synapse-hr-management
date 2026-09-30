-- ═══════════════════════════════════════════════════════════
--  GerAI — V17__notifications_add_role.sql
--  NOTIFICATIONS : ajout de la colonne ROLE
--  (utilisée pour les broadcasts par rôle — ADMIN/CHEF/EMPLOYE —
--  quand EMPLOYEE_ID est null. Colonne absente de la migration
--  d'origine V4__communication.sql alors que l'entité JPA
--  Notification.role l'attend déjà.)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE NOTIFICATIONS ADD ROLE VARCHAR2(30);

COMMENT ON COLUMN NOTIFICATIONS.ROLE IS 'Rôle destinataire pour diffusion broadcast (ADMIN, CHEF, EMPLOYE) — utilisé si EMPLOYEE_ID est null';