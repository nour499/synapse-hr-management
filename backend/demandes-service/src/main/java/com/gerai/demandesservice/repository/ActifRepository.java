package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.Actif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActifRepository extends JpaRepository<Actif, Long> {

    List<Actif> findByEmployeId(Long employeId);
}