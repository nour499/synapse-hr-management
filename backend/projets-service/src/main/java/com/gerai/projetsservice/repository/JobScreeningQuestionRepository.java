package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.JobScreeningQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobScreeningQuestionRepository extends JpaRepository<JobScreeningQuestion, Long> {
    List<JobScreeningQuestion> findByJobJobId(Long jobId);
    void deleteByJobJobId(Long jobId);
}
