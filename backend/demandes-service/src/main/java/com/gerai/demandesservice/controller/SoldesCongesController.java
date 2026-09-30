package com.gerai.demandesservice.controller;

import com.gerai.demandesservice.dto.SoldeCongeAdminRequest;
import com.gerai.demandesservice.dto.SoldeCongeAdminResponse;
import com.gerai.demandesservice.service.SoldeCongeAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/api/admin/soldes-conges")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
@RequiredArgsConstructor
public class SoldesCongesController {

    private final SoldeCongeAdminService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<SoldeCongeAdminResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<SoldeCongeAdminResponse> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<?> create(@RequestBody SoldeCongeAdminRequest request) {
        try {
            SoldeCongeAdminResponse response = service.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SoldeCongeAdminRequest request) {
        try {
            SoldeCongeAdminResponse response = service.update(id, request);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Initialise les soldes de l'année donnée pour tous les employés actifs
     * qui n'en ont pas encore. Opération idempotente, déclenchée manuellement
     * par un admin (pas de job planifié automatique).
     */
    @PostMapping("/initialiser")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Map<String, Object>> initialiser(
            @RequestParam int annee,
            @RequestParam(defaultValue = "30") int soldeTotalParDefaut) {
        int created = service.initAnnee(annee, soldeTotalParDefaut);
        return ResponseEntity.ok(Map.of("annee", annee, "nouveauxSoldes", created));
    }

    /** Années distinctes disponibles, pour peupler le filtre côté frontend. */
    @GetMapping("/annees-disponibles")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<Integer>> getAnneesDisponibles() {
        return ResponseEntity.ok(service.getAnneesDisponibles());
    }
}