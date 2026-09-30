package com.gerai.projetsservice.service;

import com.gerai.projetsservice.dto.EmployeDTO;
import com.gerai.projetsservice.dto.NotificationEvent;
import com.gerai.projetsservice.model.Project;
import com.gerai.projetsservice.model.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service centralisé pour toutes les notifications liées aux projets.
 *
 * Événements couverts :
 *   1. Membre ajouté        → notification à l'employé ajouté
 *   2. Tâche assignée       → notification à l'employé assigné
 *   3. Tâche terminée       → notification au chef du projet
 *   4. Projet terminé       → notification à tous les membres
 *   5. Projet modifié       → notification aux membres actifs
 *   6. Projet créé          → notification broadcast ADMIN
 *   7. Projet en pause/retard → notification broadcast ADMIN
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectNotificationService {

    private final ProjectEventProducer producer;
    private final EmployeService       employeService;

    private static final String SOURCE   = "PROJET-SERVICE";
    private static final String REF_TYPE = "PROJET";
    private static final String TASK_REF = "TACHE";

    private String nomComplet(EmployeDTO emp, String fallback) {
        if (emp == null) return fallback;
        if (emp.getNomComplet() != null && !emp.getNomComplet().isBlank()) return emp.getNomComplet();
        String full = ((emp.getPrenom() != null ? emp.getPrenom() : "") + " "
                + (emp.getNom()    != null ? emp.getNom()    : "")).trim();
        return full.isEmpty() ? fallback : full;
    }

    /* ═══════════════════════════════════════════════════════
       1. MEMBRE AJOUTÉ AU PROJET → employé notifié
       ═══════════════════════════════════════════════════════ */

    public void notifierMembreAjoute(Project project, Long employeeId, Long chefId) {
        EmployeDTO emp  = employeService.getEmployeById(employeeId);
        EmployeDTO chef = employeService.getEmployeById(chefId);
        String chefNom  = nomComplet(chef, "votre chef");

        emit(
                employeeId,
                emp != null ? emp.getEmail() : null,
                "INFO",
                "Vous avez été ajouté à un projet",
                chefNom + " vous a ajouté au projet « " + project.getName() + " ». "
                        + "Connectez-vous pour consulter les détails et vos tâches.",
                project.getProjectId(),
                chefId,
                REF_TYPE,
                "/employe/projets"
        );
    }

    /* ═══════════════════════════════════════════════════════
       2. TÂCHE ASSIGNÉE → employé assigné notifié
       ═══════════════════════════════════════════════════════ */

    public void notifierTacheAssignee(Task task, Long chefId) {
        if (task.getAssignedTo() == null) return;

        EmployeDTO emp  = employeService.getEmployeById(task.getAssignedTo());
        EmployeDTO chef = employeService.getEmployeById(chefId);
        String chefNom  = nomComplet(chef, "votre chef");
        String echeance = task.getDueDate() != null
                ? " (échéance : " + task.getDueDate() + ")" : "";

        emit(
                task.getAssignedTo(),
                emp != null ? emp.getEmail() : null,
                "NOUVELLE_DEMANDE",
                "Nouvelle tâche assignée",
                chefNom + " vous a assigné la tâche « " + task.getTitle() + " » "
                        + "dans le projet « " + task.getProject().getName() + " »" + echeance + ".",
                task.getProject().getProjectId(),
                chefId,
                TASK_REF,
                "/employe/taches"
        );
    }

    /* ═══════════════════════════════════════════════════════
       3. TÂCHE TERMINÉE → chef notifié
       ═══════════════════════════════════════════════════════ */

    public void notifierTacheTerminee(Task task, Long employeeId) {
        Long chefId = task.getProject().getCreatedBy();
        EmployeDTO emp  = employeService.getEmployeById(employeeId);
        String empNom   = nomComplet(emp, "Un employé");

        emit(
                chefId,
                null, // le chef reçoit la notif in-app, email optionnel
                "DEMANDE_APPROUVEE",
                "Tâche terminée",
                empNom + " a marqué la tâche « " + task.getTitle() + " » comme terminée "
                        + "dans le projet « " + task.getProject().getName() + " ».",
                task.getProject().getProjectId(),
                employeeId,
                TASK_REF,
                "/chef/projets"
        );
    }

    /* ═══════════════════════════════════════════════════════
       4. PROJET TERMINÉ → tous les membres notifiés
       ═══════════════════════════════════════════════════════ */

    public void notifierProjetTermine(Project project, Long chefId,
                                      java.util.List<Long> membreIds) {
        String message = "Le projet « " + project.getName() + " » est terminé. "
                + "Félicitations à toute l'équipe !";

        for (Long empId : membreIds) {
            if (empId.equals(chefId)) continue; // le chef reçoit une notif séparée
            EmployeDTO emp = employeService.getEmployeById(empId);
            emit(empId, emp != null ? emp.getEmail() : null,
                    "DEMANDE_APPROUVEE", "Projet terminé", message,
                    project.getProjectId(), chefId, REF_TYPE, "/employe/projets");
        }

        // Notif au chef
        EmployeDTO chef = employeService.getEmployeById(chefId);
        emit(chefId, chef != null ? chef.getEmail() : null,
                "DEMANDE_APPROUVEE", "Projet terminé",
                "Votre projet « " + project.getName() + " » est marqué comme terminé.",
                project.getProjectId(), chefId, REF_TYPE, "/chef/projets");

        // Notif ADMIN
        emit(null, "ADMIN", null, "INFO", "Projet terminé",
                "Le projet « " + project.getName() + " » a été marqué comme terminé.",
                project.getProjectId(), chefId, REF_TYPE, "/admin/projets");
    }

    /* ═══════════════════════════════════════════════════════
       5. PROJET MODIFIÉ → membres notifiés
       ═══════════════════════════════════════════════════════ */

    public void notifierProjetModifie(Project project, Long chefId,
                                      java.util.List<Long> membreIds) {
        String message = "Le projet « " + project.getName() + " » a été mis à jour "
                + "(statut : " + project.getStatus() + ", avancement : "
                + project.getProgressPct() + "%).";

        for (Long empId : membreIds) {
            if (empId.equals(chefId)) continue;
            EmployeDTO emp = employeService.getEmployeById(empId);
            emit(empId, emp != null ? emp.getEmail() : null,
                    "INFO", "Projet mis à jour", message,
                    project.getProjectId(), chefId, REF_TYPE, "/employe/projets");
        }

        // Statuts jugés critiques pour l'admin
        if ("EN_PAUSE".equals(project.getStatus()) || "EN_RETARD".equals(project.getStatus())) {
            notifierAdminProjetBloque(project, chefId);
        }
    }

    /* ═══════════════════════════════════════════════════════
       6. PROJET CRÉÉ → notification broadcast ADMIN
       ═══════════════════════════════════════════════════════ */

    public void notifierAdminProjetCree(Project project, Long chefId) {
        EmployeDTO chef = employeService.getEmployeById(chefId);
        String chefNom  = nomComplet(chef, "Un chef de projet");

        emit(
                null,
                "ADMIN",
                null,
                "INFO",
                "Nouveau projet créé",
                chefNom + " a créé le projet « " + project.getName() + " ».",
                project.getProjectId(),
                chefId,
                REF_TYPE,
                "/admin/projets"
        );
    }

    /* ═══════════════════════════════════════════════════════
       7. PROJET EN PAUSE / EN RETARD → notification broadcast ADMIN
       ═══════════════════════════════════════════════════════ */

    public void notifierAdminProjetBloque(Project project, Long chefId) {
        String libelle = "EN_RETARD".equals(project.getStatus()) ? "en retard" : "en pause";
        emit(
                null,
                "ADMIN",
                null,
                "RAPPEL",
                "Projet " + libelle,
                "Le projet « " + project.getName() + " » est passé " + libelle + ".",
                project.getProjectId(),
                chefId,
                REF_TYPE,
                "/admin/projets"
        );
    }

    /* ═══════════════════════════════════════════════════════
       HELPERS CENTRAUX — construisent et envoient l'événement
       ═══════════════════════════════════════════════════════ */

    /** Notification personnelle (employeeId renseigné, role=null). */
    private void emit(Long recipientId, String email,
                      String type, String title, String content,
                      Long projectId, Long triggeredBy, String refType,
                      String actionUrl) {
        emit(recipientId, null, email, type, title, content, projectId, triggeredBy, refType, actionUrl);
    }

    /** Notification personnelle OU broadcast par rôle (employeeId=null, role renseigné). */
    private void emit(Long recipientId, String role, String email,
                      String type, String title, String content,
                      Long projectId, Long triggeredBy, String refType,
                      String actionUrl) {
        NotificationEvent event = NotificationEvent.builder()
                .employeeId(recipientId)
                .role(role)
                .email(email)
                .type(type)
                .title(title)
                .content(content)
                .referenceType(refType)
                .referenceId(projectId != null ? projectId.toString() : null)
                .actionUrl(actionUrl)
                .triggeredBy(triggeredBy)
                .sourceService(SOURCE)
                .sendEmail(email != null)
                .build();

        producer.emit(event);
    }
}