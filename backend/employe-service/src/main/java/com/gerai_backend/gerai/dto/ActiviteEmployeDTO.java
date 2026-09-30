package com.gerai_backend.gerai.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiviteEmployeDTO {
    private Long id;
    private String employeId;
    private String titre;
    private String description;
    private String date;
    private String type;          // demande | tache | formation | document | conge | presence
    private String statut;        // validee | refusee | en_attente | terminee | en_cours
    private String badge;
    private String icone;
    private String lien;
}
