package com.gerai_backend.gerai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeAccessDTO {
    private Long employeId;
    private String username;
    private Boolean accountEnabled;
    private Boolean emailVerified;
    private List<String> roles;
    private List<String> groups;
    private String createdAt;
    private String lastLogin;
}
