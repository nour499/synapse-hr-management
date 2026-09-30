package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.service.RecrutementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/interviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class InterviewController {

    private final RecrutementService recrutementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<List<?>> getInterviews() {
        return ResponseEntity.ok(recrutementService.getInterviews());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> createInterview(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recrutementService.createInterview(body));
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.updateInterviewStatut(id, str(body.get("statut"))));
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> saveDecision(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.saveDecision(id, body));
    }

    @PostMapping("/{id}/send-invitation")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> sendInvitation(@PathVariable Long id) {
        return ResponseEntity.ok(recrutementService.sendInvitation(id));
    }

    private static String str(Object o) { return o != null ? o.toString() : null; }
}
