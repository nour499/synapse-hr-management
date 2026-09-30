package com.gerai_backend.gerai.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LangueDTO {
    private String langue;
    private String niveau; // Débutant | Intermédiaire | Courant | Natif
}
