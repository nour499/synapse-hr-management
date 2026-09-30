package com.gerai.demandesservice.dto;

import lombok.Data;

@Data
public class TraitementDemandeActifDto {
    private String statut; // 'EN_ATTENTE' | 'EN_COURS' | 'RESOLUE' | 'REJETEE'
    private String commentaireAdmin;
}
