package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.dto.KeycloakUserDTO;
import com.gerai_backend.gerai.services.KeycloakUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/keycloak")
@RequiredArgsConstructor
public class KeycloakUserController {

    private final KeycloakUserService keycloakUserService;

    // GET /api/keycloak/users
    @GetMapping("/users")
    public ResponseEntity<List<KeycloakUserDTO>> listUsers() {
        List<KeycloakUserDTO> users = keycloakUserService.searchUsers(null, 0, 1000).stream()
                .map(u -> KeycloakUserDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
