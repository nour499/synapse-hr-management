package com.gerai.projetsservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InterviewDTO {
    private Long   id;
    private Long   candidatId;
    private String candidatNom;
    private String candidatPrenom;
    private String candidatPhoto;
    private Long   jobId;
    private String jobTitre;
    private String departement;
    private String type;
    private String statut;
    private String decision;
    private String date;
    private String heureDebut;
    private String heureFin;
    private String lieu;
    private String lienVisio;
    private String intervieweur;
    private String intervieweurPhoto;
    private Double noteGlobale;
    private String commentaire;
}
