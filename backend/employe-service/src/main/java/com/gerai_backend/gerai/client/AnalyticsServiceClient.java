package com.gerai_backend.gerai.client;

import com.gerai_backend.gerai.dto.EmployeePersonalStatsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsServiceClient {

    private final WebClient webClient;

    @Value("${app.analytics-service.url}")
    private String analyticsServiceUrl;

    /**
     * Récupère les stats personnelles (congés + formations) d'un employé
     * depuis l'endpoint interne de analytics-service.
     *
     * @param employeeId EMPLOYEE_ID Oracle de l'employé
     * @return EmployeePersonalStatsDTO ou DTO vide en cas d'erreur
     */
    public EmployeePersonalStatsDTO getEmployeePersonalStats(Long employeeId) {
        String url = analyticsServiceUrl + "/internal/employes/" + employeeId + "/stats-personnelles";
        log.debug("[AnalyticsClient] Calling {}", url);

        try {
            return webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(EmployeePersonalStatsDTO.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(ex -> {
                        log.warn("[AnalyticsClient] Erreur appel {} : {}", url, ex.getMessage());
                        return Mono.just(emptyStats());
                    })
                    .block();
        } catch (Exception ex) {
            log.warn("[AnalyticsClient] Exception appel {} : {}", url, ex.getMessage());
            return emptyStats();
        }
    }

    private EmployeePersonalStatsDTO emptyStats() {
        EmployeePersonalStatsDTO dto = new EmployeePersonalStatsDTO();
        dto.setCongesTotal(0);
        dto.setCongesValides(0);
        dto.setCongesRefuses(0);
        dto.setJoursCongePris(0);
        dto.setFormationsTotal(0);
        dto.setFormationsValidees(0);
        return dto;
    }
}