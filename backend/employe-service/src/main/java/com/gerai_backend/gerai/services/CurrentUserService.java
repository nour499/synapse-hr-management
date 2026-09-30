package com.gerai_backend.gerai.services;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Récupère l'identité de l'utilisateur courant à partir du JWT Keycloak.
 * Le "sub" du token correspond à l'ID Keycloak (USER_ID en base).
 */
@Service
public class CurrentUserService {

    public String getKeycloakId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        if (auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return auth.getName();
    }

    public String getPreferredUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        if (auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaim("preferred_username");
        }
        return auth.getName();
    }

    public String getEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        if (auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaim("email");
        }
        return null;
    }

    public java.util.List<String> getRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return java.util.List.of();
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList();
    }
}
