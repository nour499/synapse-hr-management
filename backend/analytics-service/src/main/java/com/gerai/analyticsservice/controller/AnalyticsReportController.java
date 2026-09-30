package com.gerai.analyticsservice.controller;

import com.gerai.analyticsservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JRException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Expose les générateurs Jasper complets de {@code ReportService}
 * (jusqu'ici orphelins : aucun controller ne les mappe).
 *
 * Ces endpoints remplacent avantageusement les exports génériques pour
 * produire de vrais rapports .jrxml (congés, formations, projets,
 * fiche employé, tableau de bord RH).
 */
@Slf4j
@RestController
@RequestMapping("/api/analytics/rapports")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class AnalyticsReportController {

    private final ReportService reportService;

    /* ── Congés ──────────────────────────────────────── */

    @GetMapping("/conges/pdf")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> congesPdf(@RequestParam(required = false) Long deptId,
                                            Authentication auth) {
        try {
            return pdf("rapport-conges.pdf", reportService.generateCongesPdf(deptId, auth));
        } catch (JRException e) {
            return error(e);
        }
    }

    @GetMapping("/conges/excel")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> congesExcel(@RequestParam(required = false) Long deptId,
                                              Authentication auth) {
        try {
            return excel("rapport-conges.xlsx", reportService.generateCongesExcel(deptId, auth));
        } catch (JRException e) {
            return error(e);
        }
    }

    /* ── Formations ──────────────────────────────────── */

    @GetMapping("/formations/pdf")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> formationsPdf(@RequestParam(required = false) Long deptId,
                                                Authentication auth) {
        try {
            return pdf("rapport-formations.pdf", reportService.generateFormationsPdf(deptId, auth));
        } catch (JRException e) {
            return error(e);
        }
    }

    @GetMapping("/formations/excel")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> formationsExcel(@RequestParam(required = false) Long deptId,
                                                  Authentication auth) {
        try {
            return excel("rapport-formations.xlsx", reportService.generateFormationsExcel(deptId, auth));
        } catch (JRException e) {
            return error(e);
        }
    }

    /* ── Projets ─────────────────────────────────────── */

    @GetMapping("/projets/pdf")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> projetsPdf(@RequestParam(required = false) Long deptId,
                                             Authentication auth) {
        try {
            return pdf("rapport-projets.pdf", reportService.generateProjetsPdf(deptId, auth));
        } catch (JRException e) {
            return error(e);
        }
    }

    /* ── Fiche employé ───────────────────────────────── */

    @GetMapping("/employes/{id}/fiche/pdf")
    @PreAuthorize("hasAnyRole('RH','CHEF','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> ficheEmployePdf(@PathVariable Long id) {
        try {
            return pdf("fiche-employe-" + id + ".pdf", reportService.generateFicheEmployePdf(id));
        } catch (Exception e) {
            return error(e);
        }
    }

    /* ── Tableau de bord RH (PDF) ────────────────────── */

    @GetMapping("/dashboard/pdf")
    @PreAuthorize("hasAnyRole('RH','ADMIN','ADMIN_RH')")
    public ResponseEntity<byte[]> dashboardPdf() {
        try {
            return pdf("tableau-de-bord.pdf", reportService.generateDashboardPdf());
        } catch (JRException e) {
            return error(e);
        }
    }

    /* ── Helpers ─────────────────────────────────────── */

    private ResponseEntity<byte[]> pdf(String filename, byte[] data) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(data);
    }

    private ResponseEntity<byte[]> excel(String filename, byte[] data) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(data);
    }

    private ResponseEntity<byte[]> error(Exception e) {
        log.error("[AnalyticsReport] Échec génération rapport : {}", e.getMessage());
        return ResponseEntity.status(500).body(null);
    }
}
