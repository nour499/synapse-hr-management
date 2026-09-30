package com.gerai_backend.gerai.repositories;

import com.gerai_backend.gerai.models.DepartEmploye;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartEmployeRepository extends JpaRepository<DepartEmploye, Long> {
}