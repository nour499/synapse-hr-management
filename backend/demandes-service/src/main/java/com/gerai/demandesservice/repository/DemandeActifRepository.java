package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.DemandeActif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandeActifRepository extends JpaRepository<DemandeActif, Long> {
}