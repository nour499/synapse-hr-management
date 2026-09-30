package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.dto.JobDTO;
import com.gerai.projetsservice.dto.ScreeningBundleDTO;
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
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class JobController {

    private final RecrutementService recrutementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<List<JobDTO>> getJobs() {
        return ResponseEntity.ok(recrutementService.getJobs());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recrutementService.createJob(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<JobDTO> updateJob(@PathVariable Long id, @RequestBody JobDTO req) {
        return ResponseEntity.ok(recrutementService.updateJob(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        recrutementService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ai-description")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> aiDescription(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.generateJobDescription(body));
    }

    @GetMapping("/{id}/screening")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<ScreeningBundleDTO> screening(@PathVariable Long id) {
        return ResponseEntity.ok(recrutementService.getScreening(id));
    }

    @PostMapping("/{id}/killer-questions")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> addKiller(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recrutementService.addKillerQuestion(id, body));
    }

    @DeleteMapping("/{id}/killer-questions/{qid}")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Void> deleteKiller(@PathVariable Long id, @PathVariable Long qid) {
        recrutementService.deleteKillerQuestion(id, qid);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/screening-questions")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> addScreening(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recrutementService.addScreeningQuestion(id, body));
    }

    @DeleteMapping("/{id}/screening-questions/{qid}")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Void> deleteScreening(@PathVariable Long id, @PathVariable Long qid) {
        recrutementService.deleteScreeningQuestion(id, qid);
        return ResponseEntity.noContent().build();
    }
}
