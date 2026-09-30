package com.gerai_backend.gerai.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEE_DEPARTURES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartEmploye {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeId;

    @ManyToOne
    @JoinColumn(name = "EMPLOYEE_ID", insertable = false, updatable = false)
    private Employee employee;

    @Column(name = "DATE_DEPART", nullable = false)
    private LocalDateTime dateDepart;

    @Column(name = "TYPE_DEPART", nullable = false, length = 20)
    private String typeDepart;

    @Column(name = "RAISON", nullable = false, length = 2000)
    private String raison;

    @Column(name = "STATUT", nullable = false, length = 20)
    private String statut;

    @Column(name = "NOTES", length = 2000)
    private String notes;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}