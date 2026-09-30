package com.gerai.analyticsservice.service;

import com.gerai.analyticsservice.dto.AttritionSummaryDTO;
import com.gerai.analyticsservice.dto.PerformanceChefDTO;
import com.gerai.analyticsservice.dto.RapportDataDTO;
import com.gerai.analyticsservice.dto.StatCardDTO;
import com.gerai.analyticsservice.repository.AnalyticsRepository;
import com.gerai.analyticsservice.config.JwtHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Rapports consommés par le frontend Angular.
 *
 * Périmètre :
 *  - RH / ADMIN / ADMIN_RH : vue globale.
 *  - Chef : uniquement SON équipe = employés dont MANAGER_ID = id du chef.
 *  - Identité du chef introuvable : résultat vide (jamais toute la base).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RapportService {

    private final AnalyticsRepository repo;
    private final StatsService        statsService;
    private final AttritionService    attritionService;
    private final ReportService       reportService;
    private final JwtHelper           jwt;

    private static final Map<String, String[]> COLS = Map.of(
            "conges",      new String[]{"employe", "type", "debut", "fin", "jours", "statut"},
            "formations",  new String[]{"employe", "formation", "duree", "cout", "statut"},
            "projets",     new String[]{"projet", "priorite", "debut", "fin", "equipe", "taches", "progression", "statut"},
            "performance", new String[]{"employe", "departement", "absences", "score", "appreciation"}
    );

    /** Seuil de "risque élevé" pour les KPI du chef (à aligner sur AttritionService si différent). */
    private static final double SEUIL_RISQUE_ELEVE = 60;

    /* ═══════════════ Périmètre ═══════════════ */

    private boolean isGlobalScope(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_RH")
                        || a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_ADMIN_RH"));
    }

    /** employee_id Oracle du chef connecté (sub Keycloak, puis email). null si introuvable. */
    private Long resolveChefId(Authentication auth) {
        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) return null;
        Jwt token = jwtAuth.getToken();
        Long id = null;
        try {
            if (token.getSubject() != null) id = repo.findEmployeeIdBySubject(token.getSubject());
            if (id == null) {
                String email = token.getClaimAsString("email");
                if (email != null) id = repo.findEmployeeIdByEmail(email);
            }
        } catch (Exception e) {
            log.warn("[Rapport] Résolution du chef impossible : {}", e.getMessage());
        }
        return id;
    }

    /* ═══════════════ Rapports ═══════════════ */

    public RapportDataDTO getRapport(String type, Authentication auth) {
        String t = type == null ? "" : type.toLowerCase();
        boolean global = isGlobalScope(auth);
        Long chefId = global ? null : resolveChefId(auth);

        if (!global && chefId == null) {
            log.warn("[Rapport] Chef non identifié : rapport vide renvoyé (type={})", t);
            return RapportDataDTO.builder().stats(List.of()).rows(List.of()).build();
        }

        return switch (t) {
            case "formations"  -> formations(global, chefId);
            case "projets"     -> projets(global, chefId);
            case "performance" -> performance(global, chefId);
            default            -> conges(global, chefId);
        };
    }

    private RapportDataDTO conges(boolean global, Long chefId) {
        List<Object[]> raw = global ? repo.rapportConges() : repo.rapportCongesParEquipe(chefId);
        List<Map<String, Object>> rows = toMaps(raw, COLS.get("conges"));
        List<StatCardDTO> stats;
        if (global) {
            var c = statsService.getCongeStats();
            stats = List.of(
                    card("Total congés", c.getTotalConges(), "ti ti-calendar", "#3B82F6"),
                    card("Validés",      c.getCongesValides(), "ti ti-check", "#22C55E"),
                    card("Refusés",      c.getCongesRefuses(), "ti ti-mood-sad", "#EF4444"),
                    card("Moy. jours",   c.getMoyenneJours(), "ti ti-clock", "#F59E0B"));
        } else {
            long valides = count(raw, 5, "VALIDE_RH");
            long refuses = count(raw, 5, "REFUSE");
            double moy = avg(raw, 4);
            stats = List.of(
                    card("Total congés", raw.size(), "ti ti-calendar", "#3B82F6"),
                    card("Validés",      valides, "ti ti-check", "#22C55E"),
                    card("Refusés",      refuses, "ti ti-mood-sad", "#EF4444"),
                    card("Moy. jours",   round2(moy), "ti ti-clock", "#F59E0B"));
        }
        return RapportDataDTO.builder().stats(stats).rows(rows).build();
    }

    private RapportDataDTO formations(boolean global, Long chefId) {
        List<Object[]> raw = global ? repo.rapportFormations() : repo.rapportFormationsParEquipe(chefId);
        List<Map<String, Object>> rows = toMaps(raw, COLS.get("formations"));
        List<StatCardDTO> stats;
        if (global) {
            var f = statsService.getFormationStats();
            stats = List.of(
                    card("Total formations", f.getTotalFormations(), "ti ti-school", "#10B981"),
                    card("Validées",         f.getFormationsValidees(), "ti ti-check", "#22C55E"),
                    card("En attente",       f.getFormationsEnAttente(), "ti ti-clock", "#F59E0B"),
                    card("Budget total",     f.getBudgetTotal(), "ti ti-coin", "#8B5CF6"));
        } else {
            long validees = count(raw, 4, "APPROUVE_RH");
            long attente  = count(raw, 4, "EN_ATTENTE") + count(raw, 4, "APPROUVE_CHEF");
            double budget = raw.stream()
                    .filter(r -> r.length > 4 && "APPROUVE_RH".equals(String.valueOf(r[4])))
                    .mapToDouble(r -> asDouble(r, 3)).sum();
            stats = List.of(
                    card("Total formations", raw.size(), "ti ti-school", "#10B981"),
                    card("Validées",         validees, "ti ti-check", "#22C55E"),
                    card("En attente",       attente, "ti ti-clock", "#F59E0B"),
                    card("Budget total",     round2(budget), "ti ti-coin", "#8B5CF6"));
        }
        return RapportDataDTO.builder().stats(stats).rows(rows).build();
    }

    private RapportDataDTO projets(boolean global, Long chefId) {
        List<Object[]> raw = global ? repo.rapportProjets() : repo.rapportProjetsParEquipe(chefId);
        List<Map<String, Object>> rows = toMaps(raw, COLS.get("projets"));
        long total    = raw.size();
        long termines = count(raw, 7, "TERMINE");
        long enCours  = count(raw, 7, "EN_COURS");
        List<StatCardDTO> stats = List.of(
                card("Total projets", total, "ti ti-layout-kanban", "#3B82F6"),
                card("En cours",      enCours, "ti ti-clock", "#F59E0B"),
                card("Terminés",      termines, "ti ti-check", "#22C55E"));
        return RapportDataDTO.builder().stats(stats).rows(rows).build();
    }

    private RapportDataDTO performance(boolean global, Long chefId) {
        List<Object[]> raw = global ? repo.rapportPerformance() : repo.rapportPerformanceParEquipe(chefId);
        List<Map<String, Object>> rows = toMaps(raw, COLS.get("performance"));
        List<StatCardDTO> stats;
        if (global) {
            AttritionSummaryDTO s = attritionService.getSummary();
            stats = List.of(
                    card("Effectif",     s.getTotalEmployes(), "ti ti-users", "#3B82F6"),
                    card("Risque élevé", s.getRisqueEleve(), "ti ti-alert-triangle", "#EF4444"),
                    card("Score moyen",  s.getAvgScore(), "ti ti-chart-bar", "#8B5CF6"));
        } else {
            long risque = raw.stream().filter(r -> asDouble(r, 3) >= SEUIL_RISQUE_ELEVE).count();
            stats = List.of(
                    card("Effectif",     raw.size(), "ti ti-users", "#3B82F6"),
                    card("Risque élevé", risque, "ti ti-alert-triangle", "#EF4444"),
                    card("Score moyen",  round2(avg(raw, 3)), "ti ti-chart-bar", "#8B5CF6"));
        }
        return RapportDataDTO.builder().stats(stats).rows(rows).build();
    }

    /* ═══════════════ Performance (endpoint chef, inchangé) ═══════════════ */

    public PerformanceChefDTO getPerformance(Authentication auth) {
        Object[] p;
        if (jwt.isChef(auth)) {
            Long deptId = jwt.getDeptId(auth);
            p = deptId != null
                    ? safeFirst(repo.globalProjectStatsParDept(deptId))
                    : safeFirst(repo.globalProjectStats());
        } else {
            p = safeFirst(repo.globalProjectStats());
        }
        long total    = p != null ? asLong(p, 0) : 0;
        long termines = p != null ? asLong(p, 1) : 0;
        double tauxLivraison = total > 0 ? Math.round((termines * 100.0) / total) : 0;

        AttritionSummaryDTO s = attritionService.getSummary();
        if (s == null) s = AttritionSummaryDTO.builder().avgScore(0).build();
        double satisfaction = Math.round((5.0 - (s.getAvgScore() / 100.0) * 2.0) * 100.0) / 100.0;
        if (satisfaction < 1) satisfaction = 1;

        return PerformanceChefDTO.builder()
                .tauxLivraisonProjet(tauxLivraison)
                .satisfactionClient(satisfaction)
                .collaborationEquipe(Math.max(50, 100 - s.getAvgScore() / 2))
                .qualiteCode(Math.max(60, 100 - s.getAvgScore() / 3))
                .tempsResolutionBugs(2.5)
                .build();
    }

    /* ═══════════════ Exports (même périmètre que l'affichage) ═══════════════ */

    public byte[] exportPdf(String tab, Authentication auth) throws Exception {
        return reportService.exportRowsPdf(getRapport(tab, auth).getRows(), "Rapport " + label(tab));
    }

    public byte[] exportExcel(String tab, Authentication auth) throws Exception {
        return reportService.exportRowsExcel(getRapport(tab, auth).getRows(), "Rapport " + label(tab));
    }

    /* ═══════════════ Helpers ═══════════════ */

    private String label(String tab) {
        return switch (tab == null ? "" : tab.toLowerCase()) {
            case "formations"  -> "Formations";
            case "projets"     -> "Projets";
            case "performance" -> "Performance";
            default            -> "Congés";
        };
    }

    private StatCardDTO card(String label, Object value, String icon, String color) {
        return StatCardDTO.builder().label(label).value(value).icon(icon).color(color).build();
    }

    private List<Map<String, Object>> toMaps(List<Object[]> rows, String[] cols) {
        List<Map<String, Object>> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            for (int i = 0; i < cols.length && i < r.length; i++) {
                m.put(cols[i], "statut".equals(cols[i]) ? translateStatut(r[i]) : r[i]);
            }
            out.add(m);
        }
        return out;
    }

    private String translateStatut(Object v) {
        if (v == null) return "";
        return switch (v.toString()) {
            case "EN_ATTENTE"    -> "En attente";
            case "VALIDE_CHEF"   -> "Validé chef";
            case "VALIDE_RH"     -> "Validé";
            case "APPROUVE_CHEF" -> "Approuvé chef";
            case "APPROUVE_RH"   -> "Approuvé";
            case "APPROUVE"      -> "Approuvé";
            case "LIVRE"         -> "Validé";
            case "REFUSE"        -> "Refusé";
            case "REJETE"        -> "Refusé";
            case "ANNULE"        -> "Annulé";
            case "EN_COURS"      -> "En cours";
            case "TERMINE"       -> "Terminé";
            case "PLANIFIE"      -> "Planifié";
            case "EN_PAUSE"      -> "En pause";
            case "EN_RETARD"     -> "En retard";
            default              -> v.toString();
        };
    }

    private Object[] safeFirst(List<Object[]> rows) {
        return (rows != null && !rows.isEmpty()) ? rows.get(0) : null;
    }

    private long asLong(Object[] r, int i) {
        if (r == null || i >= r.length || r[i] == null) return 0L;
        return r[i] instanceof Number n ? n.longValue() : 0L;
    }

    private double asDouble(Object[] r, int i) {
        if (r == null || i >= r.length || r[i] == null) return 0d;
        return r[i] instanceof Number n ? n.doubleValue() : 0d;
    }

    private long count(List<Object[]> rows, int col, String value) {
        return rows.stream().filter(r -> r.length > col && value.equals(String.valueOf(r[col]))).count();
    }

    private double avg(List<Object[]> rows, int col) {
        return rows.isEmpty() ? 0d : rows.stream().mapToDouble(r -> asDouble(r, col)).average().orElse(0d);
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}