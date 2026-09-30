package com.gerai.projetsservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sert les fichiers CV uploadés (stockés sur disque par RecrutementService.uploadCv)
 * sous /cv/** — sans ce handler, l'URL relative stockée en base (Candidate.cvUrl,
 * ex: "/cv/cv_12_169...pdf") ne renvoie rien : 404.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cv.upload-dir:C:/gerai/uploads/cv}")
    private String cvUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = cvUploadDir.endsWith("/") ? cvUploadDir : cvUploadDir + "/";
        registry.addResourceHandler("/cv/**")
                .addResourceLocations("file:" + location);
    }
}