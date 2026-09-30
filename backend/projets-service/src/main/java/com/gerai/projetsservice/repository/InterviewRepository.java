package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCandidatId(Long candidatId);
    List<Interview> findByJobId(Long jobId);
}
