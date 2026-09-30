package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.dto.*;
import com.gerai.projetsservice.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * EvaluationController — /api/evaluations
 *
 * Module complet d'évaluation (campagnes + workflow Admin/Chef/Employé)
 * consommé par les espaces Admin RH, Chef et Employé du frontend.
 */
@Slf4j
@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class EvaluationController {

    private final EvaluationService evaluationService;

    /* ── Campagnes ──────────────────────────────────────── */

    @GetMapping("/campagnes")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH','CHEF','EMPLOYE')")
    public ResponseEntity<List<CampagneEvaluationDTO>> getCampagnes() {
        return ResponseEntity.ok(evaluationService.getCampagnes());
    }

    @PostMapping("/campagnes")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<CampagneEvaluationDTO> createCampagne(
            @RequestBody CampagneEvaluationDTO req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.createCampagne(req, auth));
    }

    @PutMapping("/campagnes/{id}/activer")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<CampagneEvaluationDTO> activerCampagne(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.activerCampagne(id));
    }

    @PutMapping("/campagnes/{id}/cloturer")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<CampagneEvaluationDTO> cloturerCampagne(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.cloturerCampagne(id));
    }

    @DeleteMapping("/campagnes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<Void> deleteCampagne(@PathVariable Long id) {
        evaluationService.deleteCampagne(id);
        return ResponseEntity.noContent().build();
    }

    /* ── Évaluations ────────────────────────────────────── */

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH','CHEF','EMPLOYE')")
    public ResponseEntity<List<EvaluationDTO>> getEvaluations(
            Authentication auth,
            @RequestParam(required = false) Long chefId,
            @RequestParam(required = false) Long employeId) {
        return ResponseEntity.ok(evaluationService.getEvaluations(auth, chefId, employeId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH','CHEF')")
    public ResponseEntity<EvaluationDTO> createEvaluation(
            @RequestBody EvaluationDTO req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.createEvaluation(req, auth));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH','CHEF')")
    public ResponseEntity<List<EvaluationDTO>> createBulk(
            @RequestBody Map<String, Object> body, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.createBulk(body, auth));
    }

    @PutMapping("/{id}/auto-evaluation")
    @PreAuthorize("hasRole('EMPLOYE')")
    public ResponseEntity<?> soumettreAutoEval(
            @PathVariable Long id, @RequestBody Map<String, Object> autoEval, Authentication auth) {
        try {
            return ResponseEntity.ok(evaluationService.soumettreAutoEval(id, autoEval, auth));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/evaluation-chef")
    @PreAuthorize("hasAnyRole('CHEF','ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<?> enregistrerEvalChef(
            @PathVariable Long id, @RequestBody Map<String, Object> evalChef, Authentication auth) {
        try {
            return ResponseEntity.ok(evaluationService.enregistrerEvalChef(id, evalChef, auth));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/valider-rh")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<?> validerRh(
            @PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload,
            Authentication auth) {
        try {
            return ResponseEntity.ok(evaluationService.validerRh(id, payload, auth));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cloturer")
    @PreAuthorize("hasAnyRole('ADMIN','RH','ADMIN_RH')")
    public ResponseEntity<?> cloturer(
            @PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(evaluationService.cloturer(id, auth));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }
}
