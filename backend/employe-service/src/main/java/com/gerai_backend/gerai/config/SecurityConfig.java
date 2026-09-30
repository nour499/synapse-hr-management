package com.gerai_backend.gerai.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Sécurité centralisée via requestMatchers (pas de @PreAuthorize dans les
 * contrôleurs de ce service — contrairement à demandes-service/taches-service).
 *
 * IMPORTANT — préfixe des routes :
 * server.servlet.context-path=/api préfixe déjà TOUTES les routes.
 * Spring Security évalue les requestMatchers sur le chemin APRÈS retrait
 * du context-path (comme le routing MVC) → aucun matcher ici ne doit
 * commencer par "/api".
 *
 * IMPORTANT — casse des rôles :
 * KeycloakJwtRoleConverter transforme TOUJOURS chaque rôle réalm en
 * majuscules ("ROLE_" + role.toUpperCase()). hasAnyRole(...) compare la
 * chaîne exacte "ROLE_<valeur>" SANS mettre l'argument en majuscule.
 * Donc hasAnyRole("chef") ne matchera JAMAIS "ROLE_CHEF" — seule la forme
 * hasAnyRole("CHEF") fonctionne. Toutes les valeurs ci-dessous sont donc
 * volontairement en MAJUSCULES : ADMIN, ADMIN_RH, RH, CHEF, EMPLOYE.
 */
@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final KeycloakJwtRoleConverter keycloakJwtRoleConverter;

    public SecurityConfig(KeycloakJwtRoleConverter keycloakJwtRoleConverter) {
        this.keycloakJwtRoleConverter = keycloakJwtRoleConverter;
    }

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @PostConstruct
    void logIssuer() {
        log.info("[DEBUG] issuer-uri effectif = {}", issuerUri);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        JwtAuthenticationConverter jwtAuthConverter = new JwtAuthenticationConverter();
        jwtAuthConverter.setJwtGrantedAuthoritiesConverter(keycloakJwtRoleConverter);

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // ── Photo de profil : visible sans rôle spécifique ──────
                        .requestMatchers(HttpMethod.GET, "/employe/profil/photo/**")
                        .permitAll()

                        // ── EMPLOYEES / EMPLOYES ────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/employees/**", "/employes/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH", "CHEF", "EMPLOYE")

                        .requestMatchers(HttpMethod.POST, "/employees/**", "/employes/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        .requestMatchers(HttpMethod.PUT, "/employees/**", "/employes/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        .requestMatchers(HttpMethod.DELETE, "/employees/**", "/employes/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        // ── EQUIPE / MEMBRES : création/suppression de comptes
                        //    Keycloak + fiches employé → réservé RH/ADMIN ───────
                        .requestMatchers(HttpMethod.GET, "/equipe/membres/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH", "CHEF")

                        .requestMatchers(HttpMethod.POST, "/equipe/membres/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        .requestMatchers(HttpMethod.PATCH, "/equipe/membres/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        .requestMatchers(HttpMethod.DELETE, "/equipe/membres/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        // ── KEYCLOAK (liste des comptes) ────────────────────────
                        .requestMatchers("/keycloak/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH", "RH")

                        // ── ADMIN KEYCLOAK (rôles, groupes, activation…) ────────
                        .requestMatchers("/admin/keycloak/**")
                        .hasAnyRole("ADMIN", "ADMIN_RH")

                        // ── Tout le reste : authentifié suffit (profil perso…) ──
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:4200"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}