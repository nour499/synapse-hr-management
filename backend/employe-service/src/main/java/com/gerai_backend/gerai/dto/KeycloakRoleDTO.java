package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeycloakRoleDTO {
    private String id;
    private String name;
    private String description;
    private String color;
    private String icon;
}
