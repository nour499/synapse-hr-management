package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.EvalEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvalEvaluationRepository extends JpaRepository<EvalEvaluation, Long> {

    List<EvalEvaluation> findByChefId(Long chefId);
    List<EvalEvaluation> findByEmployeId(Long employeId);
}