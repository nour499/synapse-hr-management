package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.services.DepartementsService;
import com.gerai_backend.gerai.dto.DepartmentDTO;
import com.gerai_backend.gerai.models.Employee;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/departements")
@RequiredArgsConstructor
public class DepartementsController {

    private final DepartementsService departementsService;

    @PostMapping
    public DepartmentDTO createDepartement(@Valid @RequestBody DepartmentDTO request) {
        return departementsService.createDepartement(request);
    }

    @GetMapping
    public List<DepartmentDTO> getAllDepartements() {
        return departementsService.getAllDepartements();
    }

    @GetMapping({"/{id}", "/{id}/"})
    public DepartmentDTO getDepartementById(@PathVariable Long id) {
        return departementsService.getDepartementById(id);
    }

    @PutMapping({"/{id}", "/{id}/"})
    public DepartmentDTO updateDepartement(@PathVariable Long id, @Valid @RequestBody DepartmentDTO request) {
        return departementsService.updateDepartement(id, request);
    }

    @DeleteMapping({"/{id}", "/{id}/"})
    public void deleteDepartement(@PathVariable Long id) {
        departementsService.deleteDepartement(id);
    }

    @GetMapping({"/{id}/employes", "/{id}/employes/"})
    public List<Employee> getEmployesByDepartementId(@PathVariable Long id) {
        return departementsService.getEmployesByDepartementId(id);
    }

    // ── Gestion centralisée des erreurs ──────────────────────

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(RuntimeException ex) {
        log.warn("Department not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        log.warn("Invalid department request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConflictState(IllegalStateException ex) {
        log.warn("Department state conflict: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConflict(DataIntegrityViolationException ex) {
        log.warn("Department data integrity violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Un département avec des informations similaires existe déjà (nom, email ou code en doublon)."));
    }
}