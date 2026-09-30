package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.dto.PerformanceChefDTO;
import com.gerai.projetsservice.service.ProjetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@Slf4j
@RestController
@RequestMapping("/api/chef/performance")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class ChefPerformanceController {

    private final ProjetService projetService;

    @GetMapping
    @PreAuthorize("hasRole('CHEF')")
    public ResponseEntity<PerformanceChefDTO> getPerformance(Authentication auth) {
        return ResponseEntity.ok(projetService.getPerformanceChef(auth));
    }
}
