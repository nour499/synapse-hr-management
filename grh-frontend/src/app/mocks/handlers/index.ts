import { demandesHandlers } from './demandes.handlers';
import { chatHandlers } from './chat.handlers';
import { equipeHandlers } from './equipe-chef.handlers';
import { TachesHandlers } from './taches-chef.handlers';
import { ProjetsHandlers } from './projets-chef.handlers';
import { notificationsHandlers } from './notifications.handlers';
import { profilEmployeHandlers } from './employe-profile.handlers';
import { tachesHandlers } from './taches-employe.handlers';
import { projetsEmployeHandlers } from './projets-employe.handlers';
import { congesHandlers } from './conges.handlers';
import { employeHandlers } from './employe.handlers';
import { actifHandlers }   from './actif.handlers';
import { departHandlers }     from './depart.handlers';
import { congeAdminHandlers }      from './conge-admin.handlers';
import { soldeCongeAdminHandlers } from './solde-conge-admin.handlers';
import { departementHandlers }     from './departement.handlers';
import { jobHandlers }             from './job.handlers';
import { demandeRecrutementHandlers } from './demande-recrutement.handlers';
import { candidateHandlers }          from './candidate.handlers';
import { interviewHandlers }          from './interview.handlers';
import { referentielHandlers }        from './referentiel.handlers';
import { keycloakProvisionHandlers }  from './keycloak-provision.handlers';
import { evaluationHandlers }          from './evaluation.handlers';

export const allHandlers = [
    // Modules métier
    ...equipeHandlers,
    ...chatHandlers,
    ...demandesHandlers,
    ...TachesHandlers,
    ...ProjetsHandlers,
    ...notificationsHandlers,
    ...profilEmployeHandlers,
    ...tachesHandlers,
    ...projetsEmployeHandlers,
    ...congesHandlers,
    ...employeHandlers,
    ...actifHandlers,
    ...departHandlers,
    ...congeAdminHandlers,
    ...soldeCongeAdminHandlers,
    ...departementHandlers,
    ...jobHandlers,
    ...demandeRecrutementHandlers,
    ...candidateHandlers,
    ...interviewHandlers,
    ...referentielHandlers,
    ...keycloakProvisionHandlers,
    ...evaluationHandlers
];