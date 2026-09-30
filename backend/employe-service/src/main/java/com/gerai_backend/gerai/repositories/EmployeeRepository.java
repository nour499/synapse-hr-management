package com.gerai_backend.gerai.repositories;

import com.gerai_backend.gerai.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Corrections vs l'ancienne version :
 *  - JpaRepository<Employee, UUID> → JpaRepository<Employee, Long>
 *    (PK est maintenant Long IDENTITY, pas UUID)
 *  - Ajout findByKeycloakUserId pour le lookup via user_id Keycloak
 *  - Ajout findByEmployeeCode pour vérification unicité du matricule
 *  - Ajout findByDeptId pour lister les employés d'un département
 *  - findDeptAndPosition : type de retour corrigé en List<Object[]>
 *    (une requête JPQL multi-colonnes retourne toujours List<Object[]> ;
 *     déclarer Object[] directement fait que Spring Data applique un
 *     .toArray() sur la liste, produisant un Object[1] contenant le
 *     vrai Object[2] imbriqué à l'index 0 → bug de sérialisation
 *     "[Ljava.lang.Object;@..." côté service).
 */
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmail(String email);

    Optional<Employee> findByEmail(String email);

    /** Lookup via UUID Keycloak (colonne USER_ID) */
    Optional<Employee> findByKeycloakUserId(String keycloakUserId);

    /** Vérification unicité du matricule avant insertion */
    boolean existsByEmployeeCode(String employeeCode);

    /** Membres d'une équipe managée par un responsable */
    List<Employee> findByManagerId(Long managerId);

    /** Employés d'un département donné */
    List<Employee> findByDeptId(Long deptId);

    /** Recherche par nom, prénom ou email (insensible à la casse) */
    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(e.lastName)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(e.email)     LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Employee> searchByQuery(@Param("q") String q);

    /**
     * Renvoie une liste d'une seule ligne [nomDepartement, titrePoste]
     * pour un employé donné. Le service doit lire le premier élément
     * de la liste (s'il existe) : list.get(0)[0] = nom département,
     * list.get(0)[1] = titre poste.
     */
    @Query("SELECT d.name, p.title FROM Employee e " +
            "LEFT JOIN Department d ON e.deptId = d.id " +
            "LEFT JOIN Position p ON e.positionId = p.id " +
            "WHERE e.id = :id")
    List<Object[]> findDeptAndPosition(@Param("id") Long id);
}
