package com.gerai_backend.gerai.services;

import com.gerai_backend.gerai.models.Employee;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Producteur d'événements Kafka pour notifier les autres microservices
 * (notification-service, etc.) de la création / départ d'un employé.
 *
 * Implémentation "safe" : si le broker Kafka n'est pas disponible, l'envoi
 * est simplement journalisé et ne fait jamais échouer la requête HTTP.
 */
@Slf4j
@Service
public class EmployeeEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String topic;

    public EmployeeEventProducer(org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate,
                                 @org.springframework.beans.factory.annotation.Value("${app.kafka.topic.notifications:notification-events}")
                                 String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void notifierNouvelEmploye(Employee e) {
        publier(new Event("EMPLOYE_CREE", e));
    }

    public void notifierDepartEmploye(Employee e) {
        publier(new Event("EMPLOYE_DEPART", e));
    }

    private void publier(Event event) {
        try {
            if (kafkaTemplate != null) {
                kafkaTemplate.send(topic, event);
            }
            log.info("[Kafka] Event {} publié sur '{}'", event.type, topic);
        } catch (Exception ex) {
            log.warn("[Kafka] Publication ignorée (broker indisponible) pour {}: {}",
                    event.type, ex.getMessage());
        }
    }

    public record Event(String type, Employee employe) {}
}
