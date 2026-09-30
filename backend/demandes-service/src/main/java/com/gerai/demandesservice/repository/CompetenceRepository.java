package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetenceRepository extends org.springframework.data.jpa.repository.JpaRepository<Competence, Long> {
    List<Competence> findByActifTrue();
    List<Competence> findByCategorie(String categorie);
}
