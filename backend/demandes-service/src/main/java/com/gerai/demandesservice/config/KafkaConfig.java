package com.gerai.demandesservice.config;

import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.Map;

/**
 * Configuration du producteur Kafka pour les NotificationEvent.
 * Déclare un KafkaTemplate&lt;String, Object&gt; typé explicitement
 * afin que DemandeService puisse l'injecter sans ambiguïté.
 */
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> notificationProducerFactory() {
        Map<String, Object> config = Map.of(
                "bootstrap.servers", bootstrapServers,
                "key.serializer",   StringSerializer.class,
                "value.serializer", JsonSerializer.class
        );
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> notificationKafkaTemplate(
            ProducerFactory<String, Object> notificationProducerFactory) {
        return new KafkaTemplate<>(notificationProducerFactory);
    }
}
