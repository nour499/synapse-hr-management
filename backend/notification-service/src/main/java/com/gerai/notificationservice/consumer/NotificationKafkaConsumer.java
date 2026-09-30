package com.gerai.notificationservice.consumer;

import com.gerai.notificationservice.event.NotificationEvent;
import com.gerai.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * Consommateur Kafka du topic "notification-events".
 *
 * Les producteurs (demandes-service, projets-service, taches-service, employe-service)
 * publient des {@link NotificationEvent} que ce consommateur route vers le
 * {@link NotificationService} :
 *   - employeeId renseigné  → notification personnelle (persistée + push WebSocket)
 *   - role renseigné        → notification broadcast (persistée + push WebSocket par rôle)
 *
 * Compatible avec la configuration consumer de application.properties
 * (JsonDeserializer → NotificationEvent, use.type.headers=false).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationKafkaConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "${app.kafka.topic.notifications:notification-events}",
            groupId = "${KAFKA_CONSUMER_GROUP:notification-service-group}"
    )
    public void consume(NotificationEvent event) {
        if (event == null) {
            log.warn("[Kafka] Événement null ignoré.");
            return;
        }

        if (event.getEmployeeId() != null) {
            log.info("[Kafka] Notification personnelle → employeeId={} | source={}",
                    event.getEmployeeId(), event.getSourceService());
            notificationService.processNotificationEvent(event);
        } else if (event.getRole() != null) {
            log.info("[Kafka] Notification broadcast → role={} | source={}",
                    event.getRole(), event.getSourceService());
            notificationService.saveBroadcastNotification(event);
        } else {
            log.warn("[Kafka] Événement ignoré : ni employeeId ni role défini (source={}).",
                    event.getSourceService());
        }
    }
}
