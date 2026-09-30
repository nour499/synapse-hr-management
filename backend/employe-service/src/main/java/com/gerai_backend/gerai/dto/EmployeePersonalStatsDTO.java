package com.gerai_backend.gerai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployeePersonalStatsDTO {

    @JsonProperty("congesTotal")
    private long congesTotal;

    @JsonProperty("congesValides")
    private long congesValides;

    @JsonProperty("congesRefuses")
    private long congesRefuses;

    @JsonProperty("joursCongePris")
    private double joursCongePris;

    @JsonProperty("formationsTotal")
    private long formationsTotal;

    @JsonProperty("formationsValidees")
    private long formationsValidees;
}