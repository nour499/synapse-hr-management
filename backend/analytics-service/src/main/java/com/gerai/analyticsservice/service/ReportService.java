package com.gerai.analyticsservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final StatsService statsService;

    /* ── Congés ──────────────────────────────────────── */

    public byte[] generateCongesPdf(Long deptId, Authentication auth) throws JRException {
        return pdf("reports/conges_report.jrxml", buildCongesParams(),
                statsService.getCongesForReport(deptId, auth));
    }

    public byte[] generateCongesExcel(Long deptId, Authentication auth) throws JRException {
        return excel("reports/conges_report_excel.jrxml", buildCongesParams(),
                statsService.getCongesForReport(deptId, auth));
    }

    /* ── Formations ──────────────────────────────────── */

    public byte[] generateFormationsPdf(Long deptId, Authentication auth) throws JRException {
        return pdf("reports/formations_report.jrxml", buildFormationsParams(),
                statsService.getFormationsForReport(deptId, auth));
    }

    public byte[] generateFormationsExcel(Long deptId, Authentication auth) throws JRException {
        return excel("reports/formations_report_excel.jrxml", buildFormationsParams(),
                statsService.getFormationsForReport(deptId, auth));
    }

    /* ── Projets ─────────────────────────────────────── */

    public byte[] generateProjetsPdf(Long deptId, Authentication auth) throws JRException {
        return pdf("reports/projets_report.jrxml", buildProjetsParams(deptId, auth),
                statsService.getProjetsForReport(deptId, auth));
    }

    /* ── Fiche employé ───────────────────────────────── */

    /**
     * Génère le rapport PDF de la fiche signalétique d'un employé.
     * * @param id L'identifiant de l'employé (EMPLOYEE_ID)
     * @return le flux d'octets du PDF généré
     */
    public byte[] generateFicheEmployePdf(Long id) {
        try {
            log.info("[Report] Génération fiche employé pour ID: {}", id);

            // 1. Récupération des informations de base (Oracle)
            Map<String, Object> empInfos = statsService.getEmployeInfos(id);

            // 2. Préparation des paramètres pour Jasper
            Map<String, Object> params = new HashMap<>();
            params.put("EMPLOYE_NOM",    empInfos.getOrDefault("NOM_COMPLET", "Inconnu"));
            params.put("MATRICULE",      empInfos.getOrDefault("MATRICULE", "N/A"));
            params.put("DEPARTEMENT",    empInfos.getOrDefault("DEPARTEMENT", "N/A"));
            params.put("EMAIL",          empInfos.getOrDefault("EMAIL", "-"));
            params.put("DATE_EMBAUCHE",  empInfos.getOrDefault("DATE_EMBAUCHE", "-"));
            params.put("EMPLOYE_ID",     id);

            // Date de génération formatée
            params.put("GENERATED_DATE", new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new java.util.Date()));

            // 3. Récupération de l'historique (Tableau des demandes)
            // Cette méthode doit retourner une List<Map<String, Object>>
            List<Map<String, Object>> historique = statsService.getDemandesEmploye(id);

            // 4. Chargement du fichier .jrxml ou .jasper
            InputStream reportStream = getClass().getResourceAsStream("/reports/fiche_employe.jrxml");
            JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

            // 5. Remplissage du rapport avec les données
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(historique);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);

            // 6. Export en PDF
            return JasperExportManager.exportReportToPdf(jasperPrint);

        } catch (Exception e) {
            log.error("[Report] Erreur lors de la génération du PDF pour l'employé {}", id, e);
            throw new RuntimeException("Erreur lors de la génération du rapport PDF", e);
        }
    }

    /* ── Dashboard (RH global — null = pas de filtre rôle) ── */

    public byte[] generateDashboardPdf() throws JRException {
        // getDashboard(null) retourne le dashboard global sans filtre département
        var dashboard  = statsService.getDashboard(null);
        var formations = statsService.getFormationStats();
        var conges     = statsService.getCongeStats();

        Map<String, Object> p = base("Tableau de Bord RH");
        p.put("KPI_CONGES_EN_COURS",     dashboard.getAbsentsAujourdhui());
        p.put("KPI_CONGES_MOIS",
                dashboard.getDemandesParType().getOrDefault("CONGE", 0L));
        p.put("KPI_JOURS_CONGES",        conges.getTotalConges());
        p.put("KPI_TAUX_ABSENTEISME",    dashboard.getTauxAbsenteismeMoisCourant());
        p.put("KPI_ABSENTS_JOUR",        dashboard.getAbsentsAujourdhui());
        p.put("KPI_DEMANDES_EN_ATTENTE", dashboard.getDemandesEnAttente());
        p.put("KPI_DEMANDES_TRAITEES",   dashboard.getDemandesValidees());
        p.put("KPI_DEMANDES_REFUSEES",   dashboard.getDemandesRejetees());
        p.put("KPI_FORMATIONS_EN_COURS", formations.getFormationsEnAttente());
        p.put("KPI_BUDGET_FORMATION",    formations.getBudgetTotal());
        p.put("KPI_PROJETS_ACTIFS",      dashboard.getProjetsActifs());
        p.put("KPI_TACHES_OUVERTES",     dashboard.getTachesOuvertes());
        p.put("REPORT_PERIOD",
                "Mensuel – " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM/yyyy")));

        return pdf("reports/dashboard_report.jrxml", p, statsService.getStatsParDepartement());
    }

    /* ══════════════════════════════════════════════════
       MOTEUR JASPER
       ══════════════════════════════════════════════════ */

    private byte[] pdf(String path, Map<String, Object> params,
                       List<Map<String, Object>> data) throws JRException {
        return JasperExportManager.exportReportToPdf(fill(path, params, data));
    }

    private byte[] excel(String path, Map<String, Object> params,
                         List<Map<String, Object>> data) throws JRException {
        try {
            JasperPrint print = fill(path, params, data);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            JRXlsxExporter exp = new JRXlsxExporter();
            exp.setExporterInput(new SimpleExporterInput(print));
            exp.setExporterOutput(new SimpleOutputStreamExporterOutput(out));
            SimpleXlsxReportConfiguration cfg = new SimpleXlsxReportConfiguration();
            cfg.setOnePagePerSheet(false);
            cfg.setRemoveEmptySpaceBetweenRows(true);
            cfg.setDetectCellType(true);
            cfg.setWhitePageBackground(false);
            exp.setConfiguration(cfg);
            exp.exportReport();
            return out.toByteArray();
        } catch (Exception e) {
            throw new JRException("Erreur Excel : " + path, e);
        }
    }

    private JasperPrint fill(String path, Map<String, Object> params,
                             List<Map<String, Object>> data) throws JRException {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {
            JasperReport report = JasperCompileManager.compileReport(in);
            Collection<Map<String, ?>> normalized = new ArrayList<>();
            if (data != null) {
                for (Map<String, Object> row : data) {
                    Map<String, Object> up = new LinkedHashMap<>();
                    row.forEach((k, v) -> {
                        Object val = v;
                        if (v instanceof Long l)    val = java.math.BigDecimal.valueOf(l);
                        else if (v instanceof Integer i) val = java.math.BigDecimal.valueOf(i);
                        up.put(k.toUpperCase(), val);
                    });
                    normalized.add(up);
                }
            }
            log.info("[Report] {} — {} ligne(s)", path, normalized.size());
            return JasperFillManager.fillReport(report, params,
                    new JRMapCollectionDataSource(normalized));
        } catch (Exception e) {
            log.error("[Report] Erreur Jasper {} : {}", path, e.getMessage());
            throw new JRException("Erreur rapport : " + path, e);
        }
    }

    /* ── Builders ────────────────────────────────────── */

    private Map<String, Object> base(String titre) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("REPORT_TITLE",   titre);
        p.put("GENERATED_DATE",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        return p;
    }

    private Map<String, Object> buildCongesParams() {
        Map<String, Object> p = base("Récapitulatif des Congés");
        var s = statsService.getCongeStats();
        p.put("TOTAL_CONGES",   s.getTotalConges());
        p.put("CONGES_VALIDES", s.getCongesValides());
        p.put("CONGES_REFUSES", s.getCongesRefuses());
        p.put("MOYENNE_JOURS",  s.getMoyenneJours());
        return p;
    }

    private Map<String, Object> buildFormationsParams() {
        Map<String, Object> p = base("Rapport des Formations");
        var s = statsService.getFormationStats();
        p.put("TOTAL_FORMATIONS",    s.getTotalFormations());
        p.put("FORMATIONS_VALIDEES", s.getFormationsValidees());
        p.put("BUDGET_TOTAL",        s.getBudgetTotal());
        p.put("MOYENNE_DUREE",       s.getMoyenneDureeJours());
        return p;
    }

    private Map<String, Object> buildProjetsParams(Long deptId, Authentication auth) {
        Map<String, Object> p = base("Rapport des Projets");
        List<Map<String, Object>> rows = statsService.getProjetsForReport(deptId, auth);
        long total    = rows.size();
        long enCours  = rows.stream().filter(r -> "EN_COURS".equals(r.get("STATUT"))).count();
        long termines = rows.stream().filter(r -> "TERMINE".equals(r.get("STATUT"))).count();
        p.put("TOTAL_PROJETS",    total);
        p.put("PROJETS_EN_COURS", enCours);
        p.put("PROJETS_TERMINES", termines);
        return p;
    }

    /* ═══════════════════════════════════════════════════════════
       EXPORTS GÉNÉRIQUES (rapports frontend)
       Construit un JRXML tabulaire à la volée depuis les clés des Maps.
       ═══════════════════════════════════════════════════════════ */

    public byte[] exportRowsPdf(List<Map<String, Object>> rows, String title) throws JRException {
        return JasperExportManager.exportReportToPdf(fillRows(rows, title));
    }

    public byte[] exportRowsExcel(List<Map<String, Object>> rows, String title) throws JRException {
        JasperPrint print = fillRows(rows, title);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            JRXlsxExporter exp = new JRXlsxExporter();
            exp.setExporterInput(new SimpleExporterInput(print));
            exp.setExporterOutput(new SimpleOutputStreamExporterOutput(out));
            SimpleXlsxReportConfiguration cfg = new SimpleXlsxReportConfiguration();
            cfg.setOnePagePerSheet(false);
            cfg.setRemoveEmptySpaceBetweenRows(true);
            cfg.setDetectCellType(false);
            cfg.setWhitePageBackground(false);
            exp.setConfiguration(cfg);
            exp.exportReport();
            return out.toByteArray();
        } catch (Exception e) {
            throw new JRException("Erreur Excel générique : " + title, e);
        }
    }

    private JasperPrint fillRows(List<Map<String, Object>> rows, String title) throws JRException {
        List<String> cols = new ArrayList<>();
        if (rows != null && !rows.isEmpty()) cols.addAll(rows.get(0).keySet());

        String jrxml = buildGenericJrxml(cols, title);
        try (InputStream in = new java.io.ByteArrayInputStream(
                jrxml.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
            JasperReport report = JasperCompileManager.compileReport(in);

            Collection<Map<String, ?>> normalized = new ArrayList<>();
            if (rows != null) {
                for (Map<String, Object> row : rows) {
                    Map<String, Object> up = new LinkedHashMap<>();
                    for (String k : cols) {
                        Object v = row.get(k);
                        up.put(k, v == null ? "" : v.toString());
                    }
                    normalized.add(up);
                }
            }
            Map<String, Object> params = new HashMap<>();
            params.put("REPORT_TITLE", title);
            return JasperFillManager.fillReport(report, params,
                    new JRMapCollectionDataSource(normalized));
        } catch (Exception e) {
            throw new JRException("Erreur rapport générique : " + title, e);
        }
    }

    private String buildGenericJrxml(List<String> cols, String title) {
        int pageWidth = 595;
        int margin    = 20;
        int usable    = pageWidth - 2 * margin;
        int colW      = cols.isEmpty() ? usable : Math.max(50, usable / cols.size());
        int detailH   = 18;

        StringBuilder fields = new StringBuilder();
        StringBuilder header = new StringBuilder();
        StringBuilder detail = new StringBuilder();
        int x = 0;
        for (String raw : cols) {
            String f = raw.replaceAll("[^A-Za-z0-9_]", "_");
            fields.append("    <field name=\"").append(f)
                    .append("\" class=\"java.lang.String\"/>\n");
            header.append("      <staticText>")
                    .append("<reportElement x=\"").append(x).append("\" y=\"0\" width=\"")
                    .append(colW).append("\" height=\"").append(detailH)
                    .append("\"/><text><![CDATA[").append(raw).append("]]></text></staticText>\n");
            detail.append("      <textField>")
                    .append("<reportElement x=\"").append(x).append("\" y=\"0\" width=\"")
                    .append(colW).append("\" height=\"").append(detailH)
                    .append("\"/><textFieldExpression><![CDATA[$F{").append(f)
                    .append("}]]></textFieldExpression></textField>\n");
            x += colW;
        }

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<!DOCTYPE jasperReport PUBLIC \"-//JasperReports//DTD Report Design//EN\" \"http://jasperreports.sourceforge.net/dtds/jasperreport.dtd\">\n" +
                "<jasperReport xmlns=\"http://jasperreports.sourceforge.net/jasperreports\" " +
                "name=\"generic_report\" " +
                "pageWidth=\"" + pageWidth + "\" pageHeight=\"842\" " +
                "columnWidth=\"" + usable + "\" leftMargin=\"" + margin + "\" rightMargin=\"" + margin + "\" " +
                "topMargin=\"20\" bottomMargin=\"20\">\n" +
                "  <parameter name=\"REPORT_TITLE\" class=\"java.lang.String\"/>\n" +
                fields +
                "  <title><band height=\"30\"><staticText>" +
                "<reportElement x=\"0\" y=\"0\" width=\"" + usable + "\" height=\"30\"/>" +
                "<textElement><font size=\"16\"/></textElement>" +
                "<text><![CDATA[" + title + "]]></text></staticText></band></title>\n" +
                "  <columnHeader><band height=\"" + detailH + "\">\n" + header + "  </band></columnHeader>\n" +
                "  <detail><band height=\"" + detailH + "\">\n" + detail + "  </band></detail>\n" +
                "</jasperReport>";
    }
}