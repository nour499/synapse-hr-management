package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.GrilleSalariale;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrilleSalarialeRepository extends org.springframework.data.jpa.repository.JpaRepository<GrilleSalariale, Long> {
    List<GrilleSalariale> findByOrderByNiveau();
}
