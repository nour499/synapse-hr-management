package com.gerai.projetsservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Reflet exact du modèle CampagneEvaluation du frontend.
 * L'id est "id" (et non campagneId) pour coller au frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CampagneEvaluationDTO {

    private Long   id;
    private String titre;
    private String periode;     // T1 | T2 | T3 | T4 | ANNUEL
    private Integer annee;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;      // BROUILLON | PLANIFIEE | ACTIVE | CLOTUREE
    private List<String> departements;
    private String creePar;
    private String description;
}
