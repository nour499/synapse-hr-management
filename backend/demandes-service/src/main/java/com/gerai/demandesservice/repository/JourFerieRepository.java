package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.JourFerie;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JourFerieRepository extends org.springframework.data.jpa.repository.JpaRepository<JourFerie, Long> {
    List<JourFerie> findByRecurrentTrueOrderByDateAsc();
}
