package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByStatut(String statut);
    List<Candidate> findByJobId(Long jobId);
}
