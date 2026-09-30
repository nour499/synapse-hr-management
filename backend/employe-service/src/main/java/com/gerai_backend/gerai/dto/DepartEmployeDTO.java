package com.gerai_backend.gerai.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class DepartEmployeDTO {

    private Long id;

    @NotNull(message = "L'ID de l'employé est requis")
    private Long employeId;

    @NotNull(message = "La date de départ est requise")
    private LocalDateTime dateDepart;

    @NotBlank(message = "Le type de départ est requis")
    @Size(max = 20, message = "Le type de départ ne peut pas dépasser 20 caractères")
    private String typeDepart;

    @NotBlank(message = "La raison est requise")
    @Size(max = 2000, message = "La raison ne peut pas dépasser 2000 caractères")
    private String raison;

    @NotBlank(message = "Le statut est requis")
    @Size(max = 20, message = "Le statut ne peut pas dépasser 20 caractères")
    private String statut;

    @Size(max = 2000, message = "Les notes ne peuvent pas dépasser 2000 caractères")
    private String notes;

}