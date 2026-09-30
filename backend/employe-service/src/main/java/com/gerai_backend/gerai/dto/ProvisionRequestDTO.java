package com.gerai_backend.gerai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisionRequestDTO {
    private Long employeId;
    private String prenom;
    private String nom;
    private String email;
    private String role;
    private List<String> groups;
}
