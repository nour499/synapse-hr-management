package com.gerai.demandesservice.service;

import com.gerai.demandesservice.dto.SoldeCongeAdminRequest;
import com.gerai.demandesservice.dto.SoldeCongeAdminResponse;
import com.gerai.demandesservice.model.SoldeCongeAdmin;
import com.gerai.demandesservice.repository.EmployeeRepository;
import com.gerai.demandesservice.repository.SoldeCongeAdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class SoldeCongeAdminService {

    private final SoldeCongeAdminRepository repo;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<SoldeCongeAdminResponse> getAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SoldeCongeAdminResponse getById(Long id) {
        return repo.findById(id).map(this::toResponse)
                .orElseThrow(() -> new NoSuchElementException("Solde introuvable : " + id));
    }

    @Transactional
    public SoldeCongeAdminResponse create(SoldeCongeAdminRequest req) {
        repo.findByEmployeIdAndAnnee(req.getEmployeId(), req.getAnnee())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Un solde existe déjà pour l'employé " + req.getEmployeId()
                                    + " sur l'année " + req.getAnnee() + " (id=" + existing.getId() + ")");
                });

        SoldeCongeAdmin entity = fromRequest(req, null);
        entity = repo.save(entity);
        log.info("[SoldeCongeAdmin] Créé | emp={} | annee={} | id={}",
                entity.getEmployeId(), entity.getAnnee(), entity.getId());
        return toResponse(entity);
    }

    @Transactional
    public SoldeCongeAdminResponse update(Long id, SoldeCongeAdminRequest req) {
        SoldeCongeAdmin existant = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Solde introuvable : " + id));

        if (req.getEmployeId() != null && req.getAnnee() != null
                && (!req.getEmployeId().equals(existant.getEmployeId()) || !req.getAnnee().equals(existant.getAnnee()))) {
            repo.findByEmployeIdAndAnnee(req.getEmployeId(), req.getAnnee())
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new IllegalArgumentException(
                                "Un autre solde existe déjà pour l'employé " + req.getEmployeId()
                                        + " sur l'année " + req.getAnnee() + " (id=" + other.getId() + ")");
                    });
        }

        SoldeCongeAdmin updated = fromRequest(req, id);
        updated = repo.save(updated);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Solde introuvable : " + id);
        }
        repo.deleteById(id);
    }

    /**
     * Initialise une ligne de solde pour chaque employé actif n'en ayant pas
     * déjà une pour l'année donnée. Idempotent : peut être rappelé sans
     * créer de doublon (protégé par findByEmployeIdAndAnnee).
     *
     * Lit les employés actifs via EmployeeRepository.findAllActifsForSoldeInit()
     * (requête SQL native sur la table EMPLOYEES partagée avec employe-service —
     * aucune dépendance de code vers ce service).
     *
     * @return le nombre de lignes réellement créées.
     */
    @Transactional
    public int initAnnee(Integer annee, int soldeTotalParDefaut) {
        List<Object[]> employes = employeeRepository.findAllActifsForSoldeInit();
        int created = 0;

        for (Object[] row : employes) {
            // CORRIGÉ : SoldeCongeAdmin.employeId est un Integer (pas un Long).
            // EMPLOYEE_ID est un NUMBER Oracle sans borne fixe, donc on caste
            // ici via intValue() pour matcher le type exact attendu par le builder.
            Integer employeId  = ((Number) row[0]).intValue();
            String nom         = (String) row[1];
            String departement = (String) row[2];
            String poste       = (String) row[3];

            boolean existeDeja = repo.findByEmployeIdAndAnnee(employeId, annee).isPresent();
            if (existeDeja) continue;

            SoldeCongeAdmin solde = SoldeCongeAdmin.builder()
                    .employeId(employeId)
                    .employeNom(nom)
                    .departement(departement)
                    .poste(poste)
                    .annee(annee)
                    .soldePrecedent(0)
                    .soldeTotal(soldeTotalParDefaut)
                    .soldeActuel(soldeTotalParDefaut)
                    .reportSolde(0)
                    .congesUtilises(0)
                    .congesAcceptes(0)
                    .congesRejetes(0)
                    .congesExpires(0)
                    .build();
            repo.save(solde);
            created++;
        }

        log.info("[SoldeCongeAdmin] Initialisation année {} : {} nouveau(x) solde(s) créé(s) sur {} employé(s) actif(s).",
                annee, created, employes.size());
        return created;
    }

    /** Liste des années distinctes déjà présentes en base, triées décroissant. */
    @Transactional(readOnly = true)
    public List<Integer> getAnneesDisponibles() {
        return repo.findAll().stream()
                .map(SoldeCongeAdmin::getAnnee)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .toList();
    }

    private SoldeCongeAdmin fromRequest(SoldeCongeAdminRequest req, Long id) {
        return SoldeCongeAdmin.builder()
                .id(id)
                .employeId(req.getEmployeId())
                .employeNom(req.getEmployeNom())
                .employePhoto(req.getEmployePhoto())
                .departement(req.getDepartement())
                .poste(req.getPoste())
                .annee(req.getAnnee())
                .soldePrecedent(req.getSoldePrecedent())
                .soldeActuel(req.getSoldeActuel())
                .soldeTotal(req.getSoldeTotal())
                .reportSolde(req.getReportSolde())
                .congesUtilises(req.getCongesUtilises())
                .congesAcceptes(req.getCongesAcceptes())
                .congesRejetes(req.getCongesRejetes())
                .congesExpires(req.getCongesExpires())
                .build();
    }

    private SoldeCongeAdminResponse toResponse(SoldeCongeAdmin s) {
        return SoldeCongeAdminResponse.builder()
                .id(s.getId())
                .employeId(s.getEmployeId())
                .employeNom(s.getEmployeNom())
                .employePhoto(s.getEmployePhoto())
                .departement(s.getDepartement())
                .poste(s.getPoste())
                .annee(s.getAnnee())
                .soldePrecedent(s.getSoldePrecedent())
                .soldeActuel(s.getSoldeActuel())
                .soldeTotal(s.getSoldeTotal())
                .reportSolde(s.getReportSolde())
                .congesUtilises(s.getCongesUtilises())
                .congesAcceptes(s.getCongesAcceptes())
                .congesRejetes(s.getCongesRejetes())
                .congesExpires(s.getCongesExpires())
                .build();
    }
}