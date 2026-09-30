package com.gerai.demandesservice.controller;

import com.gerai.demandesservice.dto.ActifDto;
import com.gerai.demandesservice.dto.DemandeActifDto;
import com.gerai.demandesservice.dto.TraitementDemandeActifDto;
import com.gerai.demandesservice.model.Actif;
import com.gerai.demandesservice.model.DemandeActif;
import com.gerai.demandesservice.repository.ActifRepository;
import com.gerai.demandesservice.repository.DemandeActifRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/actifs")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class ActifsController {

    private final ActifRepository actifRepository;
    private final DemandeActifRepository demandeActifRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<Actif>> getActifs(
            @RequestParam(required = false) Long employeId) {

        List<Actif> result = employeId != null
                ? actifRepository.findByEmployeId(employeId)
                : actifRepository.findAll();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Actif> getActif(@PathVariable Long id) {

        return actifRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Actif> creerActif(@Valid @RequestBody ActifDto dto) {

        Actif actif = Actif.builder()
                .nom(dto.getNom())
                .categorie(dto.getCategorie())
                .type(dto.getType())
                .marque(dto.getMarque())
                .modele(dto.getModele())
                .numeroSerie(dto.getNumeroSerie())
                .description(dto.getDescription())
                .valeur(dto.getValeur())
                .dateAcquisition(
                        dto.getDateAcquisition() != null
                                ? LocalDate.parse(dto.getDateAcquisition())
                                : null
                )
                .dateAttribution(
                        dto.getDateAttribution() != null
                                ? LocalDate.parse(dto.getDateAttribution())
                                : null
                )
                .dateExpiration(
                        dto.getDateExpiration() != null
                                ? LocalDate.parse(dto.getDateExpiration())
                                : null
                )
                .statut(
                        dto.getStatut() != null
                                ? dto.getStatut()
                                : "DISPONIBLE"
                )
                .employeId(dto.getEmployeId())
                .employeNom(dto.getEmployeNom())
                .build();

        Actif saved = actifRepository.save(actif);

        log.info("Actif créé avec succès : id={}", saved.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Actif> majActif(
            @PathVariable Long id,
            @Valid @RequestBody ActifDto dto) {

        Optional<Actif> existOpt = actifRepository.findById(id);

        if (existOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Actif exist = existOpt.get();

        exist.setNom(dto.getNom() != null ? dto.getNom() : exist.getNom());
        exist.setCategorie(dto.getCategorie() != null ? dto.getCategorie() : exist.getCategorie());
        exist.setType(dto.getType() != null ? dto.getType() : exist.getType());
        exist.setMarque(dto.getMarque() != null ? dto.getMarque() : exist.getMarque());
        exist.setModele(dto.getModele() != null ? dto.getModele() : exist.getModele());
        exist.setNumeroSerie(dto.getNumeroSerie() != null ? dto.getNumeroSerie() : exist.getNumeroSerie());
        exist.setDescription(dto.getDescription() != null ? dto.getDescription() : exist.getDescription());
        exist.setValeur(dto.getValeur() != null ? dto.getValeur() : exist.getValeur());

        if (dto.getDateAcquisition() != null) {
            exist.setDateAcquisition(LocalDate.parse(dto.getDateAcquisition()));
        }
        if (dto.getDateAttribution() != null) {
            exist.setDateAttribution(LocalDate.parse(dto.getDateAttribution()));
        }
        if (dto.getDateExpiration() != null) {
            exist.setDateExpiration(LocalDate.parse(dto.getDateExpiration()));
        }

        exist.setStatut(dto.getStatut() != null ? dto.getStatut() : exist.getStatut());
        exist.setEmployeId(dto.getEmployeId() != null ? dto.getEmployeId() : exist.getEmployeId());
        exist.setEmployeNom(dto.getEmployeNom() != null ? dto.getEmployeNom() : exist.getEmployeNom());

        Actif saved = actifRepository.save(exist);

        log.info("Actif modifié avec succès : id={}", id);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> supprimerActif(
            @PathVariable Long id) {

        if (!actifRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        actifRepository.deleteById(id);

        log.info("Actif supprimé avec succès : id={}", id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/demandes")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<DemandeActif>> getDemandes() {

        return ResponseEntity.ok(demandeActifRepository.findAll());
    }

    @PostMapping("/demandes")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<DemandeActif> creerDemande(
            @RequestBody DemandeActifDto dto) {

        DemandeActif demande = DemandeActif.builder()
                .actifId(dto.getActifId())
                .actifNom(dto.getActifNom())
                .actifType(dto.getActifType())
                .employeId(dto.getEmployeId())
                .employeNom(dto.getEmployeNom())
                .type(dto.getType())
                .description(dto.getDescription())
                .urgence(
                        dto.getUrgence() != null
                                ? dto.getUrgence()
                                : "NORMALE"
                )
                .statut(
                        dto.getStatut() != null
                                ? dto.getStatut()
                                : "EN_ATTENTE"
                )
                .dateCreation(LocalDateTime.now())
                .build();

        DemandeActif saved = demandeActifRepository.save(demande);

        log.info("Demande d'actif créée : id={}", saved.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @PutMapping("/demandes/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<DemandeActif> traiterDemande(
            @PathVariable Long id,
            @RequestBody TraitementDemandeActifDto dto) {

        Optional<DemandeActif> existOpt = demandeActifRepository.findById(id);

        if (existOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DemandeActif exist = existOpt.get();

        exist.setStatut(dto.getStatut() != null ? dto.getStatut() : exist.getStatut());
        exist.setDateTraitement(LocalDateTime.now());
        exist.setCommentaireAdmin(dto.getCommentaireAdmin());

        DemandeActif saved = demandeActifRepository.save(exist);

        log.info("Demande d'actif traitée : id={}", id);

        return ResponseEntity.ok(saved);
    }
}