package com.gerai_backend.gerai.controllers;

import com.gerai_backend.gerai.client.AnalyticsServiceClient;
import com.gerai_backend.gerai.dto.*;
import com.gerai_backend.gerai.models.EmployeeActivity;
import com.gerai_backend.gerai.models.EmployeeDocument;
import com.gerai_backend.gerai.repositories.EmployeeActivityRepository;
import com.gerai_backend.gerai.repositories.EmployeeDocumentRepository;
import com.gerai_backend.gerai.services.CurrentUserService;
import com.gerai_backend.gerai.services.KeycloakUserService;
import com.gerai_backend.gerai.services.ProfilEmployeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/employe")
@RequiredArgsConstructor
public class ProfilEmployeController {

    private final CurrentUserService currentUserService;
    private final ProfilEmployeService profilEmployeService;
    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeActivityRepository activityRepository;
    private final KeycloakUserService keycloakUserService;
    private final AnalyticsServiceClient analyticsServiceClient;

    /** Racine locale des fichiers uploadés (ex : C:/gerai/uploads/employe) */
    @Value("${app.upload.dir}")
    private String uploadDir;

    // POST /api/employe/sync
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync() {
        String sub = currentUserService.getKeycloakId();
        var result = profilEmployeService.sync(
                sub, currentUserService.getEmail(), null, null);

        log.debug("[Sync] dbId={}, keycloakId={}, managerId={}",
                result.dbId(), result.keycloakId(), result.managerId());

        // HashMap au lieu de Map.of() : Map.of() lève une NullPointerException
        // dès qu'une valeur est null, or managerId est légitimement null pour
        // tout employé qui n'a pas encore de manager assigné en base.
        Map<String, Object> body = new HashMap<>();
        body.put("dbId", result.dbId());
        body.put("keycloakId", result.keycloakId());
        body.put("managerId", result.managerId());

        return ResponseEntity.ok(body);
    }

    // GET /api/employe/profil  (ProfilEmploye complet)
    @GetMapping("/profil")
    public ResponseEntity<ProfilEmployeDTO> getProfil() {
        return ResponseEntity.ok(profilEmployeService.getProfil(currentUserService.getKeycloakId()));
    }

    // PUT /api/employe/profil
    @PutMapping("/profil")
    public ResponseEntity<ProfilEmployeDTO> updateProfil(@RequestBody UpdateProfilDTO dto) {
        return ResponseEntity.ok(profilEmployeService.updateProfil(currentUserService.getKeycloakId(), dto));
    }

    // POST /api/employe/profil/photo  (multipart)
    @PostMapping("/profil/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        String sub = currentUserService.getKeycloakId();
        String filename = sub + "-" + file.getOriginalFilename();

        Path targetDir = Paths.get(uploadDir, "profil");
        Files.createDirectories(targetDir);
        Path targetFile = targetDir.resolve(filename);
        file.transferTo(targetFile.toFile());

        String url = "/uploads/employe/profil/" + filename;
        return ResponseEntity.ok(Map.of("photoUrl", url));
    }

    // GET /api/employe/documents
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentEmployeDTO>> getDocuments() {
        String sub = currentUserService.getKeycloakId();
        List<DocumentEmployeDTO> list = documentRepository.findByEmployeId(sub).stream()
                .map(this::toDto).toList();
        return ResponseEntity.ok(list);
    }

    // POST /api/employe/documents (multipart)
    @PostMapping("/documents")
    public ResponseEntity<DocumentEmployeDTO> addDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "categorie", defaultValue = "personnel") String categorie,
            @RequestParam(value = "description", required = false) String description) throws IOException {
        String sub = currentUserService.getKeycloakId();
        String type = guessType(file.getOriginalFilename());

        // Écriture réelle du fichier sur disque, sous uploadDir/{sub}/{filename}
        Path targetDir = Paths.get(uploadDir, sub);
        Files.createDirectories(targetDir);
        Path targetFile = targetDir.resolve(file.getOriginalFilename());
        file.transferTo(targetFile.toFile());

        EmployeeDocument doc = EmployeeDocument.builder()
                .employeId(sub)
                .nom(file.getOriginalFilename())
                .type(type)
                .categorie(categorie)
                .description(description)
                .taille(humanSize(file.getSize()))
                .tailleBytes(file.getSize())
                .url("/uploads/employe/" + sub + "/" + file.getOriginalFilename())
                .dateAjout(LocalDateTime.now())
                .build();
        EmployeeDocument saved = documentRepository.save(doc);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    // DELETE /api/employe/documents/{id}
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentRepository.findById(id).ifPresent(doc -> {
            try {
                Path filePath = resolveDocumentPath(doc);
                Files.deleteIfExists(filePath);
            } catch (Exception ex) {
                log.warn("Impossible de supprimer le fichier physique pour le document {}: {}", id, ex.getMessage());
            }
        });
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/employe/documents/{id}/{action}  (view | download) → bytes réels du fichier
    @GetMapping("/documents/{id}/{action}")
    public ResponseEntity<byte[]> getDocumentFile(@PathVariable Long id, @PathVariable String action) {
        EmployeeDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable: " + id));

        Path filePath = resolveDocumentPath(doc);

        if (!Files.exists(filePath)) {
            log.error("[Document] Fichier physique introuvable sur disque: {}", filePath);
            throw new RuntimeException("Fichier introuvable sur le serveur: " + doc.getNom());
        }

        byte[] content;
        try {
            content = Files.readAllBytes(filePath);
        } catch (IOException ex) {
            log.error("[Document] Erreur de lecture du fichier {}: {}", filePath, ex.getMessage());
            throw new RuntimeException("Erreur lors de la lecture du fichier: " + doc.getNom(), ex);
        }

        MediaType mediaType = resolveMediaType(doc.getType());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Content-Disposition",
                        (action.equals("download") ? "attachment" : "inline") + "; filename=\"" + doc.getNom() + "\"")
                .body(content);
    }

    // GET /api/employe/activites
    @GetMapping("/activites")
    public ResponseEntity<List<ActiviteEmployeDTO>> getActivites() {
        String sub = currentUserService.getKeycloakId();
        List<ActiviteEmployeDTO> list = activityRepository.findByEmployeId(sub).stream()
                .map(a -> ActiviteEmployeDTO.builder()
                        .id(a.getId())
                        .employeId(a.getEmployeId())
                        .titre(a.getTitre())
                        .description(a.getDescription())
                        .date(a.getDate() != null ? a.getDate().toString() : null)
                        .type(a.getType())
                        .statut(a.getStatut())
                        .badge(a.getBadge())
                        .icone(a.getIcone())
                        .lien(a.getLien())
                        .build())
                .toList();
        return ResponseEntity.ok(list);
    }

    // GET /api/employe/statistiques (version profil)
    @GetMapping("/statistiques")
    public ResponseEntity<StatistiquesEmployeDTO> getStatistiques() {
        String sub = currentUserService.getKeycloakId();
        var emp = profilEmployeService.getEmployeeByKeycloakId(sub);
        if (emp == null) {
            return ResponseEntity.ok(emptyStatistiques());
        }

        com.gerai_backend.gerai.dto.EmployeePersonalStatsDTO stats = analyticsServiceClient.getEmployeePersonalStats(emp.getId());

        int quotaAnnuel = 30;
        int congesRestants = Math.max(0, quotaAnnuel - (int) Math.round(stats.getJoursCongePris()));

        return ResponseEntity.ok(StatistiquesEmployeDTO.builder()
                .tauxPresence(100)
                .objectifsAtteints(0)
                .formationsSuivies((int) stats.getFormationsValidees())
                .formationsTotal((int) stats.getFormationsTotal())
                .tachesCompletes(0)
                .tachesTotal(0)
                .congesRestants(congesRestants)
                .congesTotal(quotaAnnuel)
                .build());
    }

    private StatistiquesEmployeDTO emptyStatistiques() {
        return StatistiquesEmployeDTO.builder()
                .tauxPresence(100)
                .objectifsAtteints(0)
                .formationsSuivies(0)
                .formationsTotal(0)
                .tachesCompletes(0)
                .tachesTotal(0)
                .congesRestants(30)
                .congesTotal(30)
                .build();
    }

    // GET /api/employe/performance
    @GetMapping("/performance")
    public ResponseEntity<PerformanceEmployeDTO> getPerformance() {
        String sub = currentUserService.getKeycloakId();
        var emp = profilEmployeService.getEmployeeByKeycloakId(sub);
        if (emp == null) {
            return ResponseEntity.ok(emptyPerformance());
        }

        com.gerai_backend.gerai.dto.EmployeePersonalStatsDTO stats = analyticsServiceClient.getEmployeePersonalStats(emp.getId());

        // Pour les tâches, on utilise EmployeeActivity (source réelle actuelle)
        long tachesCompletes = activityRepository.countByEmployeIdAndTypeAndStatut(sub, "tache", "terminee");
        long tachesEnCours = activityRepository.countByEmployeIdAndTypeAndStatut(sub, "tache", "en_cours");

        return ResponseEntity.ok(PerformanceEmployeDTO.builder()
                .tachesCompletees((int) tachesCompletes)
                .tauxCompletion(tachesCompletes + tachesEnCours > 0
                        ? (int) Math.round((tachesCompletes * 100.0) / (tachesCompletes + tachesEnCours))
                        : 0)
                .tempsResolutionBugs(0)
                .documentationCompletion(0)
                .codeQuality(0)
                .build());
    }

    private PerformanceEmployeDTO emptyPerformance() {
        return PerformanceEmployeDTO.builder()
                .tachesCompletees(0)
                .tauxCompletion(0)
                .tempsResolutionBugs(0)
                .documentationCompletion(0)
                .codeQuality(0)
                .build();
    }

    private DocumentEmployeDTO toDto(EmployeeDocument d) {
        return DocumentEmployeDTO.builder()
                .id(d.getId())
                .employeId(d.getEmployeId())
                .nom(d.getNom())
                .type(d.getType())
                .categorie(d.getCategorie())
                .taille(d.getTaille())
                .tailleBytes(d.getTailleBytes())
                .dateAjout(d.getDateAjout() != null ? d.getDateAjout().toString() : null)
                .dateModification(d.getDateModification() != null ? d.getDateModification().toString() : null)
                .url(d.getUrl())
                .description(d.getDescription())
                .build();
    }

    /**
     * Reconstruit le chemin disque réel d'un document à partir de son URL stockée
     * (ex: "/uploads/employe/{sub}/{filename}") et de la racine d'upload configurée.
     */
    private Path resolveDocumentPath(EmployeeDocument doc) {
        return Paths.get(uploadDir, doc.getEmployeId(), doc.getNom());
    }

    private MediaType resolveMediaType(String type) {
        if (type == null) return MediaType.APPLICATION_OCTET_STREAM;
        return switch (type) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "image" -> MediaType.IMAGE_JPEG;
            case "excel" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case "word" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }

    private String guessType(String filename) {
        if (filename == null) return "pdf";
        String l = filename.toLowerCase();
        if (l.endsWith(".pdf")) return "pdf";
        if (l.endsWith(".xls") || l.endsWith(".xlsx")) return "excel";
        if (l.endsWith(".doc") || l.endsWith(".docx")) return "word";
        if (l.endsWith(".png") || l.endsWith(".jpg") || l.endsWith(".jpeg") || l.endsWith(".gif")) return "image";
        return "pdf";
    }

    private String humanSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024) + " KB";
        return (bytes / (1024 * 1024)) + " MB";
    }
}
