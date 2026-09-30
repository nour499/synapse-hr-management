package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.PerformanceEval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceEvalRepository extends JpaRepository<PerformanceEval, Long> {

    List<PerformanceEval> findByEmployeeId(Long employeeId);
    List<PerformanceEval> findByEvaluatorId(Long evaluatorId);
    List<PerformanceEval> findByEvaluatorIdOrderByCreatedAtDesc(Long evaluatorId);
}
