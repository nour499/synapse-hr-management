package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.EvalCampagne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvalCampagneRepository extends JpaRepository<EvalCampagne, Long> {
}
