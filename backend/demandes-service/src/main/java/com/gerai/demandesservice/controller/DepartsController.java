package com.gerai.demandesservice.controller;

import com.gerai.demandesservice.model.Depart;
import com.gerai.demandesservice.repository.DepartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST des départs d'employés — expose les routes attendues par le
 * frontend sous le préfixe /api/departs.
 *
 * Persistance réelle via JPA/Oracle (table DEPARTS_EMPLOYES) — remplace
 * l'ancien stockage en mémoire ConcurrentHashMap.
 */
@Slf4j
@RestController
@RequestMapping("/api/departs")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
@RequiredArgsConstructor
public class DepartsController {

    private final DepartRepository departRepository;

    /**
     * Liste tous les départs.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<Depart>> getAll() {
        return ResponseEntity.ok(departRepository.findAll());
    }

    /**
     * Récupère un départ par son identifiant.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Depart> getById(@PathVariable Long id) {
        return departRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Crée un nouveau départ (statut par défaut EN_COURS, createdAt géré par @PrePersist).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Depart> create(@RequestBody Depart request) {
        // On force id=null pour être sûr que Hibernate fait bien un INSERT
        request.setId(null);
        if (request.getStatut() == null) {
            request.setStatut("EN_COURS");
        }
        Depart saved = departRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Met à jour un départ existant.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Depart> update(@PathVariable Long id, @RequestBody Depart request) {
        return departRepository.findById(id)
                .map(existant -> {
                    if (request.getEmployeId() != null) existant.setEmployeId(request.getEmployeId());
                    if (request.getEmployeNom() != null) existant.setEmployeNom(request.getEmployeNom());
                    if (request.getEmployePoste() != null) existant.setEmployePoste(request.getEmployePoste());
                    if (request.getEmployePhoto() != null) existant.setEmployePhoto(request.getEmployePhoto());
                    if (request.getEmployeDept() != null) existant.setEmployeDept(request.getEmployeDept());
                    if (request.getDateDepart() != null) existant.setDateDepart(request.getDateDepart());
                    if (request.getTypeDepart() != null) existant.setTypeDepart(request.getTypeDepart());
                    if (request.getRaison() != null) existant.setRaison(request.getRaison());
                    if (request.getStatut() != null) existant.setStatut(request.getStatut());
                    if (request.getNotes() != null) existant.setNotes(request.getNotes());
                    // createdAt n'est jamais modifié (updatable = false côté entité)
                    Depart updated = departRepository.save(existant);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Supprime un départ.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!departRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        departRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}