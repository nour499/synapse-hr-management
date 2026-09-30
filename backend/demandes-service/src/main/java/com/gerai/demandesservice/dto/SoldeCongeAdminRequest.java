package com.gerai.demandesservice.dto;

import lombok.Data;

@Data
public class SoldeCongeAdminRequest {
    private Integer employeId;
    private String employeNom;
    private String employePhoto;
    private String departement;
    private String poste;
    private Integer annee;
    private Integer soldePrecedent;
    private Integer soldeActuel;
    private Integer soldeTotal;
    private Integer reportSolde;
    private Integer congesUtilises;
    private Integer congesAcceptes;
    private Integer congesRejetes;
    private Integer congesExpires;
}
