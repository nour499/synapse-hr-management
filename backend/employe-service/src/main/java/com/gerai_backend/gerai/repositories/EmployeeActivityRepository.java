package com.gerai_backend.gerai.repositories;

import com.gerai_backend.gerai.models.EmployeeActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeActivityRepository extends JpaRepository<EmployeeActivity, Long> {

    @Query("SELECT a FROM EmployeeActivity a WHERE a.employeId = :employeId ORDER BY a.date DESC")
    List<EmployeeActivity> findByEmployeId(@Param("employeId") String employeId);

    @Query("SELECT COUNT(a) FROM EmployeeActivity a WHERE a.employeId = :employeId AND a.type = :type AND a.statut = :statut")
    long countByEmployeIdAndTypeAndStatut(@Param("employeId") String employeId, @Param("type") String type, @Param("statut") String statut);
}
