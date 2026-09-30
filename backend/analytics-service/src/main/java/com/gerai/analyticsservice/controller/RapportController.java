package com.gerai.analyticsservice.controller;

import com.gerai.analyticsservice.dto.RapportDataDTO;
import com.gerai.analyticsservice.service.RapportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class RapportController {

    private final RapportService rapportService;

    @GetMapping("/{type}")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<RapportDataDTO> getRapport(@PathVariable String type, Authentication auth) {
        return ResponseEntity.ok(rapportService.getRapport(type, auth));
    }

    @GetMapping("/export/{tab}")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> exportPdf(@PathVariable String tab, Authentication auth) throws Exception {
        byte[] data = rapportService.exportPdf(tab, auth);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"rapport-" + tab + ".pdf\"")
                .body(data);
    }

    @GetMapping("/export-excel/{tab}")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> exportExcel(@PathVariable String tab, Authentication auth) throws Exception {
        byte[] data = rapportService.exportExcel(tab, auth);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"rapport-" + tab + ".xlsx\"")
                .body(data);
    }
}