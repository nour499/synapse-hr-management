package com.gerai_backend.gerai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRoleDTO {
    private Long employeId;
    private List<String> roles;
}