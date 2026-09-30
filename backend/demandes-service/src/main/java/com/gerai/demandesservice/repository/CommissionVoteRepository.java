package com.gerai.demandesservice.repository;

import com.gerai.demandesservice.model.CommissionVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommissionVoteRepository extends JpaRepository<CommissionVote, Long> {

    List<CommissionVote> findByLoanIdOrderByVotedAtDesc(Long loanId);
}
