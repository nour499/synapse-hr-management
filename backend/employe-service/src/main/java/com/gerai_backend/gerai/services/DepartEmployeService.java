package com.gerai_backend.gerai.services;

import com.gerai_backend.gerai.models.DepartEmploye;
import com.gerai_backend.gerai.repositories.DepartEmployeRepository;
import com.gerai_backend.gerai.dto.DepartEmployeDTO;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartEmployeService {

    private final DepartEmployeRepository departEmployeRepository;

    public DepartEmploye createDepartEmploye(DepartEmployeDTO request) {
        try {
            DepartEmploye departEmploye = DepartEmploye.builder()
                    .employeId(request.getEmployeId())
                    .dateDepart(request.getDateDepart())
                    .typeDepart(request.getTypeDepart())
                    .raison(request.getRaison())
                    .statut(request.getStatut())
                    .notes(request.getNotes())
                    .build();
            return departEmployeRepository.save(departEmploye);
        } catch (Exception e) {
            throw new EntityExistsException("Failed to create departure: " + e.getMessage(), e);
        }
    }

    public List<DepartEmploye> getAllDepartEmployes() {
        return departEmployeRepository.findAll();
    }

    public DepartEmploye getDepartEmployeById(Long id) {
        return departEmployeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Depart employe not found with id: " + id));
    }

    @Transactional
    public DepartEmploye updateDepartEmploye(Long id, DepartEmployeDTO request) {
        DepartEmploye departEmploye = getDepartEmployeById(id);

        departEmploye.setEmployeId(request.getEmployeId());
        departEmploye.setDateDepart(request.getDateDepart());
        departEmploye.setTypeDepart(request.getTypeDepart());
        departEmploye.setRaison(request.getRaison());
        departEmploye.setStatut(request.getStatut());
        departEmploye.setNotes(request.getNotes());

        return departEmployeRepository.save(departEmploye);
    }

    @Transactional
    public void deleteDepartEmploye(Long id) {
        DepartEmploye departEmploye = getDepartEmployeById(id);
        departEmployeRepository.delete(departEmploye);
    }
}