package com.gerai.notificationservice.entity;

import com.gerai.notificationservice.enums.TypeNotification;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entité JPA — table NOTIFICATIONS (Oracle).
 * Structure alignée sur EMPLOYEE_ID (Long identity).
 */
@Entity
@Table(name = "NOTIFICATIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NOTIFICATION_ID")
    private Long notificationId;

    /** FK → EMPLOYEES.employee_id — peut être null si notification broadcast par rôle */
    @Column(name = "EMPLOYEE_ID")
    private Long employeeId;

    /** Rôle destinataire pour diffusion broadcast (ADMIN, CHEF, EMPLOYE) — utilisé si employeeId est null */
    @Column(name = "ROLE", length = 30)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 40)
    private TypeNotification type;

    @Column(name = "TITLE", nullable = false, length = 255)
    private String title;

    @Column(name = "CONTENT", length = 2000)
    private String content;

    @Column(name = "REFERENCE_TYPE", length = 50)
    private String referenceType;

    /**
     * ID de la ressource source — String pour supporter les identifiants
     * mixtes/alphanumériques (ex: "REF-POWERBI-999"), pas uniquement numériques.
     */
    @Column(name = "REFERENCE_ID", length = 100)
    private String referenceId;

    @Column(name = "ACTION_URL", length = 500)
    private String actionUrl;

    @Column(name = "IS_READ", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "READ_AT")
    private LocalDateTime readAt;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "TRIGGERED_BY")
    private Long triggeredBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) this.isRead = false;
    }
}