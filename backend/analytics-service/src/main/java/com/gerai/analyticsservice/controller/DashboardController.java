package com.gerai.analyticsservice.controller;

import com.gerai.analyticsservice.dto.DashboardSummaryDTO;
import com.gerai.analyticsservice.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Tableau de bord analytique global.
 * Expose {@code StatsService.getDashboard(auth)} (KPIs par rôle)
 * jusqu'ici orphelin (aucun controller ne le mappe).
 * Correspond au besoin de dashboard de l'admin/RH/chef.
 */
@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class DashboardController {

    private final StatsService statsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<DashboardSummaryDTO> getDashboard(Authentication auth) {
        return ResponseEntity.ok(statsService.getDashboard(auth));
    }
}
