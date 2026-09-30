package com.gerai.demandesservice.service;

import com.gerai.demandesservice.model.EmployeeRef;
import com.gerai.demandesservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Helper de résolution d'identité sur EMPLOYEES.
 * Centralise les appels au EmployeeRepository pour que DemandeService
 * reste concentré sur le workflow métier.
 *
 * Toutes les méthodes sont tolérantes aux erreurs DB (renvoient null
 * ou liste vide) afin de ne jamais faire échouer une création/validation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeInfoHelper {

    private final EmployeeRepository employeeRepo;

    /** Résout l'employee_id depuis le claim "sub" (UUID Keycloak). */
    public Long findEmployeeIdBySub(String sub) {
        if (sub == null) return null;
        try {
            return employeeRepo.findEmployeeIdByKeycloakSub(sub);
        } catch (Exception e) {
            log.warn("[EmpHelper] findEmployeeIdBySub échoué (sub={}): {}", sub, e.getMessage());
            return null;
        }
    }

    /** Résout l'employee_id depuis l'email (fallback). Renvoie null en cas d'erreur. */
    public Long findEmployeeIdByEmailSafe(String email) {
        if (email == null) return null;
        try {
            return employeeRepo.findEmployeeIdByEmail(email);
        } catch (Exception e) {
            log.warn("[EmpHelper] findEmployeeIdByEmailSafe échoué (email={}): {}", email, e.getMessage());
            return null;
        }
    }

    /** MANAGER_ID direct de l'employé. */
    public Long findManagerId(Long employeeId) {
        if (employeeId == null) return null;
        try {
            return employeeRepo.findManagerIdByEmployeeId(employeeId);
        } catch (Exception e) {
            log.warn("[EmpHelper] findManagerId échoué (emp={}): {}", employeeId, e.getMessage());
            return null;
        }
    }

    /** MANAGER_ID résolu via le créateur d'un projet actif auquel l'employé appartient. */
    public Long findManagerIdViaProject(Long employeeId) {
        if (employeeId == null) return null;
        try {
            return employeeRepo.findManagerIdViaProjectByEmployeeId(employeeId);
        } catch (Exception e) {
            log.warn("[EmpHelper] findManagerIdViaProject échoué (emp={}): {}", employeeId, e.getMessage());
            return null;
        }
    }

    /** Chef du même département (JOB_TITLE contient CHEF/MANAGER). */
    public Long findChefInSameDept(Long employeeId) {
        if (employeeId == null) return null;
        try {
            return employeeRepo.findChefInSameDeptByEmployeeId(employeeId);
        } catch (Exception e) {
            log.warn("[EmpHelper] findChefInSameDept échoué (emp={}): {}", employeeId, e.getMessage());
            return null;
        }
    }

    /** Email d'un employé par son ID. */
    public String findEmail(Long employeeId) {
        if (employeeId == null) return null;
        try {
            return employeeRepo.findEmailByEmployeeId(employeeId);
        } catch (Exception e) {
            log.warn("[EmpHelper] findEmail échoué (emp={}): {}", employeeId, e.getMessage());
            return null;
        }
    }

    /** IDs de tous les employés ayant un rôle RH/admin (destinataires des notifications). */
    public List<Long> findAdminIds() {
        try {
            return employeeRepo.findAdminEmployeeIds();
        } catch (Exception e) {
            log.warn("[EmpHelper] findAdminIds échoué: {}", e.getMessage());
            return List.of();
        }
    }

    /** Entité complète EMPLOYEES (pour prénom, nom, photo). */
    public Optional<EmployeeRef> findById(Long employeeId) {
        if (employeeId == null) return Optional.empty();
        try {
            return employeeRepo.findById(employeeId);
        } catch (Exception e) {
            log.warn("[EmpHelper] findById échoué (emp={}): {}", employeeId, e.getMessage());
            return Optional.empty();
        }
    }

    /** Nom complet FIRST_NAME || ' ' || LAST_NAME. */
    public String findFullName(Long employeeId) {
        if (employeeId == null) return null;
        try {
            return employeeRepo.findFullNameByEmployeeId(employeeId);
        } catch (Exception e) {
            log.warn("[EmpHelper] findFullName échoué (emp={}): {}", employeeId, e.getMessage());
            return null;
        }
    }
}
