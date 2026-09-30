package com.gerai_backend.gerai.repositories;

import com.gerai_backend.gerai.models.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByNameIgnoreCase(String name);
    boolean existsByCode(String code);
}