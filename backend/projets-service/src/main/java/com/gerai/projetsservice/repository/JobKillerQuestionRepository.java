package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.JobKillerQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobKillerQuestionRepository extends JpaRepository<JobKillerQuestion, Long> {
    List<JobKillerQuestion> findByJobJobId(Long jobId);
    void deleteByJobJobId(Long jobId);
}
