package com.gerai_backend.gerai.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "POSITIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POSITION_ID")
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 150)
    private String title;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;
}
