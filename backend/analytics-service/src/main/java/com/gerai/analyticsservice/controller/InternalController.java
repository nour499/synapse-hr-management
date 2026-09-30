package com.gerai.analyticsservice.controller;

import com.gerai.analyticsservice.dto.EmployeePersonalStatsDTO;
import com.gerai.analyticsservice.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalController {

    private final StatsService statsService;

    /**
     * Endpoint interne pour employee-service : stats personnelles (congés + formations)
     * d'un employé identifié par son EMPLOYEE_ID Oracle.
     *
     * GET /internal/employes/{employeeId}/stats-personnelles
     */
    @GetMapping("/employes/{employeeId}/stats-personnelles")
    public ResponseEntity<EmployeePersonalStatsDTO> getEmployeePersonalStats(
            @PathVariable Long employeeId) {
        log.debug("[Internal] getEmployeePersonalStats | employeeId={}", employeeId);
        return ResponseEntity.ok(statsService.getEmployeePersonalStats(employeeId));
    }
}