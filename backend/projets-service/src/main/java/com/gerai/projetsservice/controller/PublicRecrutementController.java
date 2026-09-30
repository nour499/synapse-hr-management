package com.gerai.projetsservice.controller;

import com.gerai.projetsservice.dto.ScreeningBundleDTO;
import com.gerai.projetsservice.service.RecrutementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class PublicRecrutementController {

    private final RecrutementService recrutementService;

    @GetMapping("/jobs")
    public ResponseEntity<List<?>> getJobs() {
        return ResponseEntity.ok(recrutementService.getPublicJobs());
    }

    @GetMapping("/jobs/{id}/screening")
    public ResponseEntity<ScreeningBundleDTO> screening(@PathVariable Long id) {
        return ResponseEntity.ok(recrutementService.getPublicScreening(id));
    }

    @PostMapping("/jobs/{id}/validate-killer")
    public ResponseEntity<Map<String, Object>> validateKiller(@PathVariable Long id,
                                                              @RequestBody Map<String, String> answers) {
        return ResponseEntity.ok(recrutementService.validateKiller(id, answers));
    }

    /**
     * Renvoie désormais un corps JSON non vide — un ResponseEntity.build()
     * sans corps est parsé comme null par Angular HttpClient (responseType
     * json par défaut), indiscernable d'un échec pour le frontend.
     */
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> apply(
            @RequestParam Map<String, String> fields,
            @RequestParam(required = false) MultipartFile cv,
            @RequestParam(required = false) String killerAnswers,
            @RequestParam(required = false) String screeningAnswers) {
        recrutementService.apply(fields, cv, killerAnswers, screeningAnswers);
        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Candidature reçue"
        ));
    }
}