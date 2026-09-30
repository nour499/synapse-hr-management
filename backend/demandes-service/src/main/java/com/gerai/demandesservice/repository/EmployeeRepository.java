package com.gerai.demandesservice.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository en lecture seule sur EMPLOYEES.
 *
 * IMPORTANT — frontière inter-services :
 * L'entité EMPLOYEES/Employee "appartient" à employe-service (voir sa classe
 * Employee.java, avec les colonnes réelles : EMPLOYEE_ID, FIRST_NAME, LAST_NAME,
 * DEPT_ID, POSITION_ID, MANAGER_ID, STATUS, USER_ID, EMAIL — PAS de JOB_TITLE,
 * le titre de poste vit dans POSITIONS.TITLE).
 *
 * Ce repository, situé dans demandes-service, ne dépend PAS de la classe
 * Employee d'employe-service : il interroge la table Oracle partagée
 * directement en SQL natif (@Query nativeQuery = true), ce qui est le pattern
 * déjà utilisé historiquement ici. Les deux services pointent vers le même
 * schéma Oracle (GERAI_USER), donc c'est une lecture cross-service légitime,
 * pas un import de code entre modules.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<com.gerai.demandesservice.model.EmployeeRef, Long> {

    @Query(value = """
            SELECT EMPLOYEE_ID FROM EMPLOYEES
            WHERE USER_ID = :keycloakSub AND STATUS = 'ACTIF'
            """, nativeQuery = true)
    Long findEmployeeIdByKeycloakSub(@Param("keycloakSub") String keycloakSub);

    @Query(value = """
            SELECT EMPLOYEE_ID FROM EMPLOYEES
            WHERE EMAIL = :email AND STATUS = 'ACTIF'
            """, nativeQuery = true)
    Long findEmployeeIdByEmail(@Param("email") String email);

    @Query(value = """
            SELECT MANAGER_ID FROM EMPLOYEES
            WHERE EMPLOYEE_ID = :employeeId
            """, nativeQuery = true)
    Long findManagerIdByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT e2.EMAIL
            FROM EMPLOYEES e1
            JOIN EMPLOYEES e2 ON e1.MANAGER_ID = e2.EMPLOYEE_ID
            WHERE e1.EMPLOYEE_ID = :employeeId
            """, nativeQuery = true)
    String findManagerEmailByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT e2.USER_ID
            FROM EMPLOYEES e1
            JOIN EMPLOYEES e2 ON e1.MANAGER_ID = e2.EMPLOYEE_ID
            WHERE e1.EMPLOYEE_ID = :employeeId
            """, nativeQuery = true)
    String findManagerKeycloakSubByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT FIRST_NAME || ' ' || LAST_NAME
            FROM EMPLOYEES
            WHERE EMPLOYEE_ID = :employeeId
            """, nativeQuery = true)
    String findFullNameByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * CORRIGÉ : EMPLOYEES n'a pas de colonne JOB_TITLE (confirmé par
     * Employee.java d'employe-service — le titre est dans POSITIONS.TITLE,
     * lié via EMPLOYEES.POSITION_ID). L'ancienne requête levait une
     * ORA-00904 à chaque appel, silencieusement avalée par le try/catch
     * de DemandeService.notifierRh().
     */
    @Query(value = """
            SELECT e.EMPLOYEE_ID FROM EMPLOYEES e
            JOIN POSITIONS p ON e.POSITION_ID = p.POSITION_ID
            WHERE e.STATUS = 'ACTIF'
              AND (
                   UPPER(p.TITLE) LIKE '%ADMINISTRATEUR%'
                OR UPPER(p.TITLE) LIKE '%ADMIN%'
                OR UPPER(p.TITLE) LIKE '%RESPONSABLE RH%'
                OR UPPER(p.TITLE) LIKE '%RESSOURCES HUMAINES%'
                OR UPPER(p.TITLE) LIKE '%DRH%'
                OR UPPER(p.TITLE) LIKE '%DIRECTEUR RH%'
                OR UPPER(p.TITLE) LIKE '%RH%'
              )
            """, nativeQuery = true)
    java.util.List<Long> findAdminEmployeeIds();

    @Query(value = """
            SELECT EMAIL FROM EMPLOYEES
            WHERE EMPLOYEE_ID = :employeeId
            """, nativeQuery = true)
    String findEmailByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT DEPT_ID FROM EMPLOYEES
            WHERE EMPLOYEE_ID = :employeeId
            """, nativeQuery = true)
    Long findDeptIdByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
        SELECT d.NAME
        FROM EMPLOYEES e
        JOIN DEPARTMENTS d ON e.DEPT_ID = d.DEPT_ID
        WHERE e.EMPLOYEE_ID = :employeeId
        """, nativeQuery = true)
    String findDeptNameByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT EMPLOYEE_ID FROM EMPLOYEES
            WHERE DEPT_ID = :deptId AND STATUS = 'ACTIF'
            """, nativeQuery = true)
    java.util.List<Long> findEmployeeIdsByDeptId(@Param("deptId") Long deptId);

    @Query(value = """
            SELECT p.CREATED_BY
            FROM PROJECT_MEMBERS pm
            JOIN PROJECTS p ON pm.PROJECT_ID = p.PROJECT_ID
            WHERE pm.EMPLOYEE_ID = :employeeId
              AND pm.IS_ACTIVE = 1
              AND ROWNUM = 1
            """, nativeQuery = true)
    Long findManagerIdViaProjectByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * CORRIGÉ : même problème que findAdminEmployeeIds() — JOB_TITLE
     * remplacé par une jointure vers POSITIONS.TITLE.
     */
    @Query(value = """
            SELECT e2.EMPLOYEE_ID
            FROM EMPLOYEES e1
            JOIN EMPLOYEES e2 ON e1.DEPT_ID = e2.DEPT_ID
            JOIN POSITIONS p2 ON e2.POSITION_ID = p2.POSITION_ID
            WHERE e1.EMPLOYEE_ID = :employeeId
              AND e1.EMPLOYEE_ID != e2.EMPLOYEE_ID
              AND (UPPER(p2.TITLE) LIKE '%CHEF%' OR UPPER(p2.TITLE) LIKE '%MANAGER%')
              AND e2.STATUS = 'ACTIF'
              AND ROWNUM = 1
            """, nativeQuery = true)
    Long findChefInSameDeptByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT NVL(c.GROSS_SALARY, 0)
            FROM CONTRACTS c
            WHERE c.EMPLOYEE_ID = :employeeId
            AND c.START_DATE = (
                SELECT MAX(c2.START_DATE) FROM CONTRACTS c2
                WHERE c2.EMPLOYEE_ID = :employeeId
            )
            AND ROWNUM = 1
            """, nativeQuery = true)
    java.math.BigDecimal findCurrentSalaryByEmployeeId(@Param("employeeId") Long employeeId);

    /**
     * Liste des employés actifs pour l'initialisation annuelle des soldes de congé.
     * Projection SQL directe (pas de mapping sur EmployeeRef), pour rester
     * indépendant de la définition exacte de cette entité locale.
     */
    @Query(value = """
            SELECT e.EMPLOYEE_ID   AS id,
                   e.FIRST_NAME || ' ' || e.LAST_NAME AS nom,
                   d.NAME          AS departement,
                   p.TITLE         AS poste
            FROM EMPLOYEES e
            LEFT JOIN DEPARTMENTS d ON e.DEPT_ID = d.DEPT_ID
            LEFT JOIN POSITIONS p ON e.POSITION_ID = p.POSITION_ID
            WHERE e.STATUS = 'ACTIF'
            """, nativeQuery = true)
    java.util.List<Object[]> findAllActifsForSoldeInit();
}