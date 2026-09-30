package com.gerai_backend.gerai.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationDTO {
    private String nom;
    private String organisme;
    private LocalDate dateObtention;
}
