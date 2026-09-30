package com.gerai.projetsservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmailDraftDTO {
    private String objet;
    private String corps;
}
