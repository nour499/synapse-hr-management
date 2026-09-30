package com.gerai.projetsservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Fournit un JavaMailSender explicitement (l'autoconfig MailSenderAutoConfiguration
 * est volontairement désactivée dans application.properties).
 * Le bean existe toujours ; EmailService gère l'absence de configuration SMTP
 * en renvoyant un échec gracieux plutôt qu'en crashant le démarrage.
 */
@Slf4j
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(
            @Value("${spring.mail.host}") String host,
            @Value("${spring.mail.port}") int port,
            @Value("${spring.mail.username}") String username,
            @Value("${spring.mail.password}") String password) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", host);
        sender.setJavaMailProperties(props);
        log.info("[MailConfig] JavaMailSender créé (host={}, user={})", host, username);
        return sender;
    }
}
