package com.gerai_backend.gerai.dto;

import com.gerai_backend.gerai.models.Department;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class DepartmentDTO {

    private Long id;

    @NotBlank(message = "Le nom est requis")
    @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
    private String nom;

    /** Lecture seule — généré par le backend, ignoré s'il est envoyé par le client. */
    private String code;

    @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
    private String description;

    /** ID de l'employé responsable. Doit référencer un employé existant. */
    private Long chefId;

    @Size(max = 20, message = "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    private String telephone;

    @Email(message = "L'email doit être valide")
    @Size(max = 100, message = "L'email ne peut pas dépasser 100 caractères")
    private String email;

    @Min(value = 1, message = "La capacité doit être au moins de 1")
    private Integer capacite;

    @Min(value = 1900, message = "L'année de création doit être au moins de 1900")
    @Max(value = 2100, message = "L'année de création ne peut pas dépasser 2100")
    private Integer anneeCreation;

    /** Lecture seule — calculé par le service à partir des employés réels. Ignoré en entrée. */
    private Integer totalEmployes;

    /** Résolus par le service à partir de chefId — jamais envoyés par le client. */
    private String responsable;
    private String responsablePhoto;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DepartmentDTO fromEntity(Department entity) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getName());
        dto.setCode(entity.getCode());
        dto.setDescription(entity.getDescription());
        dto.setChefId(entity.getChefId());
        dto.setTelephone(entity.getTelephone());
        dto.setEmail(entity.getEmail());
        dto.setCapacite(entity.getCapacite());
        dto.setAnneeCreation(entity.getAnneeCreation());
        dto.setTotalEmployes(entity.getTotalEmployes());
        return dto;
    }

    /** code et totalEmployes ne sont jamais repris depuis le DTO : gérés côté service. */
    public Department toEntity() {
        Department entity = new Department();
        entity.setId(this.id);
        entity.setName(this.nom);
        entity.setDescription(this.description);
        entity.setChefId(this.chefId);
        entity.setTelephone(this.telephone);
        entity.setEmail(this.email);
        entity.setCapacite(this.capacite);
        entity.setAnneeCreation(this.anneeCreation);
        return entity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getChefId() { return chefId; }
    public void setChefId(Long chefId) { this.chefId = chefId; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getCapacite() { return capacite; }
    public void setCapacite(Integer capacite) { this.capacite = capacite; }
    public Integer getAnneeCreation() { return anneeCreation; }
    public void setAnneeCreation(Integer anneeCreation) { this.anneeCreation = anneeCreation; }
    public Integer getTotalEmployes() { return totalEmployes; }
    public void setTotalEmployes(Integer totalEmployes) { this.totalEmployes = totalEmployes; }
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    public String getResponsablePhoto() { return responsablePhoto; }
    public void setResponsablePhoto(String responsablePhoto) { this.responsablePhoto = responsablePhoto; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}