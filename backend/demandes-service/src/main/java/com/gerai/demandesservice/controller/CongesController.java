package com.gerai.demandesservice.controller;

import com.gerai.demandesservice.dto.DemandeRequest;
import com.gerai.demandesservice.dto.DemandeResponse;
import com.gerai.demandesservice.dto.TeamAbsenceDTO;
import com.gerai.demandesservice.model.StatutDemande;
import com.gerai.demandesservice.model.TypeDemande;
import com.gerai.demandesservice.service.DemandeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller REST des congés — expose les routes attendues par le frontend
 * sous le préfixe /api/conges.
 *
 * Délègue la logique métier à DemandeService (congés = demandes de type CONGE).
 */
@Slf4j
@RestController
@RequestMapping("/api/conges")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class CongesController {

    private final DemandeService demandeService;

    /**
     * Solde de congés de l'employé connecté.
     * Frontend (SoldeConge) : annuel, annuelTotal, maladie, maladieTotal, rtt,
     * rttTotal, pris, anneeEnCours, employeId.
     */
    @GetMapping("/solde")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Map<String, Object>> getSolde(Authentication auth) {
        Map<String, Object> backend = demandeService.getCongesSolde(auth);
        Map<String, Object> solde = new LinkedHashMap<>();
        int total = (int) backend.getOrDefault("soldeTotal", 30);
        int utilise = (int) backend.getOrDefault("soldeUtilise", 0);
        int restant = (int) backend.getOrDefault("soldeRestant", total);
        solde.put("employeId", backend.get("employeeId"));
        solde.put("annuel", restant);
        solde.put("annuelTotal", total);
        solde.put("maladie", 0);
        solde.put("maladieTotal", 0);
        solde.put("rtt", 0);
        solde.put("rttTotal", 0);
        solde.put("pris", utilise);
        solde.put("anneeEnCours", LocalDate.now().getYear());
        return ResponseEntity.ok(solde);
    }

    /**
     * Demandes de congé de l'employé connecté.
     */
    @GetMapping("/mes-demandes")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<DemandeResponse>> getMesDemandes(Authentication auth) {
        return ResponseEntity.ok(demandeService.getMesConges(auth));
    }

    /**
     * Toutes les demandes de congé — vue administration/RH.
     *
     * Accessible uniquement aux rôles RH, ADMIN et ADMIN_RH.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<DemandeResponse>> getAdminConges() {
        return ResponseEntity.ok(demandeService.getTousLesConges());
    }

    /**
     * Statistiques des congés de l'employé connecté.
     * Frontend (StatistiquesConges) : totalDemandes, enAttente, approuvees,
     * rejetees, joursRestantsTotal, tauxUtilisation.
     */
    @GetMapping("/statistiques")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Map<String, Object>> getStatistiques(Authentication auth) {
        List<DemandeResponse> demandes = demandeService.getMesConges(auth);
        long enAttente = demandes.stream()
                .filter(d -> d.getStatut() == StatutDemande.EN_ATTENTE).count();
        long approuvees = demandes.stream()
                .filter(d -> d.getStatut() != null && d.getStatut().name().startsWith("VALIDEE")).count();
        long rejetees = demandes.stream()
                .filter(d -> d.getStatut() == StatutDemande.REJETEE).count();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDemandes", demandes.size());
        stats.put("enAttente", enAttente);
        stats.put("approuvees", approuvees);
        stats.put("rejetees", rejetees);
        stats.put("joursRestantsTotal", demandeService.getCongesSolde(auth).get("soldeRestant"));
        stats.put("tauxUtilisation", demandes.isEmpty() ? 0
                : Math.round((approuvees * 100.0) / demandes.size()));
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère en une seule requête : solde + demandes + statistiques.
     */
    @GetMapping("/complet")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Map<String, Object>> getComplet(Authentication auth) {
        Map<String, Object> complet = new LinkedHashMap<>();
        complet.put("solde", getSolde(auth).getBody());
        complet.put("demandes", demandeService.getMesConges(auth));
        complet.put("statistiques", getStatistiques(auth).getBody());
        return ResponseEntity.ok(complet);
    }

    /**
     * Absences de l'équipe sur une plage de dates (vue chef/équipe).
     * Retourne un DTO allégé (TeamAbsenceDTO) dont les noms de champs
     * correspondent exactement à l'interface Angular TeamAbsence —
     * DemandeResponse expose employeNom/employePrenom/typeConge/statutFrontend,
     * jamais nom/prenom/type/statut directement.
     */
    @GetMapping("/equipe")
    @PreAuthorize("hasAnyRole('CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<TeamAbsenceDTO>> getEquipe(
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin,
            Authentication auth) {
        LocalDate d1 = dateDebut != null ? LocalDate.parse(dateDebut) : LocalDate.now().minusMonths(1);
        LocalDate d2 = dateFin != null ? LocalDate.parse(dateFin) : LocalDate.now().plusMonths(1);
        List<DemandeResponse> demandes = demandeService.getCongesEquipe(auth, d1, d2);
        List<TeamAbsenceDTO> absences = demandes.stream()
                .map(this::toTeamAbsence)
                .toList();
        return ResponseEntity.ok(absences);
    }

    private TeamAbsenceDTO toTeamAbsence(DemandeResponse d) {
        return TeamAbsenceDTO.builder()
                .employeId(d.getEmployeId())
                .nom(d.getEmployeNom())
                .prenom(d.getEmployePrenom())
                .type(d.getTypeConge() != null ? d.getTypeConge() : "ANNUEL")
                .dateDebut(d.getDateDebut())
                .dateFin(d.getDateFin())
                .statut(d.getStatutFrontend() != null ? d.getStatutFrontend() : "EN_ATTENTE")
                .build();
    }

    /**
     * Crée une demande de congé (type CONGE).
     */
    @PostMapping("/demander")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<DemandeResponse> demander(@RequestBody DemandeRequest request,
                                                    Authentication auth) {
        request.setType(TypeDemande.CONGE);
        DemandeResponse response = demandeService.creerDemande(request, auth);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    /**
     * Annule une demande de congé.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYE','CHEF','RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<DemandeResponse> annuler(@PathVariable Long id,
                                                   Authentication auth) {
        return ResponseEntity.ok(demandeService.annulerDemande(id));
    }
}