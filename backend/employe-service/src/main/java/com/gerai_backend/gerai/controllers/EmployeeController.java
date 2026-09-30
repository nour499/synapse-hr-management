package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.dto.CreateEmployeeRequest;
import com.gerai_backend.gerai.dto.CreateEmployeeResponse;
import com.gerai_backend.gerai.models.Employee;
import com.gerai_backend.gerai.repositories.EmployeeRepository;
import com.gerai_backend.gerai.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Correction : tous les @PathVariable UUID id → Long id
 * (la PK est maintenant NUMBER IDENTITY Oracle, pas UUID).
 */
@Slf4j
@RestController
@RequestMapping({"/employees", "/employes"})
public class EmployeeController {

    private final EmployeeService    employeeService;
    private final EmployeeRepository employeeRepository;
    private final JdbcTemplate       jdbcTemplate;

    @Autowired
    public EmployeeController(EmployeeService employeeService,
                              EmployeeRepository employeeRepository,
                              JdbcTemplate jdbcTemplate) {
        this.employeeService    = employeeService;
        this.employeeRepository = employeeRepository;
        this.jdbcTemplate       = jdbcTemplate;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleConflict(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    // Create new employee
    @PostMapping
    public ResponseEntity<CreateEmployeeResponse> createEmployee(
            @RequestBody @Valid CreateEmployeeRequest request) {
        CreateEmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all employees — native query mapped to Angular Employe shape
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEmployees() {
        // Try full query (with dept + position joins), then dept-only, then bare minimum
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, e.EMAIL, e.PHONE, " +
                "       e.PHOTO_URL, e.HIRE_DATE, e.MANAGER_ID, e.STATUS, " +
                "       e.GENDER, e.BIRTH_DATE, e.ADDRESS, e.EMPLOYEE_CODE, " +
                "       d.NAME  AS DEPT_NAME, " +
                "       p.TITLE AS POSITION_TITLE " +
                "FROM EMPLOYEES e " +
                "LEFT JOIN DEPARTMENTS d ON e.DEPT_ID    = d.DEPT_ID " +
                "LEFT JOIN POSITIONS   p ON e.POSITION_ID = p.POSITION_ID " +
                "WHERE e.STATUS <> 'DEMISSION' " +
                "ORDER BY e.EMPLOYEE_ID"
            );
            return ResponseEntity.ok(rows.stream().map(this::toDto).toList());
        } catch (Exception e1) {
            log.warn("Full query failed ({}), trying dept-only...", e1.getMessage());
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, e.EMAIL, e.PHONE, " +
                "       e.PHOTO_URL, e.HIRE_DATE, e.MANAGER_ID, e.STATUS, " +
                "       e.GENDER, e.BIRTH_DATE, e.ADDRESS, e.EMPLOYEE_CODE, " +
                "       d.NAME AS DEPT_NAME " +
                "FROM EMPLOYEES e " +
                "LEFT JOIN DEPARTMENTS d ON e.DEPT_ID = d.DEPT_ID " +
                "WHERE e.STATUS <> 'DEMISSION' " +
                "ORDER BY e.EMPLOYEE_ID"
            );
            return ResponseEntity.ok(rows.stream().map(this::toDto).toList());
        } catch (Exception e2) {
            log.warn("Dept-only query failed ({}), trying bare...", e2.getMessage());
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, " +
                "       PHOTO_URL, HIRE_DATE, MANAGER_ID, STATUS, " +
                "       GENDER, BIRTH_DATE, ADDRESS, EMPLOYEE_CODE " +
                "FROM EMPLOYEES WHERE STATUS <> 'DEMISSION' ORDER BY EMPLOYEE_ID"
            );
            return ResponseEntity.ok(rows.stream().map(this::toDto).toList());
        } catch (Exception e3) {
            log.warn("Bare query failed ({}), trying minimal...", e3.getMessage());
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, HIRE_DATE, EMPLOYEE_CODE " +
                "FROM EMPLOYEES WHERE STATUS <> 'DEMISSION' ORDER BY EMPLOYEE_ID"
            );
            return ResponseEntity.ok(rows.stream().map(this::toDto).toList());
        } catch (Exception e4) {
            log.error("All employee queries failed: {}", e4.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // Get employee by ID — native JDBC with fallback
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEmployeeById(@PathVariable Long id) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, e.EMAIL, e.PHONE, " +
                "       e.PHOTO_URL, e.HIRE_DATE, e.MANAGER_ID, e.STATUS, " +
                "       e.GENDER, e.BIRTH_DATE, e.ADDRESS, e.EMPLOYEE_CODE, " +
                "       d.NAME  AS DEPT_NAME, " +
                "       p.TITLE AS POSITION_TITLE " +
                "FROM EMPLOYEES e " +
                "LEFT JOIN DEPARTMENTS d ON e.DEPT_ID     = d.DEPT_ID " +
                "LEFT JOIN POSITIONS   p ON e.POSITION_ID = p.POSITION_ID " +
                "WHERE e.EMPLOYEE_ID = ?", id
            );
            if (rows.isEmpty()) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(toDto(rows.get(0)));
        } catch (Exception e1) {
            log.warn("Full query failed for id={}: {}", id, e1.getMessage());
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, e.EMAIL, e.PHONE, " +
                "       e.PHOTO_URL, e.HIRE_DATE, e.MANAGER_ID, e.STATUS, " +
                "       e.GENDER, e.BIRTH_DATE, e.ADDRESS, e.EMPLOYEE_CODE, " +
                "       d.NAME AS DEPT_NAME " +
                "FROM EMPLOYEES e " +
                "LEFT JOIN DEPARTMENTS d ON e.DEPT_ID = d.DEPT_ID " +
                "WHERE e.EMPLOYEE_ID = ?", id
            );
            if (rows.isEmpty()) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(toDto(rows.get(0)));
        } catch (Exception e2) {
            log.warn("Dept-only query failed for id={}: {}", id, e2.getMessage());
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, " +
                "       PHOTO_URL, HIRE_DATE, MANAGER_ID, STATUS, " +
                "       GENDER, BIRTH_DATE, ADDRESS, EMPLOYEE_CODE " +
                "FROM EMPLOYEES WHERE EMPLOYEE_ID = ?", id
            );
            if (rows.isEmpty()) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(toDto(rows.get(0)));
        } catch (Exception e3) {
            log.warn("Bare query failed for id={}: {}", id, e3.getMessage());
        }
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, HIRE_DATE, EMPLOYEE_CODE " +
                "FROM EMPLOYEES WHERE EMPLOYEE_ID = ?", id
            );
            if (rows.isEmpty()) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(toDto(rows.get(0)));
        } catch (Exception e4) {
            log.error("All queries failed for employee {}: {}", id, e4.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update employee — CORRECTION : UUID → Long
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody @Valid CreateEmployeeRequest request) {
        Employee updated = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(updated);
    }

    // Delete employee — CORRECTION : UUID → Long
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    // Global HR stats — GET /api/employes/stats
    // Shape attendue par le front (theme StatistiquesEmploye) :
    // congesRestants, demandesEnCours, tachesActives, tauxPresence
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        int total = 0, actifs = 0;
        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                    "SELECT COUNT(*) AS TOTAL, " +
                    "SUM(CASE WHEN STATUS = 'ACTIF' THEN 1 ELSE 0 END) AS ACTIFS " +
                    "FROM EMPLOYEES");
            total  = toInt(row.get("TOTAL"));
            actifs = toInt(row.get("ACTIFS"));
        } catch (Exception e) {
            log.warn("Employee count query failed: {}", e.getMessage());
        }
        int demandesEnCours = 0;
        try {
            Long pending = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM EMPLOYEES WHERE STATUS <> 'ACTIF'", Long.class);
            demandesEnCours = pending != null ? pending.intValue() : 0;
        } catch (Exception e) { demandesEnCours = 0; }

        stats.put("congesRestants",   30);
        stats.put("demandesEnCours",  demandesEnCours);
        stats.put("tachesActives",    actifs);
        stats.put("tauxPresence",     100);
        stats.put("totalEmployes",    total);
        stats.put("emploesActifs",     actifs);
        return ResponseEntity.ok(stats);
    }

    // Per-employee stats — GET /api/employes/{id}/stats
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getEmployeeStats(@PathVariable Long id) {
        Map<String, Object> stats = new LinkedHashMap<>();
        int joursUtilises = 0;
        try {
            Integer pris = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(SUM(DAYS_COUNT),0) FROM EMPLOYEE_CONGES WHERE EMPLOYEE_ID = ?",
                    Integer.class, id);
            joursUtilises = pris != null ? pris : 0;
        } catch (Exception e) { joursUtilises = 0; }

        stats.put("congesRestants",   30 - joursUtilises);
        stats.put("demandesEnCours",  0);
        stats.put("tachesActives",    0);
        stats.put("tauxPresence",     100);
        stats.put("congesTotal",      30);
        stats.put("formationsSuivies", 0);
        stats.put("formationsTotal",   0);
        stats.put("tachesCompletes",   0);
        stats.put("tachesTotal",       0);
        stats.put("objectifsAtteints", 0);
        return ResponseEntity.ok(stats);
    }

    private Map<String, Object> toDto(Map<String, Object> r) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id",            r.get("EMPLOYEE_ID"));
        dto.put("nom",           str(r.get("LAST_NAME")));
        dto.put("prenom",        str(r.get("FIRST_NAME")));
        dto.put("email",         str(r.get("EMAIL")));
        dto.put("telephone",     str(r.get("PHONE")));
        dto.put("photo",         str(r.get("PHOTO_URL")));
        dto.put("dateEmbauche",  r.get("HIRE_DATE")  != null ? r.get("HIRE_DATE").toString()  : null);
        dto.put("dateNaissance", r.get("BIRTH_DATE") != null ? r.get("BIRTH_DATE").toString() : null);
        dto.put("poste",         str(r.get("POSITION_TITLE")));
        dto.put("departement",   str(r.get("DEPT_NAME")));
        dto.put("chefId",        r.get("MANAGER_ID"));
        dto.put("statut",        r.get("STATUS") != null ? r.get("STATUS").toString() : "ACTIF");
        dto.put("genre",         str(r.get("GENDER")));
        dto.put("adresse",       str(r.get("ADDRESS")));
        dto.put("employeeCode",  str(r.get("EMPLOYEE_CODE")));
        return dto;
    }

    private String str(Object val) {
        return val != null ? val.toString() : "";
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number n) return n.intValue();
        return 0;
    }

    // Employees managed by a specific chef — GET /api/employes/chef/{chefId}
// CORRIGÉ : utilisait employeeRepository.findByManagerId() qui retourne
// des entités JPA brutes (firstName/lastName/deptId non résolus) — incohérent
// avec le reste de l'API qui expose nom/prenom/poste/departement via toDto().
    @GetMapping("/chef/{chefId}")
    public ResponseEntity<List<Map<String, Object>>> getByChef(@PathVariable Long chefId) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, e.EMAIL, e.PHONE, " +
                            "       e.PHOTO_URL, e.HIRE_DATE, e.MANAGER_ID, e.STATUS, " +
                            "       e.GENDER, e.BIRTH_DATE, e.ADDRESS, e.EMPLOYEE_CODE, " +
                            "       d.NAME  AS DEPT_NAME, " +
                            "       p.TITLE AS POSITION_TITLE " +
                            "FROM EMPLOYEES e " +
                            "LEFT JOIN DEPARTMENTS d ON e.DEPT_ID    = d.DEPT_ID " +
                            "LEFT JOIN POSITIONS   p ON e.POSITION_ID = p.POSITION_ID " +
                            "WHERE e.MANAGER_ID = ? AND e.STATUS <> 'DEMISSION' " +
                            "ORDER BY e.EMPLOYEE_ID", chefId
            );
            return ResponseEntity.ok(rows.stream().map(this::toDto).toList());
        } catch (Exception e) {
            log.error("getByChef failed for chefId={}: {}", chefId, e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
    // List all positions for form dropdowns — GET /api/employes/postes
    @GetMapping("/postes")
    public ResponseEntity<List<Map<String, Object>>> getPositions() {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT POSITION_ID AS \"id\", TITLE AS \"title\" FROM POSITIONS ORDER BY TITLE");
            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            log.warn("Failed to load positions: {}", e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    // List all departments for form dropdowns — GET /api/employes/departements
    @GetMapping("/departements")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT DEPT_ID AS \"id\", NAME AS \"name\" FROM DEPARTMENTS ORDER BY NAME");
        return ResponseEntity.ok(rows);
    }

    // Search by email (?email=) or free text (?q=)
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String q) {
        if ((email == null || email.isBlank()) && (q == null || q.isBlank())) {
            return ResponseEntity.ok(List.of());
        }
        // Full query with joins, falling back to bare if schema is incomplete
        for (boolean withJoins : new boolean[]{true, false}) {
            try {
                List<Map<String, Object>> rows;
                String base = withJoins
                    ? "SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, e.EMAIL, e.PHONE, " +
                      "       e.PHOTO_URL, e.HIRE_DATE, e.MANAGER_ID, e.STATUS, " +
                      "       e.GENDER, e.BIRTH_DATE, e.ADDRESS, e.EMPLOYEE_CODE, " +
                      "       d.NAME AS DEPT_NAME " +
                      "FROM EMPLOYEES e " +
                      "LEFT JOIN DEPARTMENTS d ON e.DEPT_ID = d.DEPT_ID " +
                      "WHERE e.STATUS = 'ACTIF'"
                    : "SELECT EMPLOYEE_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, " +
                      "       PHOTO_URL, HIRE_DATE, MANAGER_ID, STATUS, " +
                      "       GENDER, BIRTH_DATE, ADDRESS, EMPLOYEE_CODE " +
                      "FROM EMPLOYEES WHERE STATUS = 'ACTIF'";
                if (email != null && !email.isBlank()) {
                    String col = withJoins ? "e.EMAIL" : "EMAIL";
                    rows = jdbcTemplate.queryForList(base + " AND UPPER(" + col + ") = UPPER(?)", email);
                } else {
                    String like = "%" + q.toUpperCase() + "%";
                    String fn = withJoins ? "e.FIRST_NAME" : "FIRST_NAME";
                    String ln = withJoins ? "e.LAST_NAME"  : "LAST_NAME";
                    String em = withJoins ? "e.EMAIL"      : "EMAIL";
                    rows = jdbcTemplate.queryForList(
                        base + " AND (UPPER(" + fn + ") LIKE ? OR UPPER(" + ln + ") LIKE ? OR UPPER(" + em + ") LIKE ?)" +
                        " ORDER BY " + ln + ", " + fn,
                        like, like, like);
                }
                return ResponseEntity.ok(rows.stream().map(this::toDto).toList());
            } catch (Exception e) {
                log.warn("search (withJoins={}) failed q='{}': {}", withJoins, q, e.getMessage());
            }
        }
        return ResponseEntity.ok(List.of());
    }
}