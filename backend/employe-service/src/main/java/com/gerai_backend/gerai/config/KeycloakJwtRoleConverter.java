package com.gerai_backend.gerai.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class KeycloakJwtRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final Logger log = LoggerFactory.getLogger(KeycloakJwtRoleConverter.class);

    private static final java.util.Set<String> SYSTEM_ROLES = java.util.Set.of(
            "offline_access", "uma_authorization", "create-realm"
    );

    // Default to gerai — must match the Angular PKCE client in Keycloak
    // so resource_access.gerai.roles is correctly extracted from the JWT
    @Value("${spring.security.oauth2.client.registration.keycloak.client-id:gerai}")
    private String clientId;

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // Extraction des deux sources de rôles
        Collection<GrantedAuthority> clientRoles = extractClientRoles(jwt);
        Collection<GrantedAuthority> realmRoles  = extractRealmRoles(jwt);

        Collection<GrantedAuthority> allRoles = new ArrayList<>();
        allRoles.addAll(clientRoles);
        allRoles.addAll(realmRoles);

        log.debug("Roles extracted from JWT: {}", allRoles.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", ")));

        return allRoles;
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractClientRoles(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess == null || !resourceAccess.containsKey(clientId)) {
            return Collections.emptyList();
        }

        Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get(clientId);
        List<String> roles = (List<String>) clientAccess.get("roles");

        if (roles == null) return Collections.emptyList();

        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())) // Modif ici
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null) return Collections.emptyList();

        List<String> roles = (List<String>) realmAccess.get("roles");
        if (roles == null) return Collections.emptyList();

        return roles.stream()
                .filter(role -> !SYSTEM_ROLES.contains(role)
                        && !role.startsWith("default-roles"))
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toList());
    }
}