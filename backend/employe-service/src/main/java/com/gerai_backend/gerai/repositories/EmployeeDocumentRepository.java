package com.gerai_backend.gerai.repositories;

import com.gerai_backend.gerai.models.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    @Query("SELECT d FROM EmployeeDocument d WHERE d.employeId = :employeId ORDER BY d.dateAjout DESC")
    List<EmployeeDocument> findByEmployeId(@Param("employeId") String employeId);
}
