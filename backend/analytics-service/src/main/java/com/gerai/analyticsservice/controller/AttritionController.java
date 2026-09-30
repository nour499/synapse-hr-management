package com.gerai.analyticsservice.controller;

import com.gerai.analyticsservice.dto.AttritionPredictionDTO;
import com.gerai.analyticsservice.dto.AttritionSummaryDTO;
import com.gerai.analyticsservice.service.AttritionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Prédictions d'attrition (départ volontaire).
 * Correspond au service Angular AttritionService :
 *   GET /api/admin/attrition/summary
 *   GET /api/admin/attrition/predictions
 *   GET /api/admin/attrition/predictions/{id}
 *   POST /api/admin/attrition/refresh
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/attrition")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class AttritionController {

    private final AttritionService attritionService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<AttritionSummaryDTO> getSummary() {
        return ResponseEntity.ok(attritionService.getSummary());
    }

    @GetMapping("/predictions")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<List<AttritionPredictionDTO>> getPredictions() {
        return ResponseEntity.ok(attritionService.getPredictions());
    }

    @GetMapping("/predictions/{id}")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<AttritionPredictionDTO> getPrediction(@PathVariable Long id) {
        return ResponseEntity.ok(attritionService.getPrediction(id));
    }

    @PostMapping("/refresh")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<Void> refresh() {
        attritionService.refresh();
        return ResponseEntity.ok().build();
    }
}
