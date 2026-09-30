package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.dto.DemandeRecrutementDTO;
import com.gerai.projetsservice.service.RecrutementService;
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

@Slf4j
@RestController
@RequestMapping("/api/chef/recrutement")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class RecrutementDemandeController {

    private final RecrutementService recrutementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('CHEF','ADMIN','RH')")
    public ResponseEntity<List<DemandeRecrutementDTO>> getDemandes(
            @RequestParam(required = false) String chefId) {
        return ResponseEntity.ok(recrutementService.getDemandes(chefId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CHEF','ADMIN','RH')")
    public ResponseEntity<DemandeRecrutementDTO> createDemande(
            @RequestBody DemandeRecrutementDTO req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recrutementService.createDemande(req, auth));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF','ADMIN','RH')")
    public ResponseEntity<Void> deleteDemande(@PathVariable Long id) {
        recrutementService.deleteDemande(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convertir")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<DemandeRecrutementDTO> convertir(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.convertirDemande(id, str(body.get("traiteePar"))));
    }

    @PutMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<DemandeRecrutementDTO> rejeter(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.rejeterDemande(
                id, str(body.get("motif")), str(body.get("traiteePar"))));
    }

    private static String str(Object o) { return o != null ? o.toString() : null; }
}
