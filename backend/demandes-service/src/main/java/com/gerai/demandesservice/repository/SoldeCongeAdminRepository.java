package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.SoldeCongeAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SoldeCongeAdminRepository extends JpaRepository<SoldeCongeAdmin, Long> {

    /** Utilisé pour empêcher un doublon employé/année avant l'insertion. */
    Optional<SoldeCongeAdmin> findByEmployeIdAndAnnee(Integer employeId, Integer annee);
}