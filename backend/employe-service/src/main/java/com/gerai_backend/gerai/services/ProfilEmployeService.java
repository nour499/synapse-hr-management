package com.gerai_backend.gerai.services;

import com.gerai_backend.gerai.client.AnalyticsServiceClient;
import com.gerai_backend.gerai.dto.*;
import com.gerai_backend.gerai.models.Employee;
import com.gerai_backend.gerai.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfilEmployeService {

    private final EmployeeRepository employeeRepository;
    private final KeycloakUserService keycloakUserService;
    private final AnalyticsServiceClient analyticsServiceClient;

    public record SyncResult(Long dbId, String keycloakId, Long managerId) {}

    /**
     * Relie le sub Keycloak courant à un employé de la base.
     * Crée un employé minimal si aucun n'existe encore pour ce sub.
     */
    public SyncResult sync(String keycloakId, String email, String firstName, String lastName) {
        Employee emp = employeeRepository.findByKeycloakUserId(keycloakId)
                .orElseGet(() -> {
                    Employee e = Employee.builder()
                            .keycloakUserId(keycloakId)
                            .employeeCode("EMP-" + keycloakId.substring(0, Math.min(8, keycloakId.length())).toUpperCase())
                            .firstName(firstName != null ? firstName : (email != null ? email : "User"))
                            .lastName(lastName != null ? lastName : "")
                            .email(email != null ? email : (keycloakId + "@local"))
                            .hireDate(LocalDate.now())
                            .status("ACTIF")
                            .build();
                    return employeeRepository.save(e);
                });
        return new SyncResult(emp.getId(), emp.getKeycloakUserId(), emp.getManagerId());
    }

    public ProfilEmployeDTO getProfil(String keycloakId) {
        Employee e = employeeRepository.findByKeycloakUserId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Employé introuvable pour le sub " + keycloakId));

        // Récupération des stats réelles depuis analytics-service
        com.gerai_backend.gerai.dto.EmployeePersonalStatsDTO stats = analyticsServiceClient.getEmployeePersonalStats(e.getId());
        long congesTotal = stats.getCongesTotal();
        long congesValides = stats.getCongesValides();
        long congesRefuses = stats.getCongesRefuses();
        double joursCongePris = stats.getJoursCongePris();
        long formationsTotal = stats.getFormationsTotal();
        long formationsValidees = stats.getFormationsValidees();

        // Quota de congés annuel (ex: 30 jours) - calcul du reste
        int quotaAnnuel = 30;
        int congesRestants = Math.max(0, quotaAnnuel - (int) Math.round(joursCongePris));

        ProfilEmployeDTO.ProfilEmployeDTOBuilder b = ProfilEmployeDTO.builder()
                .id(e.getKeycloakUserId())
                .dbId(e.getId())
                .nom(e.getLastName())
                .prenom(e.getFirstName())
                .nomComplet((e.getFirstName() != null ? e.getFirstName() : "") + " " + (e.getLastName() != null ? e.getLastName() : ""))
                .photo(e.getPhotoUrl())
                .email(e.getEmail())
                .telephone(e.getPhone())
                .emailPersonnel(e.getEmailPersonnel())
                .dateEmbauche(e.getHireDate() != null ? e.getHireDate().toString() : null)
                .anciennete(e.getHireDate() != null ? computeAnciennete(e.getHireDate()) : null)
                .typeContrat(e.getTypeContrat())
                .dateFinContrat(e.getDateFinContrat() != null ? e.getDateFinContrat().toString() : null)
                .periodeEssaiJusquau(e.getPeriodeEssaiJusquau() != null ? e.getPeriodeEssaiJusquau().toString() : null)
                .categoriePro(e.getCategoriePro())
                .echelon(e.getEchelon())
                .salaireBase(e.getSalaireBase())
                .rib(e.getRib())
                .banque(e.getBanque())
                .genre(e.getGender())
                .situationFamiliale(e.getSituationFamiliale())
                .nombreEnfants(e.getNombreEnfants())
                .nationalite(e.getNationalite())
                .cin(e.getCin())
                .dateNaissance(e.getBirthDate() != null ? e.getBirthDate().toString() : null)
                .lieuNaissance(e.getLieuNaissance())
                .adresse(e.getAddress())
                .ville(e.getVille())
                .codePostal(e.getCodePostal())
                .contactUrgenceNom(e.getContactUrgenceNom())
                .contactUrgenceTel(e.getContactUrgenceTel())
                .contactUrgenceLien(e.getContactUrgenceLien())
                .niveauEtudes(e.getNiveauEtudes())
                .diplome(e.getDiplome())
                .etablissement(e.getEtablissement())
                .competences(splitCsv(e.getCompetences()))
                .langues(parseLangues(e.getLangues()))
                .certifications(parseCertifications(e.getCertifications()))
                .congesRestants(congesRestants)
                .congesTotal(quotaAnnuel)
                .congesPris((int) Math.round(joursCongePris))
                .tachesCompletes(0)
                .tachesEnCours(0)
                .tauxPresence(100)
                .objectifsAtteints(0)
                .formationsSuivies((int) formationsValidees)
                .formationsTotal((int) formationsTotal);

        // Département + poste via recherche JPQL pour éviter les N+1 hasardeux
        try {
            List<Object[]> deptPosteRows = employeeRepository.findDeptAndPosition(e.getId());
            if (deptPosteRows != null && !deptPosteRows.isEmpty()) {
                Object[] deptPoste = deptPosteRows.get(0);
                b.departement(deptPoste[0] != null ? deptPoste[0].toString() : null);
                b.poste(deptPoste.length > 1 && deptPoste[1] != null ? deptPoste[1].toString() : null);
            }
        } catch (Exception ex) {
            log.debug("Dept/poste non résolus pour {}: {}", e.getId(), ex.getMessage());
        }

        // Nom du manager
        if (e.getManagerId() != null) {
            employeeRepository.findById(e.getManagerId()).ifPresent(m -> b.managerNom(
                    (m.getFirstName() != null ? m.getFirstName() : "") + " " + (m.getLastName() != null ? m.getLastName() : "")));
        }

        return b.build();
    }

    public ProfilEmployeDTO updateProfil(String keycloakId, UpdateProfilDTO dto) {
        Employee e = employeeRepository.findByKeycloakUserId(keycloakId)
                .orElseThrow(() -> new RuntimeException("Employé introuvable pour le sub " + keycloakId));

        e.setPhone(dto.getTelephone());
        e.setEmailPersonnel(dto.getEmailPersonnel());
        e.setBirthDate(parseDate(dto.getDateNaissance()));
        e.setLieuNaissance(dto.getLieuNaissance());
        e.setAddress(dto.getAdresse());
        e.setVille(dto.getVille());
        e.setCodePostal(dto.getCodePostal());
        e.setGender(dto.getGenre());
        e.setSituationFamiliale(dto.getSituationFamiliale());
        e.setNombreEnfants(dto.getNombreEnfants());
        e.setNationalite(dto.getNationalite());
        e.setCin(dto.getCin());
        e.setContactUrgenceNom(dto.getContactUrgenceNom());
        e.setContactUrgenceTel(dto.getContactUrgenceTel());
        e.setContactUrgenceLien(dto.getContactUrgenceLien());
        e.setNiveauEtudes(dto.getNiveauEtudes());
        e.setDiplome(dto.getDiplome());
        e.setEtablissement(dto.getEtablissement());
        e.setCompetences(dto.getCompetences() != null ? String.join(",", dto.getCompetences()) : null);
        e.setLangues(serializeLangues(dto.getLangues()));

        employeeRepository.save(e);
        return getProfil(keycloakId);
    }

    private String computeAnciennete(LocalDate hire) {
        long months = ChronoUnit.MONTHS.between(hire, LocalDate.now());
        long years = months / 12;
        long rem = months % 12;
        if (years > 0) return years + " an(s) " + rem + " mois";
        return rem + " mois";
    }

    private List<String> splitCsv(String s) {
        if (s == null || s.isBlank()) return new ArrayList<>();
        return java.util.Arrays.stream(s.split(","))
                .map(String::trim).filter(x -> !x.isBlank()).toList();
    }

    private List<LangueDTO> parseLangues(String s) {
        if (s == null || s.isBlank()) return new ArrayList<>();
        // Format stocké: "Français:Débutant,Anglais:Courant"
        List<LangueDTO> list = new ArrayList<>();
        for (String part : s.split(",")) {
            String[] kv = part.split(":");
            LangueDTO.LangueDTOBuilder b = LangueDTO.builder().langue(kv[0].trim());
            if (kv.length > 1) b.niveau(kv[1].trim());
            list.add(b.build());
        }
        return list;
    }

    private String serializeLangues(List<LangueDTO> langues) {
        if (langues == null || langues.isEmpty()) return null;
        return langues.stream()
                .map(l -> l.getLangue() + ":" + (l.getNiveau() != null ? l.getNiveau() : ""))
                .reduce((a, b) -> a + "," + b).orElse(null);
    }

    private List<CertificationDTO> parseCertifications(String s) {
        return new ArrayList<>(); // à étendre si nécessaire
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }

    public Employee getEmployeeByKeycloakId(String keycloakId) {
        return employeeRepository.findByKeycloakUserId(keycloakId).orElse(null);
    }
}
