-- ═══════════════════════════════════════════════════════════
--  GerAI — V14__notification_reference_id_string.sql
--  NOTIFICATIONS.REFERENCE_ID : NUMBER → VARCHAR2
--  (supporte les références non-numériques, ex: codes Power BI)
-- ═══════════════════════════════════════════════════════════

DECLARE
v_data_type VARCHAR2(30);
BEGIN
SELECT data_type INTO v_data_type
FROM user_tab_columns
WHERE table_name = 'NOTIFICATIONS' AND column_name = 'REFERENCE_ID';

IF v_data_type = 'NUMBER' THEN
        EXECUTE IMMEDIATE 'ALTER TABLE NOTIFICATIONS RENAME COLUMN REFERENCE_ID TO REFERENCE_ID_OLD';
EXECUTE IMMEDIATE 'ALTER TABLE NOTIFICATIONS ADD REFERENCE_ID VARCHAR2(100)';
EXECUTE IMMEDIATE 'UPDATE NOTIFICATIONS SET REFERENCE_ID = TO_CHAR(REFERENCE_ID_OLD) WHERE REFERENCE_ID_OLD IS NOT NULL';
EXECUTE IMMEDIATE 'ALTER TABLE NOTIFICATIONS DROP COLUMN REFERENCE_ID_OLD';
END IF;
END;
/