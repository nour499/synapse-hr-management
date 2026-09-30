package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisionResultDTO {
    private String username;
    private String motDePasse;
    private Boolean emailEnvoye;
    private String keycloakUserId;
    private String message;
}
