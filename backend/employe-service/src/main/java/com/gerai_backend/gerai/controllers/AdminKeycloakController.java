package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.dto.*;
import com.gerai_backend.gerai.models.Employee;
import com.gerai_backend.gerai.repositories.EmployeeRepository;
import com.gerai_backend.gerai.services.EmployeeService;
import com.gerai_backend.gerai.services.KeycloakUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/admin/keycloak")
@RequiredArgsConstructor
public class AdminKeycloakController {

    private final KeycloakUserService keycloakUserService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;

    @GetMapping("/roles")
    public ResponseEntity<List<KeycloakRoleDTO>> getRoles() {
        List<KeycloakRoleDTO> roles = keycloakUserService.listRealmRoles().stream()
                .filter(r -> !r.getName().startsWith("default-roles")
                        && !List.of("offline_access", "uma_authorization", "create-realm").contains(r.getName()))
                .map(r -> KeycloakRoleDTO.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .description(r.getDescription())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/groups")
    public ResponseEntity<List<KeycloakGroupDTO>> getGroups() {
        List<KeycloakGroupDTO> groups = keycloakUserService.listGroups().stream()
                .map(g -> KeycloakGroupDTO.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .path(g.getPath())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/employes/{id}/access")
    public ResponseEntity<EmployeAccessDTO> getAccess(@PathVariable Long id) {
        var emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + id));
        Map<String, Object> access = keycloakUserService.getUserAccess(emp.getKeycloakUserId());
        EmployeAccessDTO dto = EmployeAccessDTO.builder()
                .employeId(id)
                .username((String) access.get("username"))
                .accountEnabled((Boolean) access.get("accountEnabled"))
                .emailVerified((Boolean) access.get("emailVerified"))
                .roles((List<String>) access.get("roles"))
                .groups((List<String>) access.get("groups"))
                .build();
        return ResponseEntity.ok(dto);
    }

    /**
     * NOUVEAU : rôles Keycloak de TOUS les employés, en un seul appel.
     *
     * Utilisé par le formulaire employé pour exclure les comptes ayant
     * le rôle "employe" de la liste déroulante des managers potentiels
     * (un simple employé ne peut pas être désigné comme chef hiérarchique).
     *
     * La boucle se fait ici, côté serveur — pas de N appels HTTP depuis
     * le frontend. Un échec Keycloak sur un employé donné ne bloque pas
     * les autres (roles vide dans ce cas, avec un log d'avertissement).
     */
    /**
     * Rôles Keycloak de tous les employés, en un seul appel Keycloak (au lieu d'un par employé).
     *
     * Utilisé par le formulaire employé pour exclure les comptes ayant le rôle "employe"
     * de la liste déroulante des managers potentiels.
     *
     * Optimisation : interroge Keycloak "qui a le rôle X" (1 appel par rôle pertinent)
     * plutôt que "quels rôles a l'utilisateur Y" pour chaque employé (N appels).
     * Le coût de cet endpoint ne dépend donc plus du nombre d'employés.
     */
    @GetMapping("/employes/roles")
    public ResponseEntity<List<EmployeeRoleDTO>> getAllEmployeeRoles() {
        List<Employee> employees = employeeRepository.findAll();

        // Un seul appel Keycloak pour tout le realm : qui a le rôle "employe" ?
        Set<String> keycloakIdsWithEmployeRole = keycloakUserService.getUserIdsWithRole("employe");

        List<EmployeeRoleDTO> result = employees.stream().map(emp -> {
            List<String> roles = (emp.getKeycloakUserId() != null
                    && keycloakIdsWithEmployeRole.contains(emp.getKeycloakUserId()))
                    ? List.of("employe")
                    : List.of();
            return EmployeeRoleDTO.builder().employeId(emp.getId()).roles(roles).build();
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PutMapping("/employes/{id}/roles")
    public ResponseEntity<EmployeAccessDTO> updateRoles(@PathVariable Long id,
                                                        @RequestBody Map<String, List<String>> body) {
        var emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + id));
        keycloakUserService.updateRealmRoles(emp.getKeycloakUserId(), body.get("roles"));
        return getAccess(id);
    }

    @PutMapping("/employes/{id}/groups")
    public ResponseEntity<EmployeAccessDTO> updateGroups(@PathVariable Long id,
                                                         @RequestBody Map<String, List<String>> body) {
        var emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + id));
        keycloakUserService.updateGroups(emp.getKeycloakUserId(), body.get("groups"));
        return getAccess(id);
    }

    @PutMapping("/employes/{id}/account")
    public ResponseEntity<EmployeAccessDTO> updateAccount(@PathVariable Long id,
                                                          @RequestBody Map<String, Boolean> body) {
        var emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + id));
        keycloakUserService.setAccountEnabled(emp.getKeycloakUserId(),
                body.getOrDefault("accountEnabled", true));
        return getAccess(id);
    }

    @PostMapping("/employes/{id}/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@PathVariable Long id) {
        var emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable: " + id));
        String pwd = keycloakUserService.generateAndResetPassword(emp.getKeycloakUserId());
        return ResponseEntity.ok(Map.of(
                "motDePasse", pwd,
                "emailEnvoye", false
        ));
    }

    @PostMapping("/provision")
    public ResponseEntity<ProvisionResultDTO> provision(@RequestBody ProvisionRequestDTO req) {
        String tempPwd = keycloakUserService.generateAndResetPasswordDirect(
                req.getPrenom(), req.getNom(), req.getEmail(), req.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(ProvisionResultDTO.builder()
                .username(req.getEmail())
                .motDePasse(tempPwd)
                .emailEnvoye(false)
                .message("Provisioning terminé")
                .build());
    }
}