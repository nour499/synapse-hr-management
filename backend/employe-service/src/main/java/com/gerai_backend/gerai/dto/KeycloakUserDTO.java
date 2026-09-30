package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeycloakUserDTO {
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
}
