package com.gerai.demandesservice.service;

import com.gerai.demandesservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Validation du montant de crédit par rapport au salaire mensuel brut.
 * Le plafond autorisé est de 3 × salaire mensuel (règle métier GerAI).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalaryValidationService {

    private final EmployeeRepository employeeRepo;

    /**
     * Renvoie le salaire mensuel brut de l'employé (depuis le contrat actif).
     * Renvoie null en cas d'erreur (contrat introuvable, table absente…)
     * afin de ne pas bloquer la création de la demande.
     */
    public BigDecimal getSalary(Long employeeId) {
        if (employeeId == null) return null;
        try {
            return employeeRepo.findCurrentSalaryByEmployeeId(employeeId);
        } catch (Exception e) {
            log.warn("[Salaire] Impossible de résoudre le salaire (emp={}): {}",
                    employeeId, e.getMessage());
            return null;
        }
    }
}
