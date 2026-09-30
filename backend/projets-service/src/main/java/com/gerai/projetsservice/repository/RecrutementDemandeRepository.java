package com.gerai.projetsservice.repository;

import com.gerai.projetsservice.model.RecrutementDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecrutementDemandeRepository extends JpaRepository<RecrutementDemande, Long> {
    List<RecrutementDemande> findByChefId(String chefId);
}
