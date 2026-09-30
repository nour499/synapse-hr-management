package com.gerai.notificationservice;

import com.gerai.notificationservice.entity.Notification;
import com.gerai.notificationservice.event.NotificationEvent;
import com.gerai.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext
@EmbeddedKafka(
        partitions = 1,
        bootstrapServersProperty = "spring.kafka.bootstrap-servers",
        topics = {"notification-events"}
)
class NotificationServiceApplicationTests {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void contextLoads() {
        assertNotNull(notificationRepository);
    }

    @Test
    void testKafkaConsumerIntegration() throws InterruptedException {

        // Nettoyage avant le test
        notificationRepository.deleteAll();

        // 1. Préparer l'événement Kafka
        NotificationEvent event = NotificationEvent.builder()
                .employeeId(101L)
                .email("test-pfe@gerai.com")
                .type("NOUVELLE_DEMANDE")
                .title("Test Intégration GerAI")
                .content("Ceci est un test Kafka")
                .referenceType("DEMANDE")
                .referenceId("REF-POWERBI-999")
                .sourceService("TEST-SUITE")
                .triggeredBy(1L)
                .build();

        // 2. Envoyer le message Kafka
        kafkaTemplate.send("notification-events", event);

        // 3. Attendre le traitement du consumer
        TimeUnit.SECONDS.sleep(5);

        // 4. Récupérer les notifications enregistrées
        List<Notification> notifications = notificationRepository.findAll();

        // 5. Vérifier qu'une notification a bien été créée
        assertFalse(
                notifications.isEmpty(),
                "Le message Kafka n'a pas été enregistré en base de données !"
        );

        Notification captured = notifications.get(0);

        // 6. Vérifications
        assertEquals(
                "Test Intégration GerAI",
                captured.getTitle()
        );

        assertEquals(
                101L,
                captured.getEmployeeId()
        );

        // referenceId est maintenant un String
        // et doit être conservé exactement comme envoyé par Kafka.
        assertEquals(
                "REF-POWERBI-999",
                captured.getReferenceId()
        );

        assertFalse(
                captured.getIsRead(),
                "La notification devrait être marquée comme non lue par défaut"
        );
    }
}