package com.gerai.demandesservice.controller;

import com.gerai.demandesservice.model.*;
import com.gerai.demandesservice.service.ReferentielService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST du référentiel — expose les routes attendues par le frontend
 * sous le préfixe /api/admin/referentiel.
 *
 * Implémente la logique pour la gestion des données du référentiel RH.
 *
 * Règles d'accès :
 * - Consultation : EMPLOYE, CHEF, RH, ADMIN, ADMIN_RH
 * - Gestion (création, modification, suppression) : RH, ADMIN, ADMIN_RH
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/referentiel")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
@RequiredArgsConstructor
public class ReferentielController {

    private final ReferentielService referentielService;

    // ----------------------------------------------------------------------
    // TypeConge
    // ----------------------------------------------------------------------

    /**
     * Récupérer tous les types de congé.
     * Accessible à tous les utilisateurs autorisés.
     */
    @GetMapping("/types-conge")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<TypeConge>> getTypesConge() {
        return ResponseEntity.ok(referentielService.getAllTypesConge());
    }

    /**
     * Créer un type de congé.
     * Réservé aux RH et administrateurs.
     */
    @PostMapping("/types-conge")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<TypeConge> createTypeConge(@RequestBody TypeConge dto) {
        TypeConge created = referentielService.createTypeConge(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Modifier un type de congé.
     * Réservé aux RH et administrateurs.
     */
    @PutMapping("/types-conge/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<TypeConge> updateTypeConge(
            @PathVariable Long id,
            @RequestBody TypeConge dto) {

        TypeConge updated = referentielService.updateTypeConge(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprimer un type de congé.
     * Réservé aux RH et administrateurs.
     */
    @DeleteMapping("/types-conge/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> deleteTypeConge(@PathVariable Long id) {
        referentielService.deleteTypeConge(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Activer/désactiver un type de congé.
     * Réservé aux RH et administrateurs.
     */
    @PutMapping("/types-conge/{id}/toggle-actif")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<TypeConge> toggleTypeCongeActif(@PathVariable Long id) {
        TypeConge toggled = referentielService.toggleTypeCongeActif(id);
        return ResponseEntity.ok(toggled);
    }

    // ----------------------------------------------------------------------
    // JourFerie
    // ----------------------------------------------------------------------

    /**
     * Récupérer tous les jours fériés.
     * Accessible à tous les utilisateurs autorisés.
     */
    @GetMapping("/jours-feries")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<JourFerie>> getJoursFeries() {
        return ResponseEntity.ok(referentielService.getAllJoursFeries());
    }

    /**
     * Créer un jour férié.
     * Réservé aux RH et administrateurs.
     */
    @PostMapping("/jours-feries")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<JourFerie> createJourFerie(@RequestBody JourFerie dto) {
        JourFerie created = referentielService.createJourFerie(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Modifier un jour férié.
     * Réservé aux RH et administrateurs.
     */
    @PutMapping("/jours-feries/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<JourFerie> updateJourFerie(
            @PathVariable Long id,
            @RequestBody JourFerie dto) {

        JourFerie updated = referentielService.updateJourFerie(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprimer un jour férié.
     * Réservé aux RH et administrateurs.
     */
    @DeleteMapping("/jours-feries/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> deleteJourFerie(@PathVariable Long id) {
        referentielService.deleteJourFerie(id);
        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------------------
    // GrilleSalariale
    // ----------------------------------------------------------------------

    /**
     * Récupérer toutes les grilles salariales.
     * Accessible à tous les utilisateurs autorisés.
     */
    @GetMapping("/grille-salariale")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<GrilleSalariale>> getGrilleSalariale() {
        return ResponseEntity.ok(referentielService.getAllGrillesSalariales());
    }

    /**
     * Créer une grille salariale.
     * Réservé aux RH et administrateurs.
     */
    @PostMapping("/grille-salariale")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<GrilleSalariale> createGrilleSalariale(
            @RequestBody GrilleSalariale dto) {

        GrilleSalariale created = referentielService.createGrilleSalariale(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Modifier une grille salariale.
     * Réservé aux RH et administrateurs.
     */
    @PutMapping("/grille-salariale/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<GrilleSalariale> updateGrilleSalariale(
            @PathVariable Long id,
            @RequestBody GrilleSalariale dto) {

        GrilleSalariale updated = referentielService.updateGrilleSalariale(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprimer une grille salariale.
     * Réservé aux RH et administrateurs.
     */
    @DeleteMapping("/grille-salariale/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> deleteGrilleSalariale(@PathVariable Long id) {
        referentielService.deleteGrilleSalariale(id);
        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------------------
    // Competence
    // ----------------------------------------------------------------------

    /**
     * Récupérer toutes les compétences.
     * Accessible à tous les utilisateurs autorisés.
     */
    @GetMapping("/competences")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<Competence>> getCompetences() {
        return ResponseEntity.ok(referentielService.getAllCompetences());
    }

    /**
     * Récupérer les compétences par catégorie.
     * Accessible à tous les utilisateurs autorisés.
     */
    @GetMapping("/competences/{categorie}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<Competence>> getCompetencesByCategorie(
            @PathVariable String categorie) {

        return ResponseEntity.ok(
                referentielService.getCompetencesByCategorie(categorie)
        );
    }

    /**
     * Créer une compétence.
     * Réservé aux RH et administrateurs.
     */
    @PostMapping("/competences")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Competence> createCompetence(
            @RequestBody Competence dto) {

        Competence created = referentielService.createCompetence(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Modifier une compétence.
     * Réservé aux RH et administrateurs.
     */
    @PutMapping("/competences/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Competence> updateCompetence(
            @PathVariable Long id,
            @RequestBody Competence dto) {

        Competence updated = referentielService.updateCompetence(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprimer une compétence.
     * Réservé aux RH et administrateurs.
     */
    @DeleteMapping("/competences/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> deleteCompetence(@PathVariable Long id) {
        referentielService.deleteCompetence(id);
        return ResponseEntity.noContent().build();
    }
}
