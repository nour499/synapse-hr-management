package com.gerai.projetsservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHelper implements JwtHelperInterface {

    private final JdbcTemplate jdbc;

    /**
     * Résout l'EMPLOYEE_ID pour l'utilisateur authentifié.
     * 1. claim "employee_id"  2. sub → EMPLOYEES.USER_ID  3. email → EMPLOYEES.EMAIL
     *
     * Les requêtes ci-dessous ne préfixent volontairement pas le nom du
     * schéma (ex: "GERAI.EMPLOYEES") — elles s'appuient sur le schéma
     * par défaut de la connexion JDBC (GERAI_USER), exactement comme le
     * fait chaque entité JPA du projet (@Table(name = "EMPLOYEES") sans
     * préfixe). Un préfixe codé en dur vers un schéma "GERAI" inexistant
     * provoquait une ORA-00942 (bad SQL grammar) sur chaque appel.
     */
    public Long getEmployeeId(Authentication auth) {
        Jwt jwt = extractJwt(auth);
        if (jwt == null) throw new RuntimeException("JWT introuvable");

        Object val = jwt.getClaim("employee_id");
        if (val instanceof Number n) return n.longValue();
        if (val instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
        }

        String sub = jwt.getSubject();
        if (sub != null) {
            try {
                Long id = jdbc.queryForObject(
                        "SELECT EMPLOYEE_ID FROM EMPLOYEES WHERE USER_ID = ? AND STATUS = 'ACTIF'",
                        Long.class, sub);
                if (id != null) { log.info("[JwtHelper] employee_id={} résolu par sub={}", id, sub); return id; }
            } catch (Exception e) { log.warn("[JwtHelper] sub lookup failed: {}", e.getMessage()); }
        }

        String email = jwt.getClaimAsString("email");
        if (email != null) {
            try {
                Long id = jdbc.queryForObject(
                        "SELECT EMPLOYEE_ID FROM EMPLOYEES WHERE UPPER(EMAIL) = UPPER(?) AND STATUS = 'ACTIF'",
                        Long.class, email);
                if (id != null) {
                    log.info("[JwtHelper] employee_id={} résolu par email={}", id, email);
                    if (sub != null) {
                        try {
                            jdbc.update(
                                    "UPDATE EMPLOYEES SET USER_ID = ? WHERE EMPLOYEE_ID = ? AND (USER_ID IS NULL OR USER_ID != ?)",
                                    sub, id, sub);
                        } catch (Exception ignored) {}
                    }
                    return id;
                }
            } catch (Exception e) { log.warn("[JwtHelper] email lookup failed for '{}': {}", email, e.getMessage()); }
        }

        throw new RuntimeException(
                "Employé introuvable pour sub=" + sub + " / email=" + email +
                        " — vérifiez EMPLOYEES.USER_ID ou configurez le claim employee_id dans Keycloak");
    }

    public String getEmail(Authentication auth) {
        Jwt jwt = extractJwt(auth);
        return jwt != null ? jwt.getClaimAsString("email") : null;
    }

    public List<String> getRoles(Authentication auth) {
        Jwt jwt = extractJwt(auth);
        if (jwt == null) return List.of();
        Map<String, Object> ra = jwt.getClaim("realm_access");
        if (ra == null) return List.of();
        @SuppressWarnings("unchecked")
        Collection<String> roles = (Collection<String>) ra.get("roles");
        return roles != null ? List.copyOf(roles) : List.of();
    }

    public boolean isChef(Authentication auth)      { return getRoles(auth).contains("CHEF");  }
    public boolean isRh(Authentication auth)        { return getRoles(auth).contains("RH");    }
    public boolean isAdmin(Authentication auth)     { return getRoles(auth).contains("ADMIN"); }
    public boolean isAdminOrRh(Authentication auth) { return isRh(auth) || isAdmin(auth);      }

    private Jwt extractJwt(Authentication auth) {
        if (auth instanceof JwtAuthenticationToken t) return t.getToken();
        return null;
    }
}