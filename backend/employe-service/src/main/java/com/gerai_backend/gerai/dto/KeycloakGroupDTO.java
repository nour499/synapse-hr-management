package com.gerai_backend.gerai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeycloakGroupDTO {
    private String id;
    private String name;
    private String path;
    private String description;
    private String icon;
}
