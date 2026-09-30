package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.dto.CvScoreResultDTO;
import com.gerai.projetsservice.dto.EmailDraftDTO;
import com.gerai.projetsservice.service.RecrutementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class CandidateController {

    private final RecrutementService recrutementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<List<?>> getCandidates() {
        return ResponseEntity.ok(recrutementService.getCandidates());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        recrutementService.deleteCandidate(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.updateStatut(id, str(body.get("statut"))));
    }

    @PutMapping("/{id}/shortlist")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> toggleShortlist(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Boolean v = body.get("shortliste") instanceof Boolean b ? b : null;
        return ResponseEntity.ok(recrutementService.toggleShortlist(id, v));
    }

    @PutMapping("/{id}/note")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> saveNote(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.saveNote(id, str(body.get("noteRecruteur"))));
    }
    @PutMapping("/{id}/email")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<?> updateEmail(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        return ResponseEntity.ok(
                recrutementService.updateEmail(id, str(body.get("email")))
        );
    }

    @PostMapping("/{id}/cv")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> uploadCv(@PathVariable Long id,
                                                        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(recrutementService.uploadCv(id, file));
    }

    @PostMapping("/{id}/ai-score")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<CvScoreResultDTO> scoreCv(@PathVariable Long id) {
        return ResponseEntity.ok(recrutementService.scoreCv(id));
    }

    @PostMapping("/{id}/interview-questions")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> interviewQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(recrutementService.interviewQuestions(id));
    }

    @PostMapping("/{id}/email-draft")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<EmailDraftDTO> emailDraft(@PathVariable Long id,
                                                    @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.emailDraft(
                id, str(body.get("type")), str(body.get("dateDebut"))));
    }

    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> sendEmail(@PathVariable Long id,
                                                          @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(recrutementService.sendEmail(
                id, str(body.get("type")), str(body.get("objet")), str(body.get("corps"))));
    }

    @PostMapping("/ai-score-batch")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> batchScore() {
        return ResponseEntity.ok(recrutementService.batchScore());
    }

    @PostMapping("/auto-shortlist")
    @PreAuthorize("hasAnyRole('ADMIN','RH')")
    public ResponseEntity<Map<String, Object>> autoShortlist(
            @RequestParam(value = "threshold", required = false) Double threshold) {
        return ResponseEntity.ok(recrutementService.autoShortlist(threshold));
    }

    private static String str(Object o) { return o != null ? o.toString() : null; }
}
