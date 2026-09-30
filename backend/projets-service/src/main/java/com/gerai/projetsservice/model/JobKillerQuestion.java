package com.gerai.projetsservice.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Question "killer" associée à une offre (filtre éliminatoire).
 */
@Entity
@Table(name = "JOB_KILLER_QUESTIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobKillerQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "KILLER_Q_ID")
    private Long killerQId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "JOB_ID", nullable = false)
    private Job job;

    @Column(name = "QUESTION", length = 500, nullable = false)
    private String question;

    @Column(name = "EXPECTED_ANSWER", length = 50)
    private String expectedAnswer;

    @Column(name = "DISPLAY_ORDER")
    @Builder.Default
    private Integer displayOrder = 0;
}
