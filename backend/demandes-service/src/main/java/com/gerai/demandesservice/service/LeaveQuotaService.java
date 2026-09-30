package com.gerai.demandesservice.service;

import com.gerai.demandesservice.model.LeaveRequest;
import com.gerai.demandesservice.model.TypeConge;
import com.gerai.demandesservice.repository.LeaveRequestRepository;
import com.gerai.demandesservice.repository.TypeCongeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Règles métier sur les congés.
 *
 * Le code du type de congé (ANNUEL, MALADIE...) est désormais lu directement
 * depuis la table TYPE_CONGE plutôt qu'une map codée en dur — évite toute
 * désynchronisation si la table évolue (nouvel ID, code renommé...).
 *
 * ⚠️ Historique : une ancienne version utilisait des IDs (1,2,4,5,6,8,9,10,
 * 11,12,14,15) qui ne correspondaient à AUCUNE ligne réelle de TYPE_CONGE.
 * Les demandes créées à cette époque portent encore ces anciens IDs et ont
 * été réalignées sur ANNUEL (22) par la migration V23 — à corriger
 * manuellement si le vrai type d'origine est connu pour un employé donné.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveQuotaService {

    private final LeaveRequestRepository leaveRepo;
    private final TypeCongeRepository typeCongeRepo;

    /**
     * Quota annuel autorisé (en jours) par type de congé.
     *
     * TODO / À CONFIRMER : la table TYPE_CONGE.NOMBRE_JOURS contient déjà ces
     * valeurs (ANNUEL=30, MALADIE=15, RTT=12, MATERNITE=112...) mais certains
     * types (SANS_SOLDE, LONGUE_MALADIE, CREATION_ENTREPRISE,
     * OBLIGATIONS_LEGALES) ont NOMBRE_JOURS=0 en base. Tant que la
     * signification de ce 0 n'est pas confirmée (illimité vs. réellement
     * plafonné à 0), cette map reste gérée manuellement ici plutôt que lue
     * automatiquement depuis NOMBRE_JOURS.
     *
     * ⚠️ Note : les valeurs ci-dessous (SANS_SOLDE=15, FAMILIAL=15) diffèrent
     * de NOMBRE_JOURS en base (SANS_SOLDE=0, FAMILIAL=5) — à réconcilier une
     * fois la règle métier confirmée.
     */
    private static final Map<Long, Integer> ANNUAL_LIMITS = Map.of(
            22L, 30,  // Congé annuel
            24L, 15,  // Congé sans solde (à confirmer : illimité ou plafonné ?)
            28L, 15,  // Congé familial
            34L, 30,  // Création d'entreprise (à confirmer)
            35L, 30   // Obligations légales (à confirmer)
    );

    /** Demi-salaire : Postnatal (29), Allaitement (30). */
    private static final java.util.Set<Long> HALF_SALARY_TYPES = java.util.Set.of(29L, 30L);

    /** Nécessite un comité médical : Longue maladie (31). */
    private static final java.util.Set<Long> MEDICAL_COMMITTEE_TYPES = java.util.Set.of(31L);

    /** Usage unique dans la carrière : Pèlerinage Hajj (32). */
    private static final Long ONCE_IN_CAREER_TYPE = 32L;

    /** Code lisible du type de congé pour le rendu frontend (ex: MALADIE), lu depuis TYPE_CONGE. */
    public String leaveTypeIdToCode(Long leaveTypeId) {
        if (leaveTypeId == null) return "CONGE";
        return typeCongeRepo.findById(leaveTypeId)
                .map(TypeConge::getCode)
                .orElseGet(() -> {
                    log.warn("[LeaveQuota] LEAVE_TYPE_ID={} introuvable dans TYPE_CONGE — code par défaut 'CONGE' renvoyé", leaveTypeId);
                    return "CONGE";
                });
    }

    public boolean isHalfSalary(Long leaveTypeId) {
        return leaveTypeId != null && HALF_SALARY_TYPES.contains(leaveTypeId);
    }

    public boolean requiresMedicalCommittee(Long leaveTypeId) {
        return leaveTypeId != null && MEDICAL_COMMITTEE_TYPES.contains(leaveTypeId);
    }

    public void checkOnceInCareer(Long employeeId, Long leaveTypeId) {
        if (leaveTypeId == null || !leaveTypeId.equals(ONCE_IN_CAREER_TYPE)) return;

        List<LeaveRequest> existing = leaveRepo.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        boolean dejaUtilise = existing.stream()
                .anyMatch(e -> ONCE_IN_CAREER_TYPE.equals(e.getLeaveTypeId())
                        && !"REFUSE".equals(e.getStatus())
                        && !"ANNULE".equals(e.getStatus()));

        if (dejaUtilise) {
            throw new IllegalArgumentException(
                    "Un seul congé de pèlerinage (Hajj) est autorisé par carrière. " +
                            "Une demande a déjà été soumise pour cet employé.");
        }
    }

    public void checkAnnualQuota(Long employeeId, Long leaveTypeId,
                                 BigDecimal requestedDays, int year) {
        if (leaveTypeId == null || requestedDays == null) return;

        Integer limit = ANNUAL_LIMITS.get(leaveTypeId);
        if (limit == null) return; // type non plafonné

        BigDecimal dejaPris = BigDecimal.ZERO;
        try {
            BigDecimal somme = leaveRepo.sumPendingAndApprovedDaysByTypeAndYear(employeeId, leaveTypeId, year);
            if (somme != null) dejaPris = somme;
        } catch (Exception e) {
            log.warn("[Quota] Impossible de calculer le quota (emp={}, type={}): {}",
                    employeeId, leaveTypeId, e.getMessage());
            return;
        }

        if (dejaPris.add(requestedDays).compareTo(BigDecimal.valueOf(limit)) > 0) {
            throw new IllegalArgumentException(
                    "Quota annuel dépassé pour ce type de congé : " +
                            dejaPris.intValue() + "/" + limit + " jours déjà utilisés.");
        }
    }

    public void recordCareerUsage(Long employeeId, Long leaveTypeId, Long requestId) {
        log.info("[Quota] Usage carrière enregistré | emp={} | type={} | request={}",
                employeeId, leaveTypeId, requestId);
    }
}