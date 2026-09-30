package com.gerai.notificationservice.service;

import com.gerai.notificationservice.dto.CreateNotificationRequest;
import com.gerai.notificationservice.dto.NotificationDTO;
import com.gerai.notificationservice.entity.Notification;
import com.gerai.notificationservice.event.NotificationEvent;
import com.gerai.notificationservice.enums.TypeNotification;
import com.gerai.notificationservice.mapper.NotificationMapper;
import com.gerai.notificationservice.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;
    private final WebSocketNotificationService webSocketNotificationService;

    /* ═══════════════════════════════════════
       TRAITEMENT KAFKA
       ═══════════════════════════════════════ */

    @Transactional
    public Notification processNotificationEvent(NotificationEvent event) {

        if (event == null) {
            log.warn("[NotificationService] Event Kafka null ignoré.");
            return null;
        }

        log.info("[NotificationService] Event reçu | Source: {} | EmployeeId: {}",
                event.getSourceService(), event.getEmployeeId());

        if (event.getEmployeeId() == null) {
            log.warn("[NotificationService] EmployeeId absent. Event ignoré.");
            return null;
        }

        try {
            /*
             * referenceId est conservé tel quel en String.
             * La colonne Oracle NOTIFICATIONS.REFERENCE_ID est VARCHAR2(100).
             */
            Notification notification = notificationMapper.toEntity(event);

            // Initialisation de l'état de lecture
            notification.setIsRead(false);

            Notification saved = notificationRepository.saveAndFlush(notification);

            log.info("[NotificationService] Notification sauvegardée | ID: {}",
                    saved.getNotificationId());

            // Push temps réel vers le destinataire (WebSocket)
            pushRealtime(saved.getEmployeeId(), saved, null);

            // Envoi de l'email
            if (event.getEmail() != null && !event.getEmail().isBlank()) {
                try {
                    emailService.envoyerDepuisEvent(event);
                } catch (Exception ex) {
                    log.error("[NotificationService] Erreur envoi email : {}",
                            ex.getMessage());
                }
            }

            return saved;

        } catch (Exception e) {
            log.error("[NotificationService] Erreur traitement Kafka : {}",
                    e.getMessage(), e);
            throw e;
        }
    }

    /* ═══════════════════════════════════════
       BROADCAST — PERSISTANCE
       ═══════════════════════════════════════ */

    @Transactional
    public Notification saveBroadcastNotification(NotificationEvent event) {

        TypeNotification typeEnum;

        try {
            typeEnum = TypeNotification.valueOf(event.getType());
        } catch (Exception e) {
            typeEnum = TypeNotification.INFO;
        }

        /*
         * referenceId est conservé tel quel.
         * Exemple : "123", "DEMANDE-123", "REF-POWERBI-999", etc.
         */
        String refId = event.getReferenceId();

        // Normalisation du rôle pour aligner la persistance ET le topic WebSocket
        // sur les valeurs gérées par le frontend : ADMIN / CHEF / EMPLOYE
        String normalizedRole = normalizeRole(event.getRole());

        Notification notif = Notification.builder()
                .role(normalizedRole)
                .type(typeEnum)
                .title(event.getTitle())
                .content(event.getContent())
                .referenceType(event.getReferenceType())
                .referenceId(refId)
                .actionUrl(event.getActionUrl())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.saveAndFlush(notif);

        log.info("[NotificationService] Broadcast sauvegardé | role={} | id={}",
                normalizedRole, saved.getNotificationId());

        // Push temps réel vers tous les clients du rôle (WebSocket)
        pushRealtime(null, saved, normalizedRole);

        return saved;
    }

    /* ═══════════════════════════════════════
       PUSH WEBSOCKET + HELPERS
       ═══════════════════════════════════════ */

    /**
     * Pousse la notification en temps réel vers le destinataire :
     *   - si employeeId présent → canal personnel /user/queue/notifications
     *   - sinon si role présent  → canal de broadcast /topic/notifications.{role}
     *
     * Le DTO est utilisé tel quel par le frontend (BackendNotificationDTO).
     * CREATED_AT peut être null juste après le save (colonne gérée par Oracle),
     * on le renseigne alors côté Java pour ne pas casser l'affichage Angular.
     */
    private void pushRealtime(Long employeeId, Notification saved, String role) {

        try {
            NotificationDTO dto = notificationMapper.toDTO(saved);

            if (dto.getCreatedAt() == null) {
                dto.setCreatedAt(LocalDateTime.now());
            }

            if (employeeId != null) {
                webSocketNotificationService.sendToUser(
                        String.valueOf(employeeId),
                        dto
                );
            } else if (role != null) {
                webSocketNotificationService.sendToRole(role, dto);
            }

        } catch (Exception ex) {
            log.error(
                    "[NotificationService] Erreur push WebSocket (non bloquant) : {}",
                    ex.getMessage()
            );
        }
    }

    /**
     * Normalise le rôle destinataire d'un broadcast pour qu'il corresponde
     * aux topics WebSocket et au filtrage REST du frontend :
     *   CHEF → CHEF, EMPLOYE → EMPLOYE, COMITE → COMITE, DG → DG,
     *   tout le reste → ADMIN
     */
    private String normalizeRole(String role) {

        if (role == null) {
            return "ADMIN";
        }

        String r = role.trim().toUpperCase();

        if ("CHEF".equals(r)) {
            return "CHEF";
        }

        if ("EMPLOYE".equals(r) || "EMPLOYÉ".equals(r)) {
            return "EMPLOYE";
        }

        if ("COMITE".equals(r) || "COMITÉ".equals(r)) {
            return "COMITE";
        }

        if ("DG".equals(r) || "DIRECTEUR_GENERAL".equals(r)) {
            return "DG";
        }

        return "ADMIN";
    }

    /* ═══════════════════════════════════════
       LECTURE
       ═══════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByEmployee(Long employeeId) {

        return notificationRepository
                .findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByEmployeeAndRole(
            Long employeeId,
            String role) {

        return notificationRepository
                .findByEmployeeOrRole(employeeId, role)
                .stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(Long employeeId) {

        return notificationRepository
                .findByEmployeeIdAndIsReadFalseOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnread(Long employeeId) {

        return notificationRepository
                .countByEmployeeIdAndIsReadFalse(employeeId);
    }

    /* ═══════════════════════════════════════
       CRÉATION MANUELLE
       ═══════════════════════════════════════ */

    @Transactional
    public NotificationDTO create(CreateNotificationRequest request) {

        Notification notification = notificationMapper.toEntity(request);

        notification.setIsRead(false);

        // On laisse Oracle gérer le CREATED_AT
        Notification saved = notificationRepository.saveAndFlush(notification);

        log.info(
                "[NotificationService] Notification créée manuellement | ID: {}",
                saved.getNotificationId()
        );

        // Push temps réel vers le destinataire (WebSocket)
        pushRealtime(saved.getEmployeeId(), saved, saved.getRole());

        return notificationMapper.toDTO(saved);
    }

    /* ═══════════════════════════════════════
       ACTIONS
       ═══════════════════════════════════════ */

    @Transactional
    public int markAllAsRead(Long employeeId, String role) {

        return notificationRepository.markAllAsReadByEmployeeOrRole(
                employeeId,
                role,
                LocalDateTime.now()
        );
    }

    @Transactional
    public void deleteById(Long id) {

        notificationRepository.deleteById(id);
    }

    @Transactional
    public void deleteNotificationsByEmployee(Long employeeId) {

        notificationRepository.deleteByEmployeeId(employeeId);
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Notification avec ID " + id + " non trouvée"
                ));

        if (notification.getIsRead() == null || !notification.getIsRead()) {

            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }

        return notificationMapper.toDTO(
                notificationRepository.save(notification)
        );
    }
}