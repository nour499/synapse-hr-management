package com.gerai.analyticsservice.service;

import com.gerai.analyticsservice.dto.AttritionPredictionDTO;
import com.gerai.analyticsservice.dto.AttritionSummaryDTO;
import com.gerai.analyticsservice.dto.DeptAttritionStatDTO;
import com.gerai.analyticsservice.dto.RiskFactorDTO;
import com.gerai.analyticsservice.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Prédictions d'attrition (départ volontaire) — score heuristique 0–100.
 *
 * Aucun modèle ML externe : le score est dérivé de signaux RH disponibles
 * dans GERAI (ancienneté, congés de l'année, refus, formations suivies).
 * Le frontend consomme /api/admin/attrition/summary, /predictions,
 * /predictions/{id} et /refresh.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttritionService {

    private final AnalyticsRepository repo;

    /** Recalcule et retourne toutes les prédictions. */
    public List<AttritionPredictionDTO> getPredictions() {
        List<AttritionPredictionDTO> out = new ArrayList<>();
        for (Object[] row : safe(repo.findAllEmployesForAttrition())) {
            out.add(mapRow(row));
        }
        return out;
    }

    public AttritionPredictionDTO getPrediction(Long employeId) {
        return getPredictions().stream()
                .filter(p -> p.getEmployeId() == employeId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Employé introuvable : " + employeId));
    }

    public AttritionSummaryDTO getSummary() {
        List<AttritionPredictionDTO> all = getPredictions();
        int total      = all.size();
        int eleve      = (int) all.stream().filter(p -> "ELEVE".equals(p.getRiskLevel())).count();
        int moyen      = (int) all.stream().filter(p -> "MOYEN".equals(p.getRiskLevel())).count();
        int faible     = (int) all.stream().filter(p -> "FAIBLE".equals(p.getRiskLevel())).count();
        double avg     = total == 0 ? 0 : Math.round(
                all.stream().mapToInt(AttritionPredictionDTO::getRiskScore).average().orElse(0) * 100.0) / 100.0;

        // Stats par département
        Map<String, List<AttritionPredictionDTO>> byDept = new LinkedHashMap<>();
        for (AttritionPredictionDTO p : all) {
            byDept.computeIfAbsent(p.getDepartement(), k -> new ArrayList<>()).add(p);
        }
        List<DeptAttritionStatDTO> deptStats = new ArrayList<>();
        for (Map.Entry<String, List<AttritionPredictionDTO>> e : byDept.entrySet()) {
            List<AttritionPredictionDTO> list = e.getValue();
            double dAvg = list.stream().mapToInt(AttritionPredictionDTO::getRiskScore).average().orElse(0);
            int dEleve = (int) list.stream().filter(p -> "ELEVE".equals(p.getRiskLevel())).count();
            deptStats.add(DeptAttritionStatDTO.builder()
                    .departement(e.getKey())
                    .avgScore(Math.round(dAvg * 100.0) / 100.0)
                    .risqueEleve(dEleve)
                    .total(list.size())
                    .build());
        }

        return AttritionSummaryDTO.builder()
                .totalEmployes(total)
                .risqueEleve(eleve)
                .risqueMoyen(moyen)
                .risqueFaible(faible)
                .avgScore(avg)
                .deptStats(deptStats)
                .build();
    }

    /** Déclenche un recalcul (le score étant stateless, on se contente de logger). */
    public void refresh() {
        int n = getPredictions().size();
        log.info("[Attrition] Recalcul des scores pour {} employés", n);
    }

    /* ── Mapping d'une ligne Oracle → DTO ─────────────── */

    private AttritionPredictionDTO mapRow(Object[] r) {
        long    id         = asLong(r, 0);
        String  prenom     = asStr(r, 1);
        String  nom        = asStr(r, 2);
        String  departement = asStr(r, 3);
        String  poste      = asStr(r, 4);
        String  photo      = r.length > 5 && r[5] != null ? r[5].toString() : null;
        LocalDate hire     = r.length > 6 && r[6] != null ? tryDate(r[6]) : null;
        int     congesAnnee = asInt(r, 7);
        int     refuses    = asInt(r, 8);
        int     formations = asInt(r, 9);

        List<RiskFactorDTO> facteurs = new ArrayList<>();
        int score = 0;

        // Ancienneté
        long mois = hire != null ? ChronoUnit.MONTHS.between(hire, LocalDate.now()) : 999;
        int ancScore = mois < 12 ? 25 : mois < 36 ? 12 : 0;
        if (ancScore > 0) {
            facteurs.add(RiskFactorDTO.builder()
                    .label(mois < 12 ? "Ancienneté < 1 an" : "Ancienneté < 3 ans")
                    .impact(ancScore).icon("ti ti-hourglass").build());
            score += ancScore;
        }

        // Congés de l'année
        int congScore = Math.min(congesAnnee * 5, 25);
        if (congScore > 0) {
            facteurs.add(RiskFactorDTO.builder()
                    .label("Absentéisme élevé (" + congesAnnee + " congé(s))")
                    .impact(congScore).icon("ti ti-calendar-off").build());
            score += congScore;
        }

        // Refus de demandes
        int refScore = Math.min(refuses * 10, 15);
        if (refScore > 0) {
            facteurs.add(RiskFactorDTO.builder()
                    .label("Demandes refusées (" + refuses + ")")
                    .impact(refScore).icon("ti ti-mood-sad").build());
            score += refScore;
        }

        // Manque de formations
        if (formations == 0) {
            facteurs.add(RiskFactorDTO.builder()
                    .label("Aucune formation suivie")
                    .impact(10).icon("ti ti-school").build());
            score += 10;
        }

        score = Math.max(0, Math.min(100, score));
        String level = score >= 70 ? "ELEVE" : score >= 40 ? "MOYEN" : "FAIBLE";

        List<String> recommandations = new ArrayList<>();
        if (ancScore > 0)     recommandations.add("Planifier un entretien d'intégration / suivi.");
        if (congScore > 0)     recommandations.add("Vérifier la charge de travail et l'équilibre vie pro/perso.");
        if (refScore > 0)      recommandations.add("Expliquer les motifs de refus et proposer un accompagnement.");
        if (formations == 0)    recommandations.add("Proposer un plan de formation annuel.");
        if (recommandations.isEmpty()) recommandations.add("Maintenir le suivi habituel.");

        return AttritionPredictionDTO.builder()
                .employeId(id)
                .prenom(prenom)
                .nom(nom)
                .photo(photo)
                .departement(departement)
                .poste(poste)
                .riskScore(score)
                .riskLevel(level)
                .facteurs(facteurs)
                .recommandations(recommandations)
                .lastUpdated(new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new java.util.Date()))
                .build();
    }

    /* ── Helpers ─────────────────────────────────────── */

    private List<Object[]> safe(List<Object[]> rows) {
        return rows == null ? List.of() : rows;
    }

    private long asLong(Object[] r, int i) {
        Object v = r != null && i < r.length ? r[i] : null;
        if (v == null) return 0L;
        return v instanceof Number n ? n.longValue() : Long.parseLong(v.toString());
    }

    private int asInt(Object[] r, int i) {
        return (int) asLong(r, i);
    }

    private String asStr(Object[] r, int i) {
        Object v = r != null && i < r.length ? r[i] : null;
        return v == null ? "" : v.toString();
    }

    private LocalDate tryDate(Object v) {
        if (v instanceof java.sql.Date d)  return d.toLocalDate();
        if (v instanceof LocalDate ld)      return ld;
        try { return LocalDate.parse(v.toString().substring(0, 10)); }
        catch (Exception e) { return null; }
    }
}
