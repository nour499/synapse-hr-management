package com.gerai_backend.gerai.services;

import com.gerai_backend.gerai.dto.DepartmentDTO;
import com.gerai_backend.gerai.models.Department;
import com.gerai_backend.gerai.models.Employee;
import com.gerai_backend.gerai.repositories.DepartmentRepository;
import com.gerai_backend.gerai.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartementsService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public DepartmentDTO createDepartement(DepartmentDTO request) {
        validateChefId(request.getChefId());

        Department dept = request.toEntity();
        dept.setId(null); // sécurité : jamais d'ID imposé à la création
        dept.setCode(generateUniqueCode(dept.getName()));

        Department saved = departmentRepository.save(dept);
        log.info("Department created: {} (id={}, code={})", saved.getName(), saved.getId(), saved.getCode());
        return toDTO(saved);
    }

    public List<DepartmentDTO> getAllDepartements() {
        return departmentRepository.findAll().stream().map(this::toDTO).toList();
    }

    public DepartmentDTO getDepartementById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return toDTO(dept);
    }

    @Transactional
    public DepartmentDTO updateDepartement(Long id, DepartmentDTO request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        validateChefId(request.getChefId());

        dept.setName(request.getNom());
        dept.setDescription(request.getDescription());
        dept.setChefId(request.getChefId());
        dept.setTelephone(request.getTelephone());
        dept.setEmail(request.getEmail());
        dept.setCapacite(request.getCapacite());
        dept.setAnneeCreation(request.getAnneeCreation());
        // Le code n'est jamais modifié après création

        Department saved = departmentRepository.save(dept);
        log.info("Department updated: id={}", id);
        return toDTO(saved);
    }

    @Transactional
    public void deleteDepartement(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));

        long employeeCount = employeeRepository.findByDeptId(id).size();
        if (employeeCount > 0) {
            throw new IllegalStateException(
                    "Impossible de supprimer ce département : " + employeeCount +
                            " employé(s) y sont encore rattaché(s). Réaffectez-les d'abord."
            );
        }

        departmentRepository.delete(dept);
        log.info("Department deleted: id={}", id);
    }

    public List<Employee> getEmployesByDepartementId(Long deptId) {
        return employeeRepository.findByDeptId(deptId);
    }

    private DepartmentDTO toDTO(Department dept) {
        dept.setTotalEmployes(employeeRepository.findByDeptId(dept.getId()).size());
        DepartmentDTO dto = DepartmentDTO.fromEntity(dept);

        if (dept.getChefId() != null) {
            employeeRepository.findById(dept.getChefId()).ifPresent(chef -> {
                dto.setResponsable(chef.getLastName() + " " + chef.getFirstName());
                dto.setResponsablePhoto(chef.getPhotoUrl());
            });
        }
        return dto;
    }

    /** Vérifie que le chefId, s'il est fourni, référence bien un employé existant. */
    private void validateChefId(Long chefId) {
        if (chefId != null && !employeeRepository.existsById(chefId)) {
            throw new IllegalArgumentException("Aucun employé trouvé avec l'id : " + chefId);
        }
    }

    /**
     * Génère un code unique à partir du nom (ex: "Ressources Humaines" → "RESSOURCES_HUMAI").
     * Ajoute un suffixe numérique en cas de collision.
     */
    private String generateUniqueCode(String name) {
        String base = (name == null ? "" : name).trim().toUpperCase()
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
        if (base.length() > 15) base = base.substring(0, 15);
        if (base.isBlank()) base = "DEPT";

        String code = base;
        int suffix = 1;
        while (departmentRepository.existsByCode(code)) {
            code = base + "_" + suffix++;
        }
        return code;
    }
}