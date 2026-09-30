package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Question de screening (QCM) associée à une offre.
 * options et correctAnswer sont stockées en colonnes simples (JSON pour options).
 */
@Entity
@Table(name = "JOB_SCREENING_QUESTIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobScreeningQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SCREENING_Q_ID")
    private Long screeningQId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "JOB_ID", nullable = false)
    private Job job;

    @Column(name = "QUESTION", length = 500, nullable = false)
    private String question;

    @Column(name = "TYPE", length = 30)
    private String type;

    @Lob
    @Column(name = "OPTIONS_JSON")
    private String optionsJson;

    @Column(name = "CORRECT_ANSWER", length = 200)
    private String correctAnswer;

    @Column(name = "WEIGHT")
    @Builder.Default
    private Integer weight = 5;

    @Column(name = "DISPLAY_ORDER")
    @Builder.Default
    private Integer displayOrder = 0;
}
