package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.Depart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository Spring Data JPA pour l'entité Depart (table DEPARTS_EMPLOYES).
 * Remplace le stockage en mémoire ConcurrentHashMap de l'ancien DepartsController.
 */
@Repository
public interface DepartRepository extends JpaRepository<Depart, Long> {
}