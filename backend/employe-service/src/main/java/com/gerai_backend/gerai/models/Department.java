package com.gerai_backend.gerai.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "DEPARTMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DEPT_ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 150)
    private String name;

    /** Généré automatiquement par le service à la création — jamais saisi par l'utilisateur. */
    @Column(name = "CODE", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "CHEF_ID")
    private Long chefId;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "CAPACITE")
    private Integer capacite;

    @Column(name = "ANNEE_CREATION")
    private Integer anneeCreation;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    /** Calculé à la volée par le service — non stocké en base */
    @Transient
    private Integer totalEmployes;
}