package com.gerai.projetsservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.gerai.projetsservice.config.JwtHelperInterface;
import com.gerai.projetsservice.dto.*;
import com.gerai.projetsservice.model.*;
import com.gerai.projetsservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Logique métier complète du module recrutement :
 *  - demandes de recrutement (chef → RH)
 *  - offres (jobs) + questions killer/screening
 *  - candidats (pipeline, CV, scoring IA, emails)
 *  - entretiens (planification, décision, invitation)
 *  - portail public (postulation, screening, validation killer)
 *
 * Les appels Groq/email dégradent proprement si non configurés.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecrutementService {

    private final RecrutementDemandeRepository demandeRepo;
    private final JobRepository jobRepo;
    private final JobKillerQuestionRepository killerRepo;
    private final JobScreeningQuestionRepository screeningRepo;
    private final CandidateRepository candidateRepo;
    private final InterviewRepository interviewRepo;

    private final GroqService groq;
    private final EmailService emailService;
    private final CvTextExtractor cvTextExtractor;
    private final JwtHelperInterface jwt;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Value("${cv.upload-dir:C:/gerai/uploads/cv}")
    private String cvUploadDir;

    /**
     * Coordonnées de l'entreprise injectées dans les emails.
     */
    @Value("${app.company.name}")
    private String companyName;

    @Value("${app.company.address:}")
    private String companyAddress;

    @Value("${app.company.phone:}")
    private String companyPhone;

    /*
     * =========================================================
     * STATUTS CANDIDATS
     * =========================================================
     *
     * Ces valeurs doivent rester synchronisées avec la contrainte
     * Oracle CK_CAND_STATUT :
     *
     * NOUVEAU
     * EN_REVUE
     * ENTRETIEN
     * REFUSE
     * ACCEPTE
     * LISTE_ATTENTE
     */
    private static final Set<String> STATUTS_CANDIDAT_AUTORISES = Set.of(
            "NOUVEAU",
            "EN_REVUE",
            "ENTRETIEN",
            "REFUSE",
            "ACCEPTE",
            "LISTE_ATTENTE"
    );

    private static String normalizeCandidateStatus(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException("Le statut est obligatoire");
        }

        String normalized = statut.trim().toUpperCase();

        if (!STATUTS_CANDIDAT_AUTORISES.contains(normalized)) {
            throw new IllegalArgumentException(
                    "Statut candidat invalide. Valeurs autorisées : "
                            + String.join(", ", STATUTS_CANDIDAT_AUTORISES)
            );
        }

        return normalized;
    }

    /* ═══════════════════════════════════════════════════════
       DEMANDES DE RECRUTEMENT
       ═══════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<DemandeRecrutementDTO> getDemandes(String chefId) {

        List<RecrutementDemande> list =
                (chefId != null && !chefId.isBlank())
                        ? demandeRepo.findByChefId(chefId)
                        : demandeRepo.findAll();

        return list.stream()
                .sorted(Comparator.comparing(
                        RecrutementDemande::getDateDemande,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toDemandeDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DemandeRecrutementDTO createDemande(
            DemandeRecrutementDTO req,
            Authentication auth
    ) {

        String chefId =
                (req.getChefId() != null && !req.getChefId().isBlank())
                        ? req.getChefId()
                        : jwt.getEmail(auth);

        String chefNom =
                (req.getChefNom() != null && !req.getChefNom().isBlank())
                        ? req.getChefNom()
                        : (jwt.getEmail(auth) != null
                        ? jwt.getEmail(auth)
                        : "Chef");

        RecrutementDemande d = RecrutementDemande.builder()
                .chefId(chefId)
                .chefNom(chefNom)
                .departement(req.getDepartement())
                .titrePoste(req.getTitrePoste())
                .role(req.getRole())
                .nombrePostes(req.getNombrePostes())
                .typeContrat(req.getTypeContrat())
                .justification(req.getJustification())
                .urgence(
                        req.getUrgence() != null
                                ? req.getUrgence()
                                : "NORMALE"
                )
                .statut("EN_ATTENTE")
                .dateDemande(LocalDateTime.now())
                .build();

        return toDemandeDTO(demandeRepo.save(d));
    }

    @Transactional
    public void deleteDemande(Long id) {

        if (!demandeRepo.existsById(id)) {
            throw new NoSuchElementException("Demande introuvable");
        }

        demandeRepo.deleteById(id);
    }

    @Transactional
    public DemandeRecrutementDTO convertirDemande(
            Long id,
            String traiteePar
    ) {

        RecrutementDemande d = demandeRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Demande introuvable"));

        if (!"EN_ATTENTE".equals(d.getStatut())) {
            throw new IllegalStateException(
                    "Seule une demande en attente peut être convertie"
            );
        }

        Job job = Job.builder()
                .titre(d.getTitrePoste())
                .departement(d.getDepartement())
                .role(d.getRole())
                .typeContrat(d.getTypeContrat())
                .postes(d.getNombrePostes())
                .statut("OUVERT")
                .description(d.getJustification())
                .datePublication(LocalDateTime.now())
                .build();

        job = jobRepo.save(job);

        d.setStatut("CONVERTIE");
        d.setJobId(job.getJobId());
        d.setTraiteePar(traiteePar);
        d.setDateTraitement(LocalDateTime.now());

        return toDemandeDTO(demandeRepo.save(d));
    }

    @Transactional
    public DemandeRecrutementDTO rejeterDemande(
            Long id,
            String motif,
            String traiteePar
    ) {

        RecrutementDemande d = demandeRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Demande introuvable"));

        if (!"EN_ATTENTE".equals(d.getStatut())) {
            throw new IllegalStateException(
                    "Seule une demande en attente peut être rejetée"
            );
        }

        d.setStatut("REJETEE");
        d.setCommentaireRh(motif);
        d.setTraiteePar(traiteePar);
        d.setDateTraitement(LocalDateTime.now());

        return toDemandeDTO(demandeRepo.save(d));
    }

    /* ═══════════════════════════════════════════════════════
       JOBS
       ═══════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<JobDTO> getJobs() {

        return jobRepo.findAll().stream()
                .sorted(Comparator.comparing(
                        Job::getDatePublication,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toJobDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDTO getJob(Long id) {

        return jobRepo.findById(id)
                .map(this::toJobDTO)
                .orElseThrow(() ->
                        new NoSuchElementException("Offre introuvable"));
    }

    @Transactional
    public JobDTO createJob(JobDTO req) {

        Job j = Job.builder()
                .titre(req.getTitre())
                .departement(req.getDepartement())
                .role(req.getRole())
                .typeContrat(req.getTypeContrat())
                .postes(req.getPostes())
                .description(req.getDescription())
                .lieu(req.getLieu())
                .statut(
                        req.getStatut() != null
                                ? req.getStatut()
                                : "OUVERT"
                )
                .datePublication(LocalDateTime.now())
                .build();

        return toJobDTO(jobRepo.save(j));
    }

    @Transactional
    public JobDTO updateJob(Long id, JobDTO req) {

        Job j = jobRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Offre introuvable"));

        if (req.getTitre() != null)
            j.setTitre(req.getTitre());

        if (req.getDepartement() != null)
            j.setDepartement(req.getDepartement());

        if (req.getRole() != null)
            j.setRole(req.getRole());

        if (req.getTypeContrat() != null)
            j.setTypeContrat(req.getTypeContrat());

        if (req.getPostes() != null)
            j.setPostes(req.getPostes());

        if (req.getDescription() != null)
            j.setDescription(req.getDescription());

        if (req.getLieu() != null)
            j.setLieu(req.getLieu());

        if (req.getStatut() != null)
            j.setStatut(req.getStatut());

        return toJobDTO(jobRepo.save(j));
    }

    @Transactional
    public void deleteJob(Long id) {

        if (!jobRepo.existsById(id)) {
            throw new NoSuchElementException("Offre introuvable");
        }

        screeningRepo.deleteByJobJobId(id);
        killerRepo.deleteByJobJobId(id);
        jobRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ScreeningBundleDTO getScreening(Long jobId) {

        if (!jobRepo.existsById(jobId)) {
            throw new NoSuchElementException("Offre introuvable");
        }

        List<KillerQuestionDTO> killers =
                killerRepo.findByJobJobId(jobId)
                        .stream()
                        .sorted(Comparator.comparing(
                                JobKillerQuestion::getDisplayOrder,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ))
                        .map(this::toKillerDTO)
                        .collect(Collectors.toList());

        List<ScreeningQuestionDTO> screens =
                screeningRepo.findByJobJobId(jobId)
                        .stream()
                        .sorted(Comparator.comparing(
                                JobScreeningQuestion::getDisplayOrder,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ))
                        .map(this::toScreeningDTO)
                        .collect(Collectors.toList());

        return ScreeningBundleDTO.builder()
                .killerQuestions(killers)
                .screeningQuestions(screens)
                .build();
    }

    @Transactional
    public KillerQuestionDTO addKillerQuestion(
            Long jobId,
            Map<String, Object> body
    ) {

        Job job = jobRepo.findById(jobId)
                .orElseThrow(() ->
                        new NoSuchElementException("Offre introuvable"));

        JobKillerQuestion q = JobKillerQuestion.builder()
                .job(job)
                .question(str(body.get("question")))
                .expectedAnswer(str(body.get("expectedAnswer")))
                .displayOrder(toInt(body.get("displayOrder"), 0))
                .build();

        return toKillerDTO(killerRepo.save(q));
    }

    @Transactional
    public void deleteKillerQuestion(Long jobId, Long qid) {

        JobKillerQuestion q = killerRepo.findById(qid)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Question killer introuvable"
                        ));

        if (q.getJob() == null
                || !Objects.equals(q.getJob().getJobId(), jobId)) {

            throw new IllegalArgumentException(
                    "Cette question n'appartient pas à cette offre"
            );
        }

        killerRepo.delete(q);
    }

    @Transactional
    public ScreeningQuestionDTO addScreeningQuestion(
            Long jobId,
            Map<String, Object> body
    ) {

        Job job = jobRepo.findById(jobId)
                .orElseThrow(() ->
                        new NoSuchElementException("Offre introuvable"));

        JobScreeningQuestion q = JobScreeningQuestion.builder()
                .job(job)
                .question(str(body.get("question")))
                .type(str(body.get("type")))
                .optionsJson(
                        toJsonList(
                                toStrList(body.get("options"))
                        )
                )
                .correctAnswer(str(body.get("correctAnswer")))
                .weight(toInt(body.get("weight"), 5))
                .displayOrder(toInt(body.get("displayOrder"), 0))
                .build();

        return toScreeningDTO(screeningRepo.save(q));
    }

    @Transactional
    public void deleteScreeningQuestion(Long jobId, Long qid) {

        JobScreeningQuestion q = screeningRepo.findById(qid)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Question screening introuvable"
                        ));

        if (q.getJob() == null
                || !Objects.equals(q.getJob().getJobId(), jobId)) {

            throw new IllegalArgumentException(
                    "Cette question n'appartient pas à cette offre"
            );
        }

        screeningRepo.delete(q);
    }

    @Transactional
    public Map<String, Object> generateJobDescription(
            Map<String, Object> body
    ) {

        String titre = str(body.get("titre"));
        String departement = str(body.get("departement"));
        String role = str(body.get("role"));
        String typeContrat = str(body.get("typeContrat"));

        String prompt =
                "Rédige une description de poste professionnelle en français "
                        + "pour le poste de '" + titre + "' ("
                        + role + ", " + typeContrat
                        + ") dans le département " + departement
                        + ". Inclus : missions, profil recherché, "
                        + "prérequis, ce que nous offrons. "
                        + "Format Markdown concis.";

        String desc = groq.chat(
                "Tu es un recruteur RH senior. "
                        + "Réponds uniquement avec la description, sans introduction.",
                prompt
        );

        if (desc == null) {
            desc =
                    "Poste : " + titre
                            + "\nDépartement : " + departement
                            + "\nType : " + typeContrat
                            + "\n\nMissions :\n- À définir"
                            + "\n\nProfil recherché :\n- Expérience dans le domaine"
                            + "\n\n"
                            + "(Description générée par défaut — "
                            + "configurez Groq pour une génération IA.)";
        }

        return Map.of("description", desc.trim());
    }

    /* ═══════════════════════════════════════════════════════
       CANDIDATS
       ═══════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<CandidateDTO> getCandidates() {

        return candidateRepo.findAll().stream()
                .sorted(Comparator.comparing(
                        Candidate::getDatePostulation,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toCandidateDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCandidate(Long id) {

        if (!candidateRepo.existsById(id)) {
            throw new NoSuchElementException("Candidat introuvable");
        }

        candidateRepo.deleteById(id);
    }

    @Transactional
    public CandidateDTO updateStatut(Long id, String statut) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        String normalized = normalizeCandidateStatus(statut);

        c.setStatut(normalized);

        return toCandidateDTO(candidateRepo.save(c));
    }

    @Transactional
    public CandidateDTO toggleShortlist(
            Long id,
            Boolean shortliste
    ) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        c.setShortliste(
                shortliste != null
                        ? shortliste
                        : !Boolean.TRUE.equals(c.getShortliste())
        );

        return toCandidateDTO(candidateRepo.save(c));
    }

    @Transactional
    public CandidateDTO saveNote(Long id, String note) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        c.setNoteRecruteur(note);

        return toCandidateDTO(candidateRepo.save(c));
    }

    @Transactional
    public Map<String, Object> uploadCv(
            Long id,
            MultipartFile file
    ) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier CV absent");
        }

        try {

            File dir = new File(cvUploadDir);

            if (!dir.exists()) {
                dir.mkdirs();
            }

            String ext = "";
            String original = file.getOriginalFilename();

            if (original != null && original.contains(".")) {
                ext = original.substring(
                        original.lastIndexOf('.')
                );
            }

            String filename =
                    "cv_"
                            + id
                            + "_"
                            + System.currentTimeMillis()
                            + ext;

            file.transferTo(new File(dir, filename));

            String url = "/cv/" + filename;

            c.setCvUrl(url);

            String extracted =
                    cvTextExtractor.extract(
                            new File(dir, filename)
                    );

            if (extracted != null) {
                c.setCvText(extracted);
            }

            candidateRepo.save(c);

            return Map.of("url", url);

        } catch (Exception e) {

            log.warn(
                    "[RecrutementService] Échec upload CV: {}",
                    e.getMessage()
            );

            throw new RuntimeException(
                    "Échec de l'enregistrement du CV : "
                            + e.getMessage()
            );
        }
    }

    @Transactional
    public CvScoreResultDTO scoreCv(Long id) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        CvScoreResultDTO result = groqScoreCv(c);

        if (result != null) {
            c.setScore(result.getScore());
            candidateRepo.save(c);
        }

        return result;
    }

    private CvScoreResultDTO groqScoreCv(Candidate c) {

        String competences =
                c.getCompetencesJson() != null
                        ? c.getCompetencesJson()
                        : "[]";

        String jobContexte = "";

        if (c.getJobId() != null) {

            Job job =
                    jobRepo.findById(c.getJobId())
                            .orElse(null);

            if (job != null) {

                jobContexte =
                        "Poste visé: "
                                + job.getTitre()
                                + " ("
                                + job.getRole()
                                + ", "
                                + job.getTypeContrat()
                                + ", département "
                                + job.getDepartement()
                                + "). "
                                + (
                                job.getDescription() != null
                                        ? "Description du poste: "
                                        + job.getDescription()
                                        + " "
                                        : ""
                        );
            }
        }

        String cvExtrait =
                (c.getCvText() != null
                        && !c.getCvText().isBlank())
                        ?
                        "\n\nContenu du CV du candidat "
                                + "(texte extrait):\n"
                                + c.getCvText()
                        :
                        "\n\n(Aucun CV analysable — base-toi "
                                + "sur les compétences et "
                                + "l'expérience déclarées.)";

        String prompt =
                jobContexte
                        + "Évalue l'adéquation de ce candidat avec le poste. "
                        + "Candidat: nom="
                        + c.getPrenom()
                        + " "
                        + c.getNom()
                        + ", expérience déclarée="
                        + c.getExperience()
                        + " ans, compétences déclarées="
                        + competences
                        + "."
                        + cvExtrait
                        + "\n\nRéponds STRICTEMENT en JSON: "
                        + "{\"score\":<0-100>, "
                        + "\"niveau\":\"EXCELLENT|BON|PASSABLE|INSUFFISANT\", "
                        + "\"competencesMatchees\":[...], "
                        + "\"competencesManquantes\":[...], "
                        + "\"pointsForts\":[...], "
                        + "\"recommandation\":\"...\"}. "
                        + "Le score doit refléter l'adéquation "
                        + "entre le CV et le poste visé.";

        CvScoreResultDTO ai =
                groq.chatJson(
                        "Tu es un expert RH spécialisé en analyse de CV. "
                                + "Réponds uniquement en JSON valide, "
                                + "sans texte autour.",
                        prompt,
                        CvScoreResultDTO.class
                );

        if (ai != null) {
            return ai;
        }

        int base =
                Math.min(
                        (c.getExperience() != null
                                ? c.getExperience()
                                : 0) * 8,
                        50
                );

        int comp =
                parseList(c.getCompetencesJson()).size() * 6;

        double score =
                Math.min(base + comp, 100.0);

        String niveau =
                score >= 80
                        ? "EXCELLENT"
                        : score >= 60
                        ? "BON"
                        : score >= 40
                        ? "PASSABLE"
                        : "INSUFFISANT";

        return CvScoreResultDTO.builder()
                .score(score)
                .niveau(niveau)
                .competencesMatchees(
                        parseList(c.getCompetencesJson())
                )
                .competencesManquantes(List.of())
                .pointsForts(
                        parseList(c.getCompetencesJson())
                )
                .recommandation(
                        "Score estimé automatiquement "
                                + "(sans IA). Configurez Groq "
                                + "pour une analyse approfondie."
                )
                .build();
    }

    @Transactional
    public Map<String, Object> interviewQuestions(Long id) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        List<Map<String, String>> questions =
                groqInterviewQuestions(c);

        if (questions == null) {

            questions = List.of(
                    Map.of(
                            "categorie",
                            "Expérience",
                            "question",
                            "Pouvez-vous décrire votre "
                                    + "expérience la plus pertinente "
                                    + "pour ce poste ?"
                    ),
                    Map.of(
                            "categorie",
                            "Motivation",
                            "question",
                            "Pourquoi souhaitez-vous "
                                    + "rejoindre notre équipe ?"
                    ),
                    Map.of(
                            "categorie",
                            "Technique",
                            "question",
                            "Parlez-nous d'un projet technique "
                                    + "que vous avez mené à bien."
                    ),
                    Map.of(
                            "categorie",
                            "Savoir-être",
                            "question",
                            "Comment gérez-vous le travail "
                                    + "sous pression ?"
                    )
            );
        }

        return Map.of("questions", questions);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, String>> groqInterviewQuestions(
            Candidate c
    ) {

        String cvExtrait =
                (c.getCvText() != null
                        && !c.getCvText().isBlank())
                        ?
                        " En te basant sur le contenu de son CV: "
                                + c.getCvText()
                        : "";

        String prompt =
                "Génère 4 questions d'entretien pertinentes "
                        + "pour un candidat postulant comme "
                        + c.getJobTitre()
                        + " (département "
                        + c.getDepartement()
                        + ")."
                        + cvExtrait
                        + " Réponds STRICTEMENT en JSON: "
                        + "{\"questions\":["
                        + "{\"categorie\":\"...\","
                        + "\"question\":\"...\"}]}.";
        try {

            Map<String, Object> ai =
                    groq.chatJson(
                            "Tu es un recruteur RH. "
                                    + "Réponds uniquement en JSON valide.",
                            prompt,
                            Map.class
                    );

            if (ai != null
                    && ai.get("questions") instanceof List) {

                return (List<Map<String, String>>)
                        ai.get("questions");
            }

        } catch (Exception ignored) {
        }

        return null;
    }

    @Transactional
    public EmailDraftDTO emailDraft(
            Long id,
            String type,
            String dateDebut
    ) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        String nom =
                c.getPrenom() + " " + c.getNom();

        EmailDraftDTO ai =
                groqEmailDraft(c, type, dateDebut);

        if (ai != null) {
            return ai;
        }

        String objet;
        String corps;

        switch (type) {

            case "REFUS" -> {
                objet =
                        "Suite à votre candidature - "
                                + c.getJobTitre();

                corps =
                        "Bonjour "
                                + nom
                                + ",\n\nNous vous remercions "
                                + "pour votre intérêt pour le poste de "
                                + c.getJobTitre()
                                + ". Après étude de votre candidature, "
                                + "nous ne pouvons pas donner suite "
                                + "positive à cette demande. "
                                + "Nous vous souhaitons bonne chance "
                                + "dans vos recherches.\n\n"
                                + "Cordialement,\nL'équipe RH "
                                + companyName;
            }

            case "RELANCE" -> {
                objet =
                        "Relance - "
                                + c.getJobTitre();

                corps =
                        "Bonjour "
                                + nom
                                + ",\n\nNous revenons vers vous "
                                + "concernant le poste de "
                                + c.getJobTitre()
                                + ". Pourriez-vous nous confirmer "
                                + "votre disponibilité pour la suite "
                                + "du processus ?\n\n"
                                + "Cordialement,\nL'équipe RH "
                                + companyName;
            }

            case "OFFRE" -> {
                objet =
                        "Votre offre d'embauche - "
                                + c.getJobTitre();

                corps =
                        "Bonjour "
                                + nom
                                + ",\n\nNous avons le plaisir "
                                + "de vous proposer le poste de "
                                + c.getJobTitre()
                                + (
                                dateDebut != null
                                        ? " avec une prise de poste "
                                        + "prévue le "
                                        + dateDebut
                                        + "."
                                        : "."
                        )
                                + "\n\nNous vous invitons à nous "
                                + "confirmer votre acceptation.\n\n"
                                + "Cordialement,\nL'équipe RH "
                                + companyName;
            }

            default -> {
                objet =
                        "Votre candidature - "
                                + c.getJobTitre();

                corps =
                        "Bonjour "
                                + nom
                                + ",\n\nSuite à votre candidature "
                                + "pour le poste de "
                                + c.getJobTitre()
                                + ", nous revenons vers vous "
                                + "prochainement.\n\n"
                                + "Cordialement,\nL'équipe RH "
                                + companyName;
            }
        }

        return EmailDraftDTO.builder()
                .objet(objet)
                .corps(corps)
                .build();
    }

    private EmailDraftDTO groqEmailDraft(
            Candidate c,
            String type,
            String dateDebut
    ) {

        String coordonnees =
                "Nom de l'entreprise : "
                        + companyName
                        + (
                        companyAddress.isBlank()
                                ? ""
                                : " | Adresse : "
                                + companyAddress
                )
                        + (
                        companyPhone.isBlank()
                                ? ""
                                : " | Téléphone : "
                                + companyPhone
                )
                        + ".";

        String prompt =
                "Rédige un e-mail en français de type "
                        + type
                        + " destiné au candidat "
                        + c.getPrenom()
                        + " "
                        + c.getNom()
                        + " pour le poste "
                        + c.getJobTitre()
                        + (
                        dateDebut != null
                                ? " (début le "
                                + dateDebut
                                + ")"
                                : ""
                )
                        + ". "
                        + coordonnees
                        + " Utilise UNIQUEMENT ces coordonnées "
                        + "si tu as besoin de mentionner "
                        + "l'entreprise, son adresse ou son téléphone."
                        + " N'invente aucune autre coordonnée "
                        + "(pas d'autre adresse, pas d'autre téléphone, "
                        + "pas de nom de recruteur)"
                        + " et n'utilise aucun placeholder "
                        + "du type [Nom du recruteur] "
                        + "ou [Nom de l'entreprise]."
                        + " Termine par 'Cordialement,\\nL'équipe RH "
                        + companyName
                        + "' sans autre signature."
                        + " Réponds STRICTEMENT en JSON: "
                        + "{\"objet\":\"...\",\"corps\":\"...\"} "
                        + "(corps en texte simple).";

        return groq.chatJson(
                "Tu es un recruteur RH. "
                        + "Réponds uniquement en JSON valide, "
                        + "sans inventer de coordonnées autres "
                        + "que celles fournies.",
                prompt,
                EmailDraftDTO.class
        );
    }

    @Transactional
    public Map<String, Object> sendEmail(
            Long id,
            String type,
            String objet,
            String corps
    ) {

        Candidate c = candidateRepo.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Candidat introuvable"));

        if (c.getEmail() == null || c.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "Le candidat ne possède pas d'adresse email"
            );
        }

        Map<String, Object> emailResult =
                emailService.send(
                        c.getEmail(),
                        objet,
                        corps
                );

        /*
         * EmailService peut retourner Map.of(...),
         * donc une map immutable.
         *
         * On crée une copie mutable avant d'ajouter
         * notre champ "statut".
         */
        Map<String, Object> res =
                new HashMap<>(emailResult);

        if (Boolean.TRUE.equals(res.get("sent"))) {
            res.put("statut", "ENVOYE");
        } else {
            res.put("statut", "ECHEC");
        }

        return res;
    }

    @Transactional
    public Map<String, Object> batchScore() {

        List<Candidate> all =
                candidateRepo.findAll();

        int scored = 0;
        int errors = 0;

        List<Long> updatedIds =
                new ArrayList<>();

        for (Candidate c : all) {

            try {

                CvScoreResultDTO r =
                        groqScoreCv(c);

                if (r != null) {

                    c.setScore(r.getScore());
                    candidateRepo.save(c);

                    scored++;
                    updatedIds.add(c.getCandidatId());
                }

            } catch (Exception e) {
                errors++;
            }
        }

        return Map.of(
                "scored",
                scored,
                "errors",
                errors,
                "total",
                all.size(),
                "updatedIds",
                updatedIds
        );
    }

    @Transactional
    public Map<String, Object> autoShortlist(
            Double threshold
    ) {

        double t =
                threshold != null
                        ? threshold
                        : 70.0;

        List<Candidate> all =
                candidateRepo.findAll();

        int promoted = 0;

        for (Candidate c : all) {

            if (c.getScore() != null
                    && c.getScore() >= t
                    && !Boolean.TRUE.equals(
                    c.getShortliste()
            )) {

                c.setShortliste(true);
                candidateRepo.save(c);
                promoted++;
            }
        }

        return Map.of(
                "promoted",
                promoted,
                "threshold",
                t
        );
    }

    /* ═══════════════════════════════════════════════════════
       ENTRETIENS
       ═══════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviews() {

        return interviewRepo.findAll().stream()
                .sorted(Comparator.comparing(
                        Interview::getCreatedAt,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                ))
                .map(this::toInterviewDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewDTO createInterview(
            Map<String, Object> body
    ) {

        Long candidatId =
                toLong(body.get("candidatId"));

        Candidate c =
                candidatId != null
                        ? candidateRepo.findById(candidatId)
                        .orElse(null)
                        : null;

        Long jobId =
                toLong(body.get("jobId"));

        Job job =
                jobId != null
                        ? jobRepo.findById(jobId)
                        .orElse(null)
                        : null;

        /*
         * Création de l'entretien.
         */
        Interview i = Interview.builder()
                .candidatId(candidatId)
                .candidatNom(
                        str(body.get("candidatNom")) != null
                                ? str(body.get("candidatNom"))
                                : (
                                c != null
                                        ? c.getPrenom()
                                        + " "
                                        + c.getNom()
                                        : null
                        )
                )
                .candidatPrenom(
                        str(body.get("candidatPrenom")) != null
                                ? str(body.get("candidatPrenom"))
                                : (
                                c != null
                                        ? c.getPrenom()
                                        : null
                        )
                )
                .candidatPhoto(
                        str(body.get("candidatPhoto"))
                )
                .jobId(jobId)
                .jobTitre(
                        str(body.get("jobTitre")) != null
                                ? str(body.get("jobTitre"))
                                : (
                                job != null
                                        ? job.getTitre()
                                        : null
                        )
                )
                .departement(
                        str(body.get("departement")) != null
                                ? str(body.get("departement"))
                                : (
                                job != null
                                        ? job.getDepartement()
                                        : null
                        )
                )
                .type(str(body.get("type")))
                .statut(
                        body.get("statut") != null
                                ? str(body.get("statut"))
                                : "PLANIFIE"
                )
                .decision("EN_ATTENTE")
                .date(str(body.get("date")))
                .heureDebut(
                        str(body.get("heureDebut"))
                )
                .heureFin(
                        str(body.get("heureFin"))
                )
                .lieu(str(body.get("lieu")))
                .lienVisio(
                        str(body.get("lienVisio"))
                )
                .intervieweur(
                        str(body.get("intervieweur"))
                )
                .intervieweurPhoto(
                        str(body.get("intervieweurPhoto"))
                )
                .build();

        Interview saved =
                interviewRepo.save(i);

        /*
         * IMPORTANT :
         * Oracle CK_CAND_STATUT n'autorise pas "INTERVIEWE".
         *
         * Lorsqu'un entretien est créé, le candidat passe
         * au statut ENTRETIEN.
         */
        if (c != null
                && !"ENTRETIEN".equals(c.getStatut())) {

            c.setStatut("ENTRETIEN");
            candidateRepo.save(c);
        }

        return toInterviewDTO(saved);
    }

    @Transactional
    public InterviewDTO updateInterviewStatut(
            Long id,
            String statut
    ) {

        Interview i =
                interviewRepo.findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Entretien introuvable"
                                ));

        if (statut == null || statut.isBlank()) {
            throw new IllegalArgumentException(
                    "Le statut de l'entretien est obligatoire"
            );
        }

        i.setStatut(
                statut.trim().toUpperCase()
        );

        return toInterviewDTO(
                interviewRepo.save(i)
        );
    }

    @Transactional
    public InterviewDTO saveDecision(
            Long id,
            Map<String, Object> body
    ) {

        Interview i =
                interviewRepo.findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Entretien introuvable"
                                ));

        String decision =
                str(body.get("decision"));

        if (decision != null) {
            decision = decision.trim().toUpperCase();
            i.setDecision(decision);
        }

        if (body.get("noteGlobale") != null) {
            i.setNoteGlobale(
                    toDouble(body.get("noteGlobale"))
            );
        }

        if (body.get("commentaire") != null) {
            i.setCommentaire(
                    str(body.get("commentaire"))
            );
        }

        if (body.get("dateDebut") != null) {
            i.setDate(
                    str(body.get("dateDebut"))
            );
        }

        Interview saved =
                interviewRepo.save(i);

        /*
         * Synchronisation du statut candidat avec
         * les valeurs réellement autorisées par Oracle.
         */
        if (i.getCandidatId() != null) {

            Candidate c =
                    candidateRepo.findById(
                            i.getCandidatId()
                    ).orElse(null);

            if (c != null && decision != null) {

                if ("RETENU".equals(decision)
                        || "ACCEPTE".equals(decision)) {

                    c.setStatut("ACCEPTE");

                } else if ("REJETE".equals(decision)
                        || "REFUSE".equals(decision)) {

                    c.setStatut("REFUSE");
                }

                candidateRepo.save(c);
            }
        }

        return toInterviewDTO(saved);
    }

    @Transactional
    public Map<String, Object> sendInvitation(
            Long id
    ) {

        Interview i =
                interviewRepo.findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Entretien introuvable"
                                ));

        String to = null;

        if (i.getCandidatId() != null) {

            Candidate c =
                    candidateRepo.findById(
                            i.getCandidatId()
                    ).orElse(null);

            if (c != null) {
                to = c.getEmail();
            }
        }

        String date =
                (i.getDate() != null
                        ? i.getDate()
                        : "")
                        + " "
                        + (
                        i.getHeureDebut() != null
                                ? i.getHeureDebut()
                                : ""
                );

        String corps =
                "Bonjour,\n\n"
                        + "Vous êtes convié(e) à un entretien ("
                        + i.getType()
                        + ") pour le poste de "
                        + i.getJobTitre()
                        + " le "
                        + date.trim()
                        + (
                        i.getLieu() != null
                                ? " au " + i.getLieu()
                                : ""
                )
                        + (
                        i.getLienVisio() != null
                                ? " — lien : "
                                + i.getLienVisio()
                                : ""
                )
                        + ".\n\n"
                        + "Cordialement,\n"
                        + "L'équipe RH "
                        + companyName;

        return emailService.send(
                to,
                "Invitation à un entretien - "
                        + i.getJobTitre(),
                corps
        );
    }

    /* ═══════════════════════════════════════════════════════
       PORTAIL PUBLIC
       ═══════════════════════════════════════════════════════ */

    @Transactional(readOnly = true)
    public List<JobDTO> getPublicJobs() {

        return jobRepo.findAll().stream()
                .filter(j ->
                        !"FERME".equals(j.getStatut()))
                .sorted(Comparator.comparing(
                        Job::getDatePublication,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                ))
                .map(this::toJobDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScreeningBundleDTO getPublicScreening(
            Long jobId
    ) {

        return getScreening(jobId);
    }

    @Transactional
    public Map<String, Object> validateKiller(
            Long jobId,
            Map<String, String> answers
    ) {

        List<JobKillerQuestion> killers =
                killerRepo.findByJobJobId(jobId);

        for (JobKillerQuestion q : killers) {

            String rep =
                    answers.get(
                            String.valueOf(
                                    q.getKillerQId()
                            )
                    );

            String expected =
                    q.getExpectedAnswer() != null
                            ? q.getExpectedAnswer()
                            .trim()
                            .toLowerCase()
                            : "";

            String given =
                    rep != null
                            ? rep.trim().toLowerCase()
                            : "";

            if (!expected.equals(given)) {

                return Map.of(
                        "passed",
                        false,
                        "failedQuestion",
                        q.getQuestion()
                );
            }
        }

        return Map.of(
                "passed",
                true
        );
    }

    @Transactional
    public CandidateDTO updateEmail(
            Long id,
            String email
    ) {

        Candidate candidate =
                candidateRepo.findById(id)
                        .orElseThrow(() ->
                                new NoSuchElementException(
                                        "Candidat introuvable"
                                ));

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "L'adresse email est obligatoire"
            );
        }

        candidate.setEmail(
                email.trim()
        );

        return toCandidateDTO(
                candidateRepo.save(candidate)
        );
    }

    @Transactional
    public void apply(
            Map<String, String> fields,
            MultipartFile cv,
            String killerAnswersJson,
            String screeningAnswersJson
    ) {

        Long jobId =
                toLong(fields.get("jobId"));

        Job job =
                jobId != null
                        ? jobRepo.findById(jobId)
                        .orElse(null)
                        : null;

        Candidate c =
                Candidate.builder()
                        .nom(str(fields.get("nom")))
                        .prenom(str(fields.get("prenom")))
                        .email(str(fields.get("email")))
                        .telephone(
                                str(fields.get("telephone"))
                        )
                        .jobId(jobId)
                        .jobTitre(
                                job != null
                                        ? job.getTitre()
                                        : str(fields.get("jobTitre"))
                        )
                        .departement(
                                job != null
                                        ? job.getDepartement()
                                        : str(fields.get("departement"))
                        )
                        .statut("NOUVEAU")
                        .datePostulation(
                                LocalDateTime.now()
                        )
                        .experience(
                                toInt(
                                        fields.get("experience"),
                                        0
                                )
                        )
                        .competencesJson(
                                toJsonList(
                                        splitCsv(
                                                fields.get(
                                                        "competences"
                                                )
                                        )
                                )
                        )
                        .linkedin(
                                str(fields.get("linkedin"))
                        )
                        .localisation(
                                str(fields.get("localisation"))
                        )
                        .killerAnswersJson(
                                killerAnswersJson
                        )
                        .screeningAnswersJson(
                                screeningAnswersJson
                        )
                        .build();

        Candidate saved =
                candidateRepo.save(c);

        if (cv != null && !cv.isEmpty()) {

            try {

                File dir =
                        new File(cvUploadDir);

                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String ext = "";

                String original =
                        cv.getOriginalFilename();

                if (original != null
                        && original.contains(".")) {

                    ext =
                            original.substring(
                                    original.lastIndexOf('.')
                            );
                }

                String filename =
                        "cv_"
                                + saved.getCandidatId()
                                + "_"
                                + System.currentTimeMillis()
                                + ext;

                cv.transferTo(
                        new File(
                                dir,
                                filename
                        )
                );

                saved.setCvUrl(
                        "/cv/" + filename
                );

                String extracted =
                        cvTextExtractor.extract(
                                new File(
                                        dir,
                                        filename
                                )
                        );

                if (extracted != null) {
                    saved.setCvText(extracted);
                }

                candidateRepo.save(saved);

            } catch (Exception e) {

                log.warn(
                        "[RecrutementService] "
                                + "Échec upload CV public: {}",
                        e.getMessage()
                );
            }
        }
    }

    /* ═══════════════════════════════════════════════════════
       MAPPERS
       ═══════════════════════════════════════════════════════ */

    private DemandeRecrutementDTO toDemandeDTO(
            RecrutementDemande d
    ) {

        return DemandeRecrutementDTO.builder()
                .id(d.getDemandeId())
                .chefId(d.getChefId())
                .chefNom(d.getChefNom())
                .departement(d.getDepartement())
                .titrePoste(d.getTitrePoste())
                .role(d.getRole())
                .nombrePostes(d.getNombrePostes())
                .typeContrat(d.getTypeContrat())
                .justification(d.getJustification())
                .urgence(d.getUrgence())
                .statut(d.getStatut())
                .dateDemande(d.getDateDemande())
                .commentaireRh(d.getCommentaireRh())
                .traiteePar(d.getTraiteePar())
                .dateTraitement(d.getDateTraitement())
                .jobId(d.getJobId())
                .build();
    }

    private JobDTO toJobDTO(Job j) {

        return JobDTO.builder()
                .id(j.getJobId())
                .titre(j.getTitre())
                .statut(j.getStatut())
                .datePublication(
                        j.getDatePublication() != null
                                ? j.getDatePublication().toLocalDate()
                                : null
                )
                .role(j.getRole())
                .postes(j.getPostes())
                .departement(j.getDepartement())
                .typeContrat(j.getTypeContrat())
                .description(j.getDescription())
                .lieu(j.getLieu())
                .build();
    }

    private CandidateDTO toCandidateDTO(
            Candidate c
    ) {

        return CandidateDTO.builder()
                .id(c.getCandidatId())
                .nom(c.getNom())
                .prenom(c.getPrenom())
                .email(c.getEmail())
                .telephone(c.getTelephone())
                .photo(c.getPhoto())
                .jobId(c.getJobId())
                .jobTitre(c.getJobTitre())
                .departement(c.getDepartement())
                .statut(c.getStatut())
                .datePostulation(
                        c.getDatePostulation()
                )
                .experience(c.getExperience())
                .competences(
                        parseList(
                                c.getCompetencesJson()
                        )
                )
                .shortliste(
                        Boolean.TRUE.equals(
                                c.getShortliste()
                        )
                )
                .cvUrl(c.getCvUrl())
                .linkedin(c.getLinkedin())
                .localisation(c.getLocalisation())
                .noteRecruteur(
                        c.getNoteRecruteur()
                )
                .score(c.getScore())
                .screeningScore(
                        c.getScreeningScore()
                )
                .build();
    }

    private InterviewDTO toInterviewDTO(
            Interview i
    ) {

        return InterviewDTO.builder()
                .id(i.getInterviewId())
                .candidatId(i.getCandidatId())
                .candidatNom(i.getCandidatNom())
                .candidatPrenom(
                        i.getCandidatPrenom()
                )
                .candidatPhoto(
                        i.getCandidatPhoto()
                )
                .jobId(i.getJobId())
                .jobTitre(i.getJobTitre())
                .departement(
                        i.getDepartement()
                )
                .type(i.getType())
                .statut(i.getStatut())
                .decision(i.getDecision())
                .date(i.getDate())
                .heureDebut(
                        i.getHeureDebut()
                )
                .heureFin(
                        i.getHeureFin()
                )
                .lieu(i.getLieu())
                .lienVisio(
                        i.getLienVisio()
                )
                .intervieweur(
                        i.getIntervieweur()
                )
                .intervieweurPhoto(
                        i.getIntervieweurPhoto()
                )
                .noteGlobale(
                        i.getNoteGlobale()
                )
                .commentaire(
                        i.getCommentaire()
                )
                .build();
    }

    private KillerQuestionDTO toKillerDTO(
            JobKillerQuestion q
    ) {

        return KillerQuestionDTO.builder()
                .id(q.getKillerQId())
                .jobId(
                        q.getJob() != null
                                ? q.getJob().getJobId()
                                : null
                )
                .question(q.getQuestion())
                .expectedAnswer(
                        q.getExpectedAnswer()
                )
                .displayOrder(
                        q.getDisplayOrder()
                )
                .build();
    }

    private ScreeningQuestionDTO toScreeningDTO(
            JobScreeningQuestion q
    ) {

        return ScreeningQuestionDTO.builder()
                .id(q.getScreeningQId())
                .jobId(
                        q.getJob() != null
                                ? q.getJob().getJobId()
                                : null
                )
                .question(q.getQuestion())
                .type(q.getType())
                .options(
                        parseList(
                                q.getOptionsJson()
                        )
                )
                .correctAnswer(
                        q.getCorrectAnswer()
                )
                .weight(q.getWeight())
                .displayOrder(
                        q.getDisplayOrder()
                )
                .build();
    }

    /* ═══════════════════════════════════════════════════════
       HELPERS
       ═══════════════════════════════════════════════════════ */

    private List<String> parseList(
            String json
    ) {

        if (json == null || json.isBlank()) {
            return List.of();
        }

        try {

            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {}
            );

        } catch (Exception e) {

            return List.of();
        }
    }

    private String toJsonList(
            List<String> list
    ) {

        if (list == null) {
            return null;
        }

        try {

            return objectMapper.writeValueAsString(
                    list
            );

        } catch (Exception e) {

            return null;
        }
    }

    private List<String> toStrList(
            Object o
    ) {

        if (o == null) {
            return List.of();
        }

        if (o instanceof List) {

            List<?> l = (List<?>) o;

            return l.stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList());
        }

        return splitCsv(o.toString());
    }

    private List<String> splitCsv(
            String s
    ) {

        if (s == null || s.isBlank()) {
            return List.of();
        }

        return Arrays.stream(
                        s.split(",")
                )
                .map(String::trim)
                .filter(
                        t -> !t.isEmpty()
                )
                .collect(Collectors.toList());
    }

    private static String str(
            Object o
    ) {

        return o != null
                ? o.toString()
                : null;
    }

    private static Integer toInt(
            Object o,
            int def
    ) {

        if (o == null) {
            return def;
        }

        if (o instanceof Number n) {
            return n.intValue();
        }

        try {

            return Integer.parseInt(
                    o.toString()
            );

        } catch (Exception e) {

            return def;
        }
    }

    private static Long toLong(
            Object o
    ) {

        if (o == null) {
            return null;
        }

        if (o instanceof Number n) {
            return n.longValue();
        }

        try {

            return Long.parseLong(
                    o.toString()
            );

        } catch (Exception e) {

            return null;
        }
    }

    private static Double toDouble(
            Object o
    ) {

        if (o == null) {
            return null;
        }

        if (o instanceof Number n) {
            return n.doubleValue();
        }

        try {

            return Double.parseDouble(
                    o.toString()
            );

        } catch (Exception e) {

            return null;
        }
    }
}