package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.TypeConge;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TypeCongeRepository extends org.springframework.data.jpa.repository.JpaRepository<TypeConge, Long> {
    List<TypeConge> findByActifTrue();
}
