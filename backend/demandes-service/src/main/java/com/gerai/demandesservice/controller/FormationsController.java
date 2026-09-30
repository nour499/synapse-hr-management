package com.gerai.demandesservice.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gerai.demandesservice.dto.CreerFormationRequest;
import com.gerai.demandesservice.dto.FormationResponseDTO;
import com.gerai.demandesservice.model.TrainingRequest;
import com.gerai.demandesservice.repository.TrainingRequestRepository;
import com.gerai.demandesservice.service.EmployeeInfoHelper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Controller REST des formations — expose les routes attendues par le frontend
 * sous le préfixe /api/formations.
 *
 * Réutilise TrainingRequest (table Oracle TRAINING_REQUESTS) et
 * TrainingRequestRepository. Tous les champs "étendus" (type, dates
 * souhaitées/réelles, compétences visées, suivi post-approbation, statut
 * de workflow) sont désormais réellement persistés (V19) — plus de
 * ConcurrentHashMap en mémoire, plus de @Transient perdu au rechargement.
 *
 * Toute réponse passe par FormationResponseDTO pour exposer exactement
 * les noms de champs attendus par le frontend Angular.
 */
@Slf4j
@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class FormationsController {

    private final TrainingRequestRepository trainingRepo;
    private final EmployeeInfoHelper empHelper;
    private final ObjectMapper objectMapper;

    /* ══════════════════════════════════════════════════════════════
       LECTURE
       ══════════════════════════════════════════════════════════════ */

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<FormationResponseDTO>> getAll(
            @RequestParam(required = false) Long employeId,
            @RequestParam(required = false) Long chefId) {
        List<TrainingRequest> result = new ArrayList<>();

        if (chefId != null) {
            result.addAll(trainingRepo.findByManager(chefId));
        } else if (employeId != null) {
            result.addAll(trainingRepo.findByEmployeeIdOrderByCreatedAtDesc(employeId));
        } else {
            result.addAll(trainingRepo.findAll());
        }
        return ResponseEntity.ok(result.stream().map(this::toDto).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> getOne(@PathVariable Long id) {
        return trainingRepo.findById(id)
                .map(f -> ResponseEntity.ok(toDto(enrichirIdentite(f))))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ══════════════════════════════════════════════════════════════
       CRÉATION
       ══════════════════════════════════════════════════════════════ */

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> creer(@RequestBody CreerFormationRequest request) {
        TrainingRequest f = TrainingRequest.builder()
                .employeeId(request.getEmployeId())
                .trainingTitle(request.getTitre())
                .provider(request.getOrganisme())
                .estimatedCost(request.getCoutEstime())
                .plannedDate(request.getPlannedDate())
                .durationDays(request.getDureeJours())
                .lieu(request.getLieu())
                .modeFormation(request.getMode())
                .reason(request.getObjectifs())
                .status("EN_ATTENTE")
                .statutEtendu("EN_ATTENTE")
                .approvedBy(request.getChefId())
                .type(request.getType())
                .dateDebutSouhaitee(request.getDateDebutSouhaitee())
                .dateFinSouhaitee(request.getDateFinSouhaitee())
                .competencesViseesJson(toJson(request.getCompetencesVisees()))
                .build();
        TrainingRequest saved = trainingRepo.save(f);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(enrichirIdentite(saved)));
    }

    /* ══════════════════════════════════════════════════════════════
       DÉCISION CHEF (APPROUVE_CHEF / REJETE_CHEF)
       ══════════════════════════════════════════════════════════════ */

    @PutMapping("/{id}/chef-decision")
    @PreAuthorize("hasAnyRole('CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> chefDecision(@PathVariable Long id,
                                                             @RequestBody DecisionRequest body,
                                                             Authentication auth) {
        return trainingRepo.findById(id).map(f -> {
            if ("REJETE_CHEF".equals(body.getDecision())) {
                f.setStatus("REFUSE");
                f.setStatutEtendu("REJETE_CHEF");
            } else {
                f.setStatus("APPROUVE_CHEF");
                f.setApprovedBy(resolveCurrentEmployeeId(auth));
                f.setStatutEtendu("APPROUVE_CHEF");
            }
            f.setCommentaireChef(body.getCommentaire());
            f.setDateTraitementChef(LocalDateTime.now());
            TrainingRequest saved = trainingRepo.save(f);
            return ResponseEntity.ok(toDto(enrichirIdentite(saved)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ══════════════════════════════════════════════════════════════
       DÉCISION RH (APPROUVE_RH / REJETE_RH)
       ══════════════════════════════════════════════════════════════ */

    @PutMapping("/{id}/rh-decision")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> rhDecision(@PathVariable Long id,
                                                           @RequestBody RhDecisionRequest body,
                                                           Authentication auth) {
        return trainingRepo.findById(id).map(f -> {
            if ("REJETE_RH".equals(body.getDecision())) {
                f.setStatus("REFUSE");
                f.setStatutEtendu("REJETE_RH");
            } else {
                f.setStatus("APPROUVE_RH");
                f.setApprovedByRh(resolveCurrentEmployeeId(auth));
                f.setTraiteeParRh(body.getTraiteeParRh());
                f.setStatutEtendu("APPROUVE_RH");
            }
            f.setCommentaireRh(body.getCommentaire());
            f.setApprovedAtRh(LocalDateTime.now());
            TrainingRequest saved = trainingRepo.save(f);
            return ResponseEntity.ok(toDto(enrichirIdentite(saved)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ══════════════════════════════════════════════════════════════
       SUIVI POST-APPROBATION
       ══════════════════════════════════════════════════════════════ */

    @PutMapping("/{id}/planifier")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> planifier(@PathVariable Long id,
                                                          @RequestBody PlanifierRequest body) {
        return trainingRepo.findById(id).map(f -> {
            f.setDateDebutReelle(body.getDateDebutReelle());
            f.setDateFinReelle(body.getDateFinReelle());
            if (body.getLieu() != null) f.setLieu(body.getLieu());
            f.setStatutEtendu("PLANIFIEE");
            TrainingRequest saved = trainingRepo.save(f);
            return ResponseEntity.ok(toDto(enrichirIdentite(saved)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/demarrer")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> demarrer(@PathVariable Long id) {
        return trainingRepo.findById(id).map(f -> {
            f.setStatutEtendu("EN_COURS");
            TrainingRequest saved = trainingRepo.save(f);
            return ResponseEntity.ok(toDto(enrichirIdentite(saved)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/completer")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<FormationResponseDTO> completer(@PathVariable Long id,
                                                          @RequestBody CompleterRequest body) {
        return trainingRepo.findById(id).map(f -> {
            f.setCertificatObtenu(body.getCertificatObtenu());
            f.setEvaluation(body.getEvaluation());
            f.setNoteEvaluation(body.getNoteEvaluation());
            f.setStatutEtendu("COMPLETEE");
            TrainingRequest saved = trainingRepo.save(f);
            return ResponseEntity.ok(toDto(enrichirIdentite(saved)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Vérifie le statut étendu courant (désormais persisté, plus de
     * ConcurrentHashMap) avant d'écraser — une formation déjà COMPLETEE
     * ou ANNULEE ne peut pas être ré-annulée.
     */
    @PutMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<?> annuler(@PathVariable Long id) {
        return trainingRepo.findById(id).map(f -> {
            String statutActuel = f.getStatutEtendu();

            if ("COMPLETEE".equals(statutActuel) || "ANNULEE".equals(statutActuel)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body((Object) Map.of(
                                "error",
                                "Impossible d'annuler une formation déjà " + statutActuel.toLowerCase()
                        ));
            }

            f.setStatus("ANNULE");
            f.setStatutEtendu("ANNULEE");
            TrainingRequest saved = trainingRepo.save(f);
            return ResponseEntity.ok((Object) toDto(enrichirIdentite(saved)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /* ══════════════════════════════════════════════════════════════
       ENRICHISSEMENT IDENTITÉ (jamais persisté, résolu à l'exécution)
       ══════════════════════════════════════════════════════════════ */

    private TrainingRequest enrichirIdentite(TrainingRequest f) {
        empHelper.findById(f.getEmployeeId()).ifPresent(ref -> {
            f.setEmployeNom(ref.getLastName());
            f.setEmployePrenom(ref.getFirstName());
            f.setDepartement(ref.getDeptId() != null ? String.valueOf(ref.getDeptId()) : null);
        });
        if (f.getApprovedBy() != null) {
            f.setChefNom(empHelper.findFullName(f.getApprovedBy()));
        }
        return f;
    }

    /* ══════════════════════════════════════════════════════════════
       MAPPING VERS LE DTO ATTENDU PAR LE FRONTEND
       ══════════════════════════════════════════════════════════════ */

    private FormationResponseDTO toDto(TrainingRequest f) {
        // L'identité (nom/prénom/département/chef) est résolue seulement
        // si elle n'a pas déjà été enrichie par l'appelant (évite un
        // double appel à empHelper dans getAll()).
        TrainingRequest enrichie = (f.getEmployeNom() == null) ? enrichirIdentite(f) : f;

        return FormationResponseDTO.builder()
                .id(enrichie.getRequestId())
                .employeId(enrichie.getEmployeeId())
                .employeNom(enrichie.getEmployeNom())
                .employePrenom(enrichie.getEmployePrenom())
                .employePhoto(enrichie.getEmployePhoto())
                .departement(enrichie.getDepartement())
                .chefId(enrichie.getApprovedBy())
                .chefNom(enrichie.getChefNom())
                .titre(enrichie.getTrainingTitle())
                .organisme(enrichie.getProvider())
                .type(enrichie.getType())
                .mode(enrichie.getModeFormation())
                .dureeJours(enrichie.getDurationDays())
                .coutEstime(enrichie.getEstimatedCost())
                .lieu(enrichie.getLieu())
                .dateDebutSouhaitee(enrichie.getDateDebutSouhaitee())
                .dateFinSouhaitee(enrichie.getDateFinSouhaitee())
                .objectifs(enrichie.getReason())
                .competencesVisees(fromJson(enrichie.getCompetencesViseesJson()))
                .statut(enrichie.getStatutEtendu())
                .dateDemande(enrichie.getCreatedAt())
                .commentaireChef(enrichie.getCommentaireChef())
                .dateTraitementChef(enrichie.getDateTraitementChef())
                .commentaireRh(enrichie.getCommentaireRh())
                .dateTraitementRh(enrichie.getApprovedAtRh())
                .traiteeParRh(enrichie.getTraiteeParRh())
                .dateDebutReelle(enrichie.getDateDebutReelle())
                .dateFinReelle(enrichie.getDateFinReelle())
                .certificatObtenu(enrichie.getCertificatObtenu())
                .evaluation(enrichie.getEvaluation())
                .noteEvaluation(enrichie.getNoteEvaluation())
                .build();
    }

    private Long resolveCurrentEmployeeId(Authentication auth) {
        if (auth == null) return null;
        try {
            return empHelper.findEmployeeIdBySub(auth.getName());
        } catch (Exception e) {
            return null;
        }
    }

    private String toJson(List<String> list) {
        if (list == null) return null;
        try { return objectMapper.writeValueAsString(list); }
        catch (Exception e) { return null; }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<List<String>>() {}); }
        catch (Exception e) { return List.of(); }
    }

    /* ══════════════════════════════════════════════════════════════
       DTOs de requête
       ══════════════════════════════════════════════════════════════ */

    @Data
    public static class DecisionRequest {
        private String decision;
        private String commentaire;
    }

    @Data
    public static class RhDecisionRequest {
        private String decision;
        private String commentaire;
        private String traiteeParRh;
    }

    @Data
    public static class PlanifierRequest {
        private LocalDate dateDebutReelle;
        private LocalDate dateFinReelle;
        private String lieu;
    }

    @Data
    public static class CompleterRequest {
        private Boolean certificatObtenu;
        private Integer evaluation;
        private String noteEvaluation;
    }
}