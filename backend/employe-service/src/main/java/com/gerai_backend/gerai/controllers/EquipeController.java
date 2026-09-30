package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.dto.CreateMembreDTO;
import com.gerai_backend.gerai.dto.MembreEquipeDTO;
import com.gerai_backend.gerai.dto.UpdateMembreDTO;
import com.gerai_backend.gerai.models.Department;
import com.gerai_backend.gerai.models.Employee;
import com.gerai_backend.gerai.models.Position;
import com.gerai_backend.gerai.repositories.DepartmentRepository;
import com.gerai_backend.gerai.repositories.EmployeeRepository;
import com.gerai_backend.gerai.repositories.PositionRepository;
import com.gerai_backend.gerai.services.CurrentUserService;
import com.gerai_backend.gerai.services.EmployeeEventProducer;
import com.gerai_backend.gerai.services.EmailService;
import com.gerai_backend.gerai.services.KeycloakUserService;
import com.gerai_backend.gerai.services.PasswordGeneratorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/equipe/membres")
@RequiredArgsConstructor
public class EquipeController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;

    private final JdbcTemplate jdbcTemplate;

    private final KeycloakUserService keycloakUserService;
    private final PasswordGeneratorService passwordGeneratorService;
    private final EmailService emailService;
    private final EmployeeEventProducer employeeEventProducer;
    private final CurrentUserService currentUserService;


    // =========================================================
    // GET /api/equipe/membres
    //
    // Filtrage par rôle :
    //   - ADMIN / ADMIN_RH / RH → tous les membres (aucun filtre)
    //   - CHEF                  → uniquement son équipe directe
    //                             (findByManagerId, comme le fait déjà
    //                             EmployeeController.getByChef())
    //   - tout autre cas (ne devrait pas arriver : SecurityConfig
    //     restreint déjà GET à ADMIN/ADMIN_RH/RH/CHEF) → liste vide,
    //     filet de sécurité plutôt qu'une fuite de données.
    // =========================================================

    @GetMapping
    public ResponseEntity<List<MembreEquipeDTO>> getAll() {

        List<String> roles = currentUserService.getRoles();
        Map<Long, String> titresParPosition = chargerTitresPositions();

        List<Employee> employees;

        if (roles.contains("ADMIN") || roles.contains("ADMIN_RH") || roles.contains("RH")) {
            employees = employeeRepository.findAll();

        } else if (roles.contains("CHEF")) {
            String keycloakId = currentUserService.getKeycloakId();
            Employee chef = employeeRepository.findByKeycloakUserId(keycloakId).orElse(null);

            if (chef == null) {
                log.warn("Chef connecté introuvable en base (keycloakId={}), équipe vide renvoyée", keycloakId);
                employees = List.of();
            } else {
                employees = employeeRepository.findByManagerId(chef.getId());
            }

        } else {
            log.warn("getAll() appelé avec un rôle non attendu : {}", roles);
            employees = List.of();
        }

        List<MembreEquipeDTO> list = employees.stream()
                .map(e -> toDto(
                        e,
                        titresParPosition.get(e.getPositionId())
                ))
                .toList();

        return ResponseEntity.ok(list);
    }


    // =========================================================
    // GET /api/equipe/membres/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<MembreEquipeDTO> getOne(
            @PathVariable Long id
    ) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Membre introuvable : " + id)
                );

        return ResponseEntity.ok(
                toDto(
                        employee,
                        chargerTitrePosition(employee.getPositionId())
                )
        );
    }


    // =========================================================
    // POST /api/equipe/membres
    //
    // Création :
    // 1. Vérification email
    // 2. Résolution département
    // 3. Résolution poste
    // 4. Création compte Keycloak
    // 5. Attribution rôle EMPLOYE
    // 6. Création Employee Oracle
    // 7. Envoi mot de passe temporaire
    // =========================================================

    @PostMapping
    @Transactional
    public ResponseEntity<MembreEquipeDTO> create(
            @RequestBody CreateMembreDTO dto
    ) {

        log.info(
                "Création d'un membre d'équipe : {} {} - {}",
                dto.getPrenom(),
                dto.getNom(),
                dto.getEmail()
        );


        // ---------------------------------------------------------
        // 1. Validation minimale
        // ---------------------------------------------------------

        if (dto.getPrenom() == null || dto.getPrenom().isBlank()) {
            throw new IllegalArgumentException(
                    "Le prénom est obligatoire"
            );
        }

        if (dto.getNom() == null || dto.getNom().isBlank()) {
            throw new IllegalArgumentException(
                    "Le nom est obligatoire"
            );
        }

        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "L'email est obligatoire"
            );
        }

        if (dto.getDepartement() == null || dto.getDepartement().isBlank()) {
            throw new IllegalArgumentException(
                    "Le département est obligatoire"
            );
        }

        if (dto.getPoste() == null || dto.getPoste().isBlank()) {
            throw new IllegalArgumentException(
                    "Le poste est obligatoire"
            );
        }


        // ---------------------------------------------------------
        // 2. Vérifier si l'email existe déjà dans Oracle
        // ---------------------------------------------------------

        if (employeeRepository.findByEmail(dto.getEmail()).isPresent()) {

            throw new IllegalArgumentException(
                    "Un employé avec l'email "
                            + dto.getEmail()
                            + " existe déjà"
            );
        }


        // ---------------------------------------------------------
        // 3. Résoudre le département
        // ---------------------------------------------------------

        Department department = departmentRepository
                .findByNameIgnoreCase(dto.getDepartement())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Département introuvable : "
                                        + dto.getDepartement()
                        )
                );

        log.info(
                "Département trouvé : {} (ID={})",
                department.getName(),
                department.getId()
        );


        // ---------------------------------------------------------
        // 4. Résoudre le poste
        // ---------------------------------------------------------

        Position position = positionRepository
                .findByTitleIgnoreCase(dto.getPoste())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Poste introuvable : "
                                        + dto.getPoste()
                        )
                );

        log.info(
                "Poste trouvé : {} (ID={})",
                position.getTitle(),
                position.getId()
        );


        // ---------------------------------------------------------
        // 5. Générer username + mot de passe temporaire
        // ---------------------------------------------------------

        String username = buildUsername(
                dto.getPrenom(),
                dto.getNom()
        );

        String temporaryPassword =
                passwordGeneratorService.generate();


        String keycloakUserId = null;
        boolean keycloakIsNew = false;
        String actualUsername = username;


        try {

            // -----------------------------------------------------
            // 6. Provisionner le compte Keycloak
            // -----------------------------------------------------

            log.info(
                    "Provisionnement Keycloak pour {}",
                    dto.getEmail()
            );

            var provisionResult =
                    keycloakUserService.provisionKeycloakUser(
                            username,
                            dto.getEmail(),
                            dto.getPrenom(),
                            dto.getNom(),
                            temporaryPassword
                    );

            keycloakUserId = provisionResult.userId();
            actualUsername = provisionResult.username();
            keycloakIsNew = provisionResult.isNew();

            log.info(
                    "Compte Keycloak créé/réutilisé : userId={}, username={}, isNew={}",
                    keycloakUserId,
                    actualUsername,
                    keycloakIsNew
            );


            // -----------------------------------------------------
            // 7. Attribution du rôle métier EMPLOYE
            // -----------------------------------------------------

            try {

                keycloakUserService.assignRealmRoles(
                        keycloakUserId,
                        List.of("EMPLOYE")
                );

                log.info(
                        "Rôle EMPLOYE attribué au compte Keycloak {}",
                        keycloakUserId
                );

            } catch (Exception roleException) {

                log.warn(
                        "Impossible d'attribuer le rôle EMPLOYE à {} : {}",
                        keycloakUserId,
                        roleException.getMessage()
                );
            }


            // -----------------------------------------------------
            // 8. Construire Employee
            // -----------------------------------------------------

            Employee employee = Employee.builder()

                    // IMPORTANT :
                    // USER_ID obligatoire dans EMPLOYEES
                    .keycloakUserId(keycloakUserId)

                    // Matricule
                    .employeeCode(generateEmployeeCode())

                    // Informations personnelles
                    .firstName(dto.getPrenom())
                    .lastName(dto.getNom())
                    .email(dto.getEmail())

                    // Contact
                    .phone(dto.getTelephone())
                    .photoUrl(dto.getPhoto())

                    // Département / Poste
                    .deptId(department.getId())
                    .positionId(position.getId())

                    // Date d'embauche
                    .hireDate(LocalDate.now())

                    // Statut
                    .status(
                            dto.getStatut() != null
                                    && !dto.getStatut().isBlank()
                                    ? dto.getStatut()
                                    : "ACTIF"
                    )

                    .build();


            // -----------------------------------------------------
            // 9. Sauvegarder dans Oracle
            // -----------------------------------------------------

            Employee saved =
                    employeeRepository.save(employee);

            log.info(
                    "Membre enregistré dans Oracle : id={}, employeeCode={}, keycloakUserId={}",
                    saved.getId(),
                    saved.getEmployeeCode(),
                    saved.getKeycloakUserId()
            );


            // -----------------------------------------------------
            // 10. Notification
            // -----------------------------------------------------

            try {

                employeeEventProducer
                        .notifierNouvelEmploye(saved);

            } catch (Exception notificationException) {

                log.warn(
                        "Notification nouvel employé échouée : {}",
                        notificationException.getMessage()
                );
            }


            // -----------------------------------------------------
            // 11. Envoyer le mot de passe temporaire par email
            // -----------------------------------------------------

            try {

                emailService.sendTemporaryPassword(
                        saved.getEmail(),
                        saved.getFirstName(),
                        actualUsername,
                        temporaryPassword
                );

                log.info(
                        "Mot de passe temporaire envoyé à {}",
                        saved.getEmail()
                );

            } catch (Exception emailException) {

                log.warn(
                        "Envoi email mot de passe échoué pour {} : {}",
                        saved.getEmail(),
                        emailException.getMessage()
                );
            }


            // -----------------------------------------------------
            // 12. Retourner le membre créé
            // -----------------------------------------------------

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            toDto(
                                    saved,
                                    position.getTitle()
                            )
                    );


        } catch (Exception ex) {

            log.error(
                    "Erreur lors de la création du membre {} {} : {}",
                    dto.getPrenom(),
                    dto.getNom(),
                    ex.getMessage(),
                    ex
            );


            // -----------------------------------------------------
            // 13. ROLLBACK Keycloak
            //
            // Seulement si le compte a réellement été créé
            // pendant cette opération.
            // -----------------------------------------------------

            if (keycloakIsNew
                    && keycloakUserId != null
                    && !keycloakUserId.isBlank()) {

                try {

                    keycloakUserService
                            .deleteKeycloakUser(keycloakUserId);

                    log.info(
                            "Rollback Keycloak effectué pour {}",
                            keycloakUserId
                    );

                } catch (Exception rollbackException) {

                    log.error(
                            "Échec du rollback Keycloak pour {} : {}",
                            keycloakUserId,
                            rollbackException.getMessage()
                    );
                }
            }


            throw new RuntimeException(
                    "Impossible de créer le membre : "
                            + ex.getMessage(),
                    ex
            );
        }
    }


    // =========================================================
    // PATCH /api/equipe/membres/{id}
    // =========================================================

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<MembreEquipeDTO> update(
            @PathVariable Long id,
            @RequestBody UpdateMembreDTO dto
    ) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Membre introuvable : " + id
                        )
                );


        if (dto.getPrenom() != null) {
            employee.setFirstName(dto.getPrenom());
        }

        if (dto.getNom() != null) {
            employee.setLastName(dto.getNom());
        }

        if (dto.getEmail() != null) {
            employee.setEmail(dto.getEmail());
        }

        if (dto.getTelephone() != null) {
            employee.setPhone(dto.getTelephone());
        }

        if (dto.getPhoto() != null) {
            employee.setPhotoUrl(dto.getPhoto());
        }

        if (dto.getStatut() != null) {
            employee.setStatus(dto.getStatut());
        }


        Employee saved =
                employeeRepository.save(employee);


        return ResponseEntity.ok(
                toDto(
                        saved,
                        chargerTitrePosition(
                                saved.getPositionId()
                        )
                )
        );
    }


    // =========================================================
    // DELETE /api/equipe/membres/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Boolean>> delete(
            @PathVariable Long id
    ) {

        Employee employee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Membre introuvable : " + id
                                )
                        );


        // ---------------------------------------------------------
        // Supprimer également le compte Keycloak
        // ---------------------------------------------------------

        String keycloakUserId =
                employee.getKeycloakUserId();

        if (keycloakUserId != null
                && !keycloakUserId.isBlank()) {

            try {

                keycloakUserService
                        .deleteKeycloakUser(keycloakUserId);

                log.info(
                        "Compte Keycloak supprimé : {}",
                        keycloakUserId
                );

            } catch (Exception ex) {

                log.warn(
                        "Suppression Keycloak échouée pour {} : {}",
                        keycloakUserId,
                        ex.getMessage()
                );
            }
        }


        // ---------------------------------------------------------
        // Suppression Oracle
        // ---------------------------------------------------------

        employeeRepository.delete(employee);


        try {

            employeeEventProducer
                    .notifierDepartEmploye(employee);

        } catch (Exception ex) {

            log.warn(
                    "Notification départ échouée : {}",
                    ex.getMessage()
            );
        }


        return ResponseEntity.ok(
                Map.of("success", true)
        );
    }


    // =========================================================
    // DTO CONVERTER
    // =========================================================

    private MembreEquipeDTO toDto(
            Employee employee,
            String posteTitre
    ) {

        return MembreEquipeDTO.builder()

                .id(employee.getId())

                .nom(employee.getLastName())

                .prenom(employee.getFirstName())

                .poste(posteTitre)

                .email(employee.getEmail())

                .photo(employee.getPhotoUrl())

                .statut(
                        employee.getStatus() != null
                                ? employee.getStatus()
                                : "ACTIF"
                )

                .dateEmbauche(
                        employee.getHireDate() != null
                                ? employee.getHireDate().toString()
                                : null
                )

                .telephone(employee.getPhone())

                .build();
    }


    // =========================================================
    // CHARGER TOUS LES POSTES
    // =========================================================

    private Map<Long, String> chargerTitresPositions() {

        Map<Long, String> titres =
                new HashMap<>();

        try {

            jdbcTemplate.queryForList(
                    "SELECT POSITION_ID, TITLE FROM POSITIONS"
            ).forEach(row -> {

                Number positionId =
                        (Number) row.get("POSITION_ID");

                String title =
                        (String) row.get("TITLE");

                if (positionId != null) {

                    titres.put(
                            positionId.longValue(),
                            title
                    );
                }
            });

        } catch (Exception ex) {

            log.warn(
                    "Chargement des titres de postes échoué : {}",
                    ex.getMessage()
            );
        }

        return titres;
    }


    // =========================================================
    // CHARGER UN POSTE
    // =========================================================

    private String chargerTitrePosition(
            Long positionId
    ) {

        if (positionId == null) {
            return null;
        }

        try {

            return jdbcTemplate.queryForObject(
                    "SELECT TITLE FROM POSITIONS WHERE POSITION_ID = ?",
                    String.class,
                    positionId
            );

        } catch (Exception ex) {

            log.warn(
                    "Titre du poste {} introuvable : {}",
                    positionId,
                    ex.getMessage()
            );

            return null;
        }
    }


    // =========================================================
    // GENERER USERNAME KEYCLOAK
    //
    // Exemple :
    // Nour El Houda + Boussaidi
    // → nour.el.houda.boussaidi
    // =========================================================

    private String buildUsername(
            String firstName,
            String lastName
    ) {

        java.util.function.Function<String, String> normalize =
                value -> {

                    if (value == null) {
                        return "";
                    }

                    return java.text.Normalizer
                            .normalize(
                                    value,
                                    java.text.Normalizer.Form.NFD
                            )
                            .replaceAll(
                                    "[\\p{InCombiningDiacriticalMarks}]",
                                    ""
                            )
                            .toLowerCase()
                            .trim()
                            .replaceAll(
                                    "\\s+",
                                    "."
                            );
                };


        return normalize.apply(firstName)
                + "."
                + normalize.apply(lastName);
    }


    // =========================================================
    // GENERER MATRICULE EMPLOYE
    //
    // Exemple :
    // EMP-0001
    // EMP-0002
    // ...
    // =========================================================

    private String generateEmployeeCode() {

        long count =
                employeeRepository.count() + 1;

        String code;

        int attempt = 0;

        do {

            code = String.format(
                    "EMP-%04d",
                    count + attempt
            );

            attempt++;

        } while (
                employeeRepository.existsByEmployeeCode(code)
                        && attempt < 1000
        );


        if (attempt >= 1000) {

            throw new RuntimeException(
                    "Impossible de générer un matricule employé unique"
            );
        }

        return code;
    }
}