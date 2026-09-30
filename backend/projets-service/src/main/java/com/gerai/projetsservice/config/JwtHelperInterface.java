package com.gerai.projetsservice.config;

import org.springframework.security.core.Authentication;

import java.util.List;

/**
 * Contrat implémenté par {@link JwtHelper}.
 * Permet aux services de dépendre d'une abstraction (et non de la classe concrète)
 * pour la résolution de l'EMPLOYEE_ID et des rôles à partir du JWT.
 */
public interface JwtHelperInterface {

    Long getEmployeeId(Authentication auth);

    String getEmail(Authentication auth);

    List<String> getRoles(Authentication auth);

    boolean isChef(Authentication auth);

    boolean isRh(Authentication auth);

    boolean isAdmin(Authentication auth);

    boolean isAdminOrRh(Authentication auth);
}
