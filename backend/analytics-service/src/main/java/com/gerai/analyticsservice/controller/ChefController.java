package com.gerai.analyticsservice.controller;

import com.gerai.analyticsservice.dto.PerformanceChefDTO;
import com.gerai.analyticsservice.service.RapportService;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Indicateurs de performance agrégés d'un chef de projet.
 * Correspond à GET /api/chef/performance (RapportService côté Angular).
 */
@RestController
@RequestMapping("/api/chef")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class ChefController {

    private final RapportService rapportService;

    @GetMapping("/performance")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<PerformanceChefDTO> getPerformance(Authentication auth) {
        return ResponseEntity.ok(rapportService.getPerformance(auth));
    }
}
