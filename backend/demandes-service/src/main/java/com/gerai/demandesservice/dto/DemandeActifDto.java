package com.gerai.demandesservice.dto;

import lombok.Data;

@Data
public class DemandeActifDto {
    private Long actifId;
    private String actifNom;
    private String actifType;
    private Long employeId;
    private String employeNom;
    private String type;
    private String description;
    private String urgence;
    private String statut;
}
