package com.gerai.projetsservice.service;

import com.gerai.projetsservice.dto.EmployeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.services.employee-url:http://localhost:8081}")
    private String employeeServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Cache uniquement les employés dont les informations sont complètes
     * (poste + département).
     */
    private final Map<Long, EmployeDTO> cache = new ConcurrentHashMap<>();

    /**
     * Récupère tous les employés depuis employee-service.
     *
     * Cette méthode est conservée pour les anciens appels.
     * Elle ne dispose pas d'Authentication, donc aucun JWT n'est propagé.
     */
    public List<EmployeDTO> getAllEmployes() {

        try {

            EmployeDTO[] arr = restTemplate.getForObject(
                    employeeServiceUrl + "/api/employes",
                    EmployeDTO[].class
            );

            if (arr != null) {

                Arrays.stream(arr)
                        .filter(e -> e != null && estComplet(e))
                        .forEach(e -> cache.put(e.getId(), e));

                return Arrays.asList(arr);
            }

        } catch (Exception e) {

            log.warn(
                    "[EmployeService] Impossible de contacter employee-service : {}",
                    e.getMessage()
            );
        }

        return List.of();
    }

    /**
     * Version compatible avec les anciens appels.
     *
     * Exemple :
     * ProjectNotificationService peut continuer à faire :
     *
     * employeService.getEmployeById(employeeId)
     *
     * Aucun JWT n'est disponible dans ce type d'appel,
     * donc on délègue à la méthode principale avec auth = null.
     */
    public EmployeDTO getEmployeById(Long employeeId) {
        return getEmployeById(employeeId, null);
    }

    /**
     * Résout un employé par son ID.
     *
     * Ordre de résolution :
     *
     * 1. Cache si les informations sont complètes.
     * 2. employee-service via REST avec propagation du JWT.
     * 3. Fallback Oracle local pour récupérer au minimum
     *    nom, prénom et email.
     * 4. Placeholder "Employé #X".
     *
     * La propagation du JWT est importante pour éviter le 401
     * lorsque projets-service appelle employee-service.
     */
    public EmployeDTO getEmployeById(
            Long employeeId,
            Authentication auth
    ) {

        if (employeeId == null) {
            return null;
        }

        /*
         * ============================================================
         * 1. CACHE
         * ============================================================
         *
         * On ne retourne une entrée du cache que si elle contient
         * réellement le poste ET le département.
         *
         * Cela évite de conserver définitivement une réponse dégradée.
         */
        EmployeDTO cached = cache.get(employeeId);

        if (cached != null && estComplet(cached)) {

            log.debug(
                    "[EmployeService] Cache HIT employee_id={}",
                    employeeId
            );

            return cached;
        }

        /*
         * ============================================================
         * 2. EMPLOYEE-SERVICE REST API
         * ============================================================
         *
         * On transmet le JWT de l'utilisateur courant.
         *
         * Exemple :
         *
         * Frontend
         *    ↓ Bearer JWT
         * projets-service
         *    ↓ même Bearer JWT
         * employee-service
         *
         * Ainsi employee-service peut authentifier correctement
         * la requête.
         */
        try {

            HttpHeaders headers = new HttpHeaders();

            if (auth instanceof JwtAuthenticationToken jwtAuth) {

                String token = jwtAuth
                        .getToken()
                        .getTokenValue();

                if (token != null && !token.isBlank()) {
                    headers.setBearerAuth(token);
                }
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<EmployeDTO> response =
                    restTemplate.exchange(
                            employeeServiceUrl + "/api/employes/" + employeeId,
                            HttpMethod.GET,
                            entity,
                            EmployeDTO.class
                    );

            EmployeDTO emp = response.getBody();

            log.info(
                    "[EmployeService] REST RESPONSE employee_id={}: nom={}, prenom={}, poste={}, departement={}",
                    employeeId,
                    emp != null ? emp.getNom() : null,
                    emp != null ? emp.getPrenom() : null,
                    emp != null ? emp.getPoste() : null,
                    emp != null ? emp.getDepartement() : null
            );

            /*
             * Une réponse REST valide est retournée même si certaines
             * informations sont nulles.
             *
             * Mais seules les réponses complètes sont mises en cache.
             */
            if (emp != null) {

                if (emp.getNomComplet() == null ||
                        emp.getNomComplet().isBlank()) {

                    String prenom = emp.getPrenom() != null
                            ? emp.getPrenom()
                            : "";

                    String nom = emp.getNom() != null
                            ? emp.getNom()
                            : "";

                    String fullName =
                            (prenom + " " + nom).trim();

                    if (!fullName.isBlank()) {
                        emp.setNomComplet(fullName);
                    } else {
                        emp.setNomComplet(
                                "Employé #" + employeeId
                        );
                    }
                }

                if (estComplet(emp)) {
                    cache.put(employeeId, emp);

                    log.debug(
                            "[EmployeService] Cache PUT employee_id={}",
                            employeeId
                    );
                }

                return emp;
            }

        } catch (Exception e) {

            log.warn(
                    "[EmployeService] HTTP fallback for employee_id={}: {}",
                    employeeId,
                    e.getMessage()
            );
        }

        /*
         * ============================================================
         * 3. FALLBACK ORACLE
         * ============================================================
         *
         * On utilise directement EMPLOYEES pour garantir au minimum
         * le nom/prénom/email lorsque employee-service est indisponible
         * ou lorsque l'appel REST retourne 401/403/etc.
         *
         * IMPORTANT :
         * Pas de "GERAI." devant EMPLOYEES.
         *
         * La connexion utilise déjà gerai_user comme propriétaire
         * des tables.
         */
        try {

            EmployeDTO emp = jdbcTemplate.queryForObject(

                    """
                    SELECT
                        EMPLOYEE_ID,
                        FIRST_NAME,
                        LAST_NAME,
                        EMAIL
                    FROM EMPLOYEES
                    WHERE EMPLOYEE_ID = ?
                    """,

                    (rs, rowNum) -> {

                        String prenom =
                                rs.getString("FIRST_NAME");

                        String nom =
                                rs.getString("LAST_NAME");

                        String full =
                                (
                                        (prenom != null ? prenom : "")
                                                + " "
                                                + (nom != null ? nom : "")
                                ).trim();

                        return EmployeDTO.builder()
                                .id(rs.getLong("EMPLOYEE_ID"))
                                .prenom(prenom)
                                .nom(nom)
                                .email(rs.getString("EMAIL"))
                                .nomComplet(
                                        full.isEmpty()
                                                ? "Employé #" + employeeId
                                                : full
                                )
                                .build();
                    },

                    employeeId
            );

            if (emp != null) {

                log.info(
                        "[EmployeService] DB resolved name for employee_id={}: {}",
                        employeeId,
                        emp.getNomComplet()
                );

                /*
                 * IMPORTANT :
                 *
                 * On ne met PAS ce résultat dans le cache car il ne
                 * contient pas poste/departement.
                 *
                 * Ainsi un prochain appel pourra retenter employee-service
                 * et récupérer les informations complètes.
                 */
                return emp;
            }

        } catch (Exception dbEx) {

            log.warn(
                    "[EmployeService] DB fallback failed for employee_id={}: {}",
                    employeeId,
                    dbEx.getMessage()
            );
        }

        /*
         * ============================================================
         * 4. DERNIER RECOURS
         * ============================================================
         */
        return EmployeDTO.builder()
                .id(employeeId)
                .nomComplet("Employé #" + employeeId)
                .build();
    }

    /**
     * Vérifie si les informations nécessaires sont présentes
     * pour considérer la réponse comme complète.
     *
     * Une réponse complète peut alors être mise en cache.
     */
    private boolean estComplet(EmployeDTO emp) {

        if (emp == null) {
            return false;
        }

        return emp.getPoste() != null
                && !emp.getPoste().isBlank()
                && emp.getDepartement() != null
                && !emp.getDepartement().isBlank();
    }
}