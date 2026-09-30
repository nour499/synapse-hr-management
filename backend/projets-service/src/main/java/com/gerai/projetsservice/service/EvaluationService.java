package com.gerai.projetsservice.service;

import com.gerai.projetsservice.config.JwtHelperInterface;
import com.gerai.projetsservice.dto.*;
import com.gerai.projetsservice.model.*;
import com.gerai.projetsservice.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvalCampagneRepository campagneRepo;
    private final EvalEvaluationRepository evalRepo;
    private final JwtHelperInterface jwt;
    private final EmployeService employeService;
    private final ObjectMapper objectMapper;

    /* ═══════════════════════════════════════════════════════
       CAMPAGNES
       ═════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CampagneEvaluationDTO> getCampagnes() {
        return campagneRepo.findAll().stream()
                .sorted(Comparator.comparing(EvalCampagne::getCreatedAt).reversed())
                .map(this::toCampagneDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampagneEvaluationDTO createCampagne(
            CampagneEvaluationDTO req,
            Authentication auth) {

        String creePar = req.getCreePar();

        if (creePar == null || creePar.isBlank()) {
            creePar = auth != null ? auth.getName() : null;
        }

        EvalCampagne c = EvalCampagne.builder()
                .titre(req.getTitre())
                .periode(req.getPeriode())
                .annee(req.getAnnee())
                .dateDebut(req.getDateDebut())
                .dateFin(req.getDateFin())
                .statut(req.getStatut() != null
                        ? req.getStatut()
                        : "BROUILLON")
                .creePar(creePar)
                .description(req.getDescription())
                .departementsJson(toJson(req.getDepartements()))
                .build();

        return toCampagneDTO(campagneRepo.save(c));
    }

    @Transactional
    public CampagneEvaluationDTO activerCampagne(Long id) {

        EvalCampagne c = campagneRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Campagne introuvable"));

        c.setStatut("ACTIVE");

        return toCampagneDTO(campagneRepo.save(c));
    }

    @Transactional
    public CampagneEvaluationDTO cloturerCampagne(Long id) {

        EvalCampagne c = campagneRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Campagne introuvable"));

        c.setStatut("CLOTUREE");

        return toCampagneDTO(campagneRepo.save(c));
    }

    @Transactional
    public void deleteCampagne(Long id) {
        campagneRepo.deleteById(id);
    }

    private CampagneEvaluationDTO toCampagneDTO(EvalCampagne c) {

        return CampagneEvaluationDTO.builder()
                .id(c.getCampagneId())
                .titre(c.getTitre())
                .periode(c.getPeriode())
                .annee(c.getAnnee())
                .dateDebut(c.getDateDebut())
                .dateFin(c.getDateFin())
                .statut(c.getStatut())
                .creePar(c.getCreePar())
                .description(c.getDescription())
                .departements(fromJsonList(c.getDepartementsJson()))
                .build();
    }

    /* ═══════════════════════════════════════════════════════
       ÉVALUATIONS
       ═════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluations(
            Authentication auth,
            Long chefId,
            Long employeId) {

        Long caller = jwt.getEmployeeId(auth);

        List<EvalEvaluation> list;

        if (isRh(auth) || isAdmin(auth)) {

            if (employeId != null) {
                list = evalRepo.findByEmployeId(employeId);
            } else if (chefId != null) {
                list = evalRepo.findByChefId(chefId);
            } else {
                list = evalRepo.findAll();
            }

        } else if (isChef(auth)) {

            list = evalRepo.findByChefId(caller);

        } else {

            list = evalRepo.findByEmployeId(caller);
        }

        return list.stream()
                .map(this::toEvalDTO)
                .collect(Collectors.toList());
    }

    /**
     * Complète, quand elles sont absentes du payload reçu, les informations
     * de campagne (titre/periode/annee) et de l'employé évalué
     * (nom/prénom/poste/département) à partir des données réelles —
     * jamais en dur. N'affecte ni le calcul des scores ni le workflow.
     */
    private void enrichirCampagneEtEmploye(
            EvalEvaluation e,
            Authentication auth) {

        if (e.getCampagneId() != null
                && (e.getCampagneTitre() == null
                || e.getPeriode() == null
                || e.getAnnee() == null)) {

            campagneRepo.findById(e.getCampagneId()).ifPresent(c -> {

                if (e.getCampagneTitre() == null) {
                    e.setCampagneTitre(c.getTitre());
                }

                if (e.getPeriode() == null) {
                    e.setPeriode(c.getPeriode());
                }

                if (e.getAnnee() == null) {
                    e.setAnnee(c.getAnnee());
                }
            });
        }

        if (e.getEmployeId() != null
                && (e.getEmployeNom() == null
                || e.getEmployePrenom() == null
                || e.getEmployePoste() == null
                || e.getDepartement() == null)) {

            // IMPORTANT :
            // on transmet le JWT de l'utilisateur courant
            EmployeDTO emp = employeService.getEmployeById(
                    e.getEmployeId(),
                    auth
            );

            if (emp != null) {

                if (e.getEmployeNom() == null) {
                    e.setEmployeNom(emp.getNom());
                }

                if (e.getEmployePrenom() == null) {
                    e.setEmployePrenom(emp.getPrenom());
                }

                if (e.getEmployePoste() == null) {
                    e.setEmployePoste(emp.getPoste());
                }

                if (e.getDepartement() == null) {
                    e.setDepartement(emp.getDepartement());
                }
            }
        }
    }

    @Transactional
    public EvaluationDTO createEvaluation(
            EvaluationDTO req,
            Authentication auth) {

        Long caller = jwt.getEmployeeId(auth);

        Long chefId = isChef(auth)
                ? caller
                : req.getChefId();

        EvalEvaluation e = EvalEvaluation.builder()
                .campagneId(req.getCampagneId())
                .campagneTitre(req.getCampagneTitre())
                .periode(req.getPeriode())
                .annee(req.getAnnee())
                .employeId(req.getEmployeId())
                .employeNom(req.getEmployeNom())
                .employePrenom(req.getEmployePrenom())
                .employePoste(req.getEmployePoste())
                .departement(req.getDepartement())
                .chefId(chefId)
                .statut("EN_ATTENTE")
                .tauxPresence(
                        req.getTauxPresence() != null
                                ? req.getTauxPresence()
                                : 100.0)
                .formationsRealisees(
                        req.getFormationsRealisees() != null
                                ? req.getFormationsRealisees()
                                : 0)
                .tachesCompletees(
                        req.getTachesCompletees() != null
                                ? req.getTachesCompletees()
                                : 0)
                .totalTaches(
                        req.getTotalTaches() != null
                                ? req.getTotalTaches()
                                : 0)
                .build();

        if (e.getChefId() != null) {

            var chef = employeService.getEmployeById(e.getChefId(), auth);

            if (chef != null) {
                e.setChefNom(chef.getNomComplet());
            }
        }

        enrichirCampagneEtEmploye(e, auth);

        return toEvalDTO(evalRepo.save(e));
    }

    /* ═══════════════════════════════════════════════════════
       CRÉATION BULK
       ═════════════════════════════════════════════════════ */

    @Transactional
    @SuppressWarnings("unchecked")
    public List<EvaluationDTO> createBulk(
            Map<String, Object> body,
            Authentication auth) {

        Long caller = jwt.getEmployeeId(auth);

        Long campagneId = toLong(body.get("campagneId"));
        String periode = (String) body.get("periode");
        Integer annee = toInteger(body.get("annee"));
        String titre = (String) body.get("titre");

        Object membresObj = body.get("membres");

        if (!(membresObj instanceof List)) {
            return List.of();
        }

        List<Map<String, Object>> membres =
                (List<Map<String, Object>>) membresObj;

        List<EvalEvaluation> created = new ArrayList<>();

        for (Map<String, Object> m : membres) {

            Long empId = toLong(m.get("id"));

            if (empId == null) {
                continue;
            }

            Long chefId = isChef(auth)
                    ? caller
                    : toLong(body.get("chefId"));

            EvalEvaluation e = EvalEvaluation.builder()
                    .campagneId(campagneId)
                    .campagneTitre(titre)
                    .periode(periode)
                    .annee(annee)
                    .employeId(empId)
                    .employeNom((String) m.get("nom"))
                    .employePrenom((String) m.get("prenom"))
                    .employePoste((String) m.get("poste"))
                    .departement((String) m.get("departement"))
                    .chefId(chefId)
                    .statut("EN_ATTENTE")
                    .tauxPresence(100.0)
                    .formationsRealisees(0)
                    .tachesCompletees(0)
                    .totalTaches(0)
                    .build();

            if (e.getChefId() != null) {

                var chef =
                        employeService.getEmployeById(e.getChefId(), auth);

                if (chef != null) {
                    e.setChefNom(chef.getNomComplet());
                }
            }

            enrichirCampagneEtEmploye(e, auth);

            created.add(evalRepo.save(e));
        }

        return created.stream()
                .map(this::toEvalDTO)
                .collect(Collectors.toList());
    }

    /* ═══════════════════════════════════════════════════════
       AUTO-ÉVALUATION EMPLOYÉ
       ═════════════════════════════════════════════════════ */

    @Transactional
    public EvaluationDTO soumettreAutoEval(
            Long id,
            Map<String, Object> autoEval,
            Authentication auth) {

        EvalEvaluation e = evalRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Évaluation introuvable"));

        if (isRh(auth) || isAdmin(auth)) {

            // RH/Admin autorisé à agir pour le compte de l'employé

        } else if (isChef(auth)) {

            throw new SecurityException(
                    "Seul l'employé évalué peut saisir l'auto-évaluation");

        } else {

            Long caller = jwt.getEmployeeId(auth);

            if (!caller.equals(e.getEmployeId())) {
                throw new SecurityException(
                        "Accès interdit à cette évaluation");
            }
        }

        if (!"EN_ATTENTE".equals(e.getStatut())) {
            throw new IllegalStateException(
                    "Auto-évaluation déjà soumise ou clôturée");
        }

        e.setAutoEvalJson(toJson(autoEval));
        e.setDateAutoEval(LocalDateTime.now());
        e.setStatut("AUTO_SOUMISE");

        return toEvalDTO(evalRepo.save(e));
    }

    /* ═══════════════════════════════════════════════════════
       ÉVALUATION CHEF
       ═════════════════════════════════════════════════════ */

    @Transactional
    public EvaluationDTO enregistrerEvalChef(
            Long id,
            Map<String, Object> evalChef,
            Authentication auth) {

        EvalEvaluation e = evalRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Évaluation introuvable"));

        /*
         * IMPORTANT :
         * On vérifie directement les authorities Spring.
         * Cela évite le problème rencontré avec jwt.isChef(auth).
         */
        if (isChef(auth)) {

            Long caller = jwt.getEmployeeId(auth);

            if (caller == null || !caller.equals(e.getChefId())) {

                throw new SecurityException(
                        "Vous n'êtes pas l'évaluateur de cette évaluation");
            }

        } else if (!(isRh(auth) || isAdmin(auth))) {

            throw new SecurityException(
                    "Seul un chef ou RH/Admin peut évaluer");
        }

        if (!List.of("EN_ATTENTE", "AUTO_SOUMISE")
                .contains(e.getStatut())) {

            throw new IllegalStateException(
                    "Évaluation non évaluable à ce stade");
        }

        e.setEvalChefJson(toJson(evalChef));
        e.setDateEvalChef(LocalDateTime.now());

        if (evalChef != null) {

            e.setRecommandation(
                    getString(evalChef, "recommandation"));

            e.setCommentaireRecommandation(
                    getString(evalChef, "commentaireRecommandation"));
        }

        computeScores(e);

        e.setStatut("VALIDEE_CHEF");

        return toEvalDTO(evalRepo.save(e));
    }

    /* ═══════════════════════════════════════════════════════
       VALIDATION RH
       ═══════════════════════════════════════════════════════ */

    @Transactional
    public EvaluationDTO validerRh(
            Long id,
            Map<String, Object> payload,
            Authentication auth) {

        EvalEvaluation e = evalRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Évaluation introuvable"));

        if (!"VALIDEE_CHEF".equals(e.getStatut())) {

            throw new IllegalStateException(
                    "L'évaluation doit d'abord être validée par le chef");
        }

        if (payload != null) {

            if (payload.get("scoreAjuste") != null) {

                e.setScoreAjuste(
                        toDouble(payload.get("scoreAjuste")));
            }

            e.setCommentaireRh(
                    getString(payload, "commentaireRh"));

            e.setValideeParRh(
                    getString(payload, "valideeParRh"));
        }

        // Si le payload ne fournit pas explicitement l'identité du validateur RH,
        // on la résout depuis l'utilisateur connecté (comme pour chefNom ailleurs).
        if (e.getValideeParRh() == null || e.getValideeParRh().isBlank()) {
            Long callerId = jwt.getEmployeeId(auth);
            if (callerId != null) {
                var validateur = employeService.getEmployeById(callerId);
                if (validateur != null) {
                    e.setValideeParRh(validateur.getNomComplet());
                }
            }
        }

        e.setDateValidationRh(LocalDateTime.now());

        computeScores(e);

        e.setStatut("VALIDEE_RH");

        return toEvalDTO(evalRepo.save(e));
    }

    /* ═══════════════════════════════════════════════════════
       CLÔTURE
       ═════════════════════════════════════════════════════ */

    @Transactional
    public EvaluationDTO cloturer(
            Long id,
            Authentication auth) {

        EvalEvaluation e = evalRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Évaluation introuvable"));

        if (!"VALIDEE_RH".equals(e.getStatut())) {

            throw new IllegalStateException(
                    "L'évaluation doit être validée RH avant clôture");
        }

        e.setStatut("CLOTUREE");

        return toEvalDTO(evalRepo.save(e));
    }

    /* ═══════════════════════════════════════════════════════
       CALCUL DES SCORES
       ═════════════════════════════════════════════════════ */

    private void computeScores(EvalEvaluation e) {

        Map<String, Object> chef =
                parseMap(e.getEvalChefJson());

        if (chef == null) {
            return;
        }

        double objMoy = avg(
                getNum(chef, "realisationObjectifs"),
                getNum(chef, "qualiteTravail"),
                getNum(chef, "respectDelais"),
                getNum(chef, "contributionProjets")
        );

        double compMoy = avg(
                getNum(chef, "communication"),
                getNum(chef, "autonomie"),
                getNum(chef, "collaboration"),
                getNum(chef, "adaptabilite"),
                getNum(chef, "leadershipInitiative")
        );

        int nForms =
                e.getFormationsRealisees() != null
                        ? e.getFormationsRealisees()
                        : 0;

        double fScore =
                nForms >= 3 ? 20 :
                        nForms == 2 ? 16 :
                                nForms == 1 ? 12 :
                                        4;

        double pScore = Math.round(
                ((e.getTauxPresence() != null
                        ? e.getTauxPresence()
                        : 100.0) / 100.0) * 10
        );

        double obj = Math.round(
                (objMoy / 5.0) * 40
        );

        double comp = Math.round(
                (compMoy / 5.0) * 30
        );

        e.setScoreObjectifs(obj);
        e.setScoreCompetences(comp);
        e.setScoreFormations(fScore);
        e.setScorePresence(pScore);

        double finalScore =
                obj + comp + fScore + pScore;

        if (e.getScoreAjuste() != null) {
            finalScore = e.getScoreAjuste();
        }

        e.setScoreFinal(finalScore);
        e.setMention(mentionFrom(finalScore));
    }

    private static double avg(Double... vals) {

        double sum = 0;
        int n = 0;

        for (Double v : vals) {

            if (v != null) {
                sum += v;
                n++;
            }
        }

        return n == 0 ? 0 : sum / n;
    }

    private static String mentionFrom(double score) {

        return score >= 85 ? "EXCELLENT" :
                score >= 70 ? "BIEN" :
                        score >= 55 ? "SATISFAISANT" :
                                score >= 40 ? "A_AMELIORER" :
                                        "INSUFFISANT";
    }

    /* ═══════════════════════════════════════════════════════
       MAPPING DTO
       ═════════════════════════════════════════════════════ */

    private EvaluationDTO toEvalDTO(EvalEvaluation e) {

        return EvaluationDTO.builder()
                .id(e.getEvalId())
                .campagneId(e.getCampagneId())
                .campagneTitre(e.getCampagneTitre())
                .periode(e.getPeriode())
                .annee(e.getAnnee())

                .employeId(e.getEmployeId())
                .employeNom(e.getEmployeNom())
                .employePrenom(e.getEmployePrenom())
                .employePoste(e.getEmployePoste())
                .departement(e.getDepartement())

                .chefId(e.getChefId())
                .chefNom(e.getChefNom())

                .tauxPresence(e.getTauxPresence())
                .formationsRealisees(e.getFormationsRealisees())
                .tachesCompletees(e.getTachesCompletees())
                .totalTaches(e.getTotalTaches())

                .statut(e.getStatut())

                .autoEval(parseMap(e.getAutoEvalJson()))
                .dateAutoEval(e.getDateAutoEval())

                .evalChef(parseMap(e.getEvalChefJson()))
                .dateEvalChef(e.getDateEvalChef())

                .recommandation(e.getRecommandation())
                .commentaireRecommandation(
                        e.getCommentaireRecommandation())

                .scoreAjuste(e.getScoreAjuste())
                .commentaireRh(e.getCommentaireRh())
                .dateValidationRh(e.getDateValidationRh())
                .valideeParRh(e.getValideeParRh())

                .scoreObjectifs(e.getScoreObjectifs())
                .scoreCompetences(e.getScoreCompetences())
                .scoreFormations(e.getScoreFormations())
                .scorePresence(e.getScorePresence())
                .scoreFinal(e.getScoreFinal())
                .mention(e.getMention())

                .build();
    }

    /* ═══════════════════════════════════════════════════════
       DÉTECTION DES RÔLES
       ═════════════════════════════════════════════════════ */

    private boolean hasRole(
            Authentication auth,
            String role) {

        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }

        String expected = "ROLE_" + role;

        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority ->
                        expected.equalsIgnoreCase(authority)
                                || role.equalsIgnoreCase(authority));
    }

    private boolean isChef(Authentication auth) {
        return hasRole(auth, "CHEF");
    }

    private boolean isRh(Authentication auth) {
        return hasRole(auth, "RH");
    }

    private boolean isAdmin(Authentication auth) {
        return hasRole(auth, "ADMIN")
                || hasRole(auth, "ADMIN_RH");
    }

    /* ═══════════════════════════════════════════════════════
       HELPERS JSON / TYPES
       ═════════════════════════════════════════════════════ */

    private String toJson(Object o) {

        if (o == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception ex) {

            log.warn(
                    "[EvaluationService] toJson échoué: {}",
                    ex.getMessage());

            return null;
        }
    }

    private List<String> fromJsonList(String json) {

        if (json == null) {
            return List.of();
        }

        try {
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {}
            );

        } catch (Exception ex) {
            return List.of();
        }
    }

    private Map<String, Object> parseMap(String json) {

        if (json == null) {
            return null;
        }

        try {
            return objectMapper.readValue(
                    json,
                    new TypeReference<Map<String, Object>>() {}
            );

        } catch (Exception ex) {
            return null;
        }
    }

    private static Double getNum(
            Map<String, Object> m,
            String key) {

        Object v = m.get(key);

        if (v == null) {
            return null;
        }

        if (v instanceof Number n) {
            return n.doubleValue();
        }

        try {
            return Double.parseDouble(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private static String getString(
            Map<String, Object> m,
            String key) {

        if (m == null) {
            return null;
        }

        Object value = m.get(key);

        return value != null
                ? value.toString()
                : null;
    }

    private static Long toLong(Object o) {

        if (o == null) {
            return null;
        }

        if (o instanceof Number n) {
            return n.longValue();
        }

        try {
            return Long.parseLong(o.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private static Integer toInteger(Object o) {

        if (o == null) {
            return null;
        }

        if (o instanceof Number n) {
            return n.intValue();
        }

        try {
            return Integer.parseInt(o.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private static Double toDouble(Object o) {

        if (o == null) {
            return null;
        }

        if (o instanceof Number n) {
            return n.doubleValue();
        }

        try {
            return Double.parseDouble(o.toString());
        } catch (Exception e) {
            return null;
        }
    }
}