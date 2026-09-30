import {
    SoldeConge,
    DemandeConge,
    StatistiquesConges,
    TeamAbsence
} from 'src/app/gerai/models/conge.model';

/* ══════════════════════════════════════════════════════════════
   📊 DONNÉES MOCK - CONGÉS (emp-001)
   ══════════════════════════════════════════════════════════════ */

const ANNEE_COURANTE = new Date().getFullYear();

/* ──────────────────────────────────────────────────────────
   💰 SOLDE DE CONGÉS
   ────────────────────────────────────────────────────────── */

export let solde: SoldeConge = {
    employeId: 'emp-001',
    annuel: 18,           // Restant
    annuelTotal: 25,      // Total annuel
    maladie: 5,           // Restant
    maladieTotal: 10,     // Total annuel
    rtt: 7,               // Restant
    rttTotal: 11,         // Total annuel
    pris: 15,             // Total déjà pris
    anneeEnCours: ANNEE_COURANTE
};

/* ──────────────────────────────────────────────────────────
   📋 DEMANDES DE CONGÉS
   ────────────────────────────────────────────────────────── */

export let demandes: DemandeConge[] = [
    {
        id: 1,
        employeId: 'emp-001',
        type: 'ANNUEL',
        dateDebut: '2024-04-10',
        dateFin: '2024-04-19',
        jours: 10,
        joursOuvres: 8,
        statut: 'APPROUVE',
        motif: 'Vacances familiales',
        dateDemande: '2024-03-05',
        dateReponse: '2024-03-06',
        validePar: 'mgr-001',
        validateurNom: 'Stéphane Manager'
    },
    {
        id: 2,
        employeId: 'emp-001',
        type: 'RTT',
        dateDebut: '2024-05-20',
        dateFin: '2024-05-20',
        jours: 1,
        joursOuvres: 1,
        statut: 'APPROUVE',
        motif: 'Rendez-vous personnel',
        dateDemande: '2024-05-10',
        dateReponse: '2024-05-11',
        validePar: 'mgr-001',
        validateurNom: 'Stéphane Manager'
    },
    {
        id: 3,
        employeId: 'emp-001',
        type: 'ANNUEL',
        dateDebut: '2024-07-15',
        dateFin: '2024-07-26',
        jours: 12,
        joursOuvres: 10,
        statut: 'EN_ATTENTE',
        motif: 'Vacances d\'été',
        dateDemande: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
        id: 4,
        employeId: 'emp-001',
        type: 'MALADIE',
        dateDebut: '2024-02-05',
        dateFin: '2024-02-07',
        jours: 3,
        joursOuvres: 3,
        statut: 'APPROUVE',
        motif: 'Grippe',
        dateDemande: '2024-02-05',
        dateReponse: '2024-02-05',
        validePar: 'mgr-001',
        validateurNom: 'Stéphane Manager'
    },
    {
        id: 5,
        employeId: 'emp-001',
        type: 'RTT',
        dateDebut: '2024-03-22',
        dateFin: '2024-03-22',
        jours: 1,
        joursOuvres: 1,
        statut: 'REJETE',
        motif: 'Pont du week-end',
        commentaireRefus: 'Période de forte activité, merci de reporter',
        dateDemande: '2024-03-15',
        dateReponse: '2024-03-16',
        validePar: 'mgr-001',
        validateurNom: 'Stéphane Manager'
    }
];

export let nextDemandeId = 6;

/* ──────────────────────────────────────────────────────────
   👥 ABSENCES ÉQUIPE (collègues, visibles par tous)
   ────────────────────────────────────────────────────────── */
export const TEAM_ABSENCES: TeamAbsence[] = [
    { employeId: 'emp-002', nom: 'Benali',   prenom: 'Yasmine', type: 'ANNUEL',  dateDebut: '2026-04-22', dateFin: '2026-04-24' },
    { employeId: 'emp-003', nom: 'Dupont',   prenom: 'Karim',   type: 'ANNUEL',  dateDebut: '2026-04-28', dateFin: '2026-05-02' },
    { employeId: 'emp-004', nom: 'Martin',   prenom: 'Sophie',  type: 'MALADIE', dateDebut: '2026-05-05', dateFin: '2026-05-07' },
    { employeId: 'emp-005', nom: 'Petit',    prenom: 'Nicolas', type: 'RTT',     dateDebut: '2026-04-23', dateFin: '2026-04-23' },
    { employeId: 'emp-006', nom: 'Chabi',    prenom: 'Amina',   type: 'ANNUEL',  dateDebut: '2026-05-11', dateFin: '2026-05-15' },
    { employeId: 'emp-007', nom: 'Rousseau', prenom: 'Marc',    type: 'RTT',     dateDebut: '2026-05-02', dateFin: '2026-05-02' },
];

export function getEquipeAbsences(dateDebut?: string, dateFin?: string): TeamAbsence[] {
    if (!dateDebut || !dateFin) return TEAM_ABSENCES;
    const d1 = new Date(dateDebut);
    const d2 = new Date(dateFin);
    return TEAM_ABSENCES.filter(a => new Date(a.dateDebut) <= d2 && new Date(a.dateFin) >= d1);
}

/* ══════════════════════════════════════════════════════════════
   🔧 FONCTIONS UTILITAIRES
   ══════════════════════════════════════════════════════════════ */

/**
 * Calcule le nombre de jours ouvrés entre deux dates
 */
function calculerJoursOuvres(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    let jours = 0;

    for (let d = new Date(debut); d <= fin; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        // Exclure samedi (6) et dimanche (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            jours++;
        }
    }

    return jours;
}

/**
 * Calcule le nombre total de jours entre deux dates
 */
function calculerJoursTotal(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin.getTime() - debut.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Récupère le solde de congés
 */
export function getSolde(): SoldeConge {
    return { ...solde };
}

/**
 * Récupère les demandes de congés
 */
export function getDemandes(): DemandeConge[] {
    return [...demandes].sort((a, b) =>
        new Date(b.dateDemande).getTime() - new Date(a.dateDemande).getTime()
    );
}

/**
 * Calcule les statistiques
 */
export function getStatistiques(): StatistiquesConges {
    const totalDemandes = demandes.length;
    const enAttente = demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    const approuvees = demandes.filter(d => d.statut === 'APPROUVE').length;
    const rejetees = demandes.filter(d => d.statut === 'REJETE').length;

    const joursRestantsTotal = solde.annuel + solde.maladie + solde.rtt;
    const joursTotalAnnee = solde.annuelTotal + solde.maladieTotal + solde.rttTotal;
    const tauxUtilisation = Math.round((solde.pris / joursTotalAnnee) * 100);

    // Prochain congé approuvé
    const congesApprouves = demandes
        .filter(d => d.statut === 'APPROUVE' && new Date(d.dateDebut) > new Date())
        .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

    const prochainConge = congesApprouves.length > 0 ? {
        dateDebut: congesApprouves[0].dateDebut,
        jours: congesApprouves[0].jours
    } : undefined;

    return {
        totalDemandes,
        enAttente,
        approuvees,
        rejetees,
        joursRestantsTotal,
        tauxUtilisation,
        prochainConge
    };
}

/**
 * Crée une nouvelle demande de congé
 */
export function creerDemande(data: {
    type: DemandeConge['type'];
    dateDebut: string;
    dateFin: string;
    motif?: string;
}): DemandeConge {
    const jours = calculerJoursTotal(data.dateDebut, data.dateFin);
    const joursOuvres = calculerJoursOuvres(data.dateDebut, data.dateFin);

    const nouvelleDemande: DemandeConge = {
        id: nextDemandeId++,
        employeId: 'emp-001',
        type: data.type,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        jours,
        joursOuvres,
        statut: 'EN_ATTENTE',
        motif: data.motif,
        dateDemande: new Date().toISOString().split('T')[0]
    };

    demandes.unshift(nouvelleDemande);

    console.log('[MOCK] ✅ Demande créée:', nouvelleDemande);
    return nouvelleDemande;
}

/**
 * Annule une demande en attente
 */
export function annulerDemande(id: number): boolean {
    const index = demandes.findIndex(d => d.id === id);
    if (index === -1) return false;

    const demande = demandes[index];
    if (demande.statut !== 'EN_ATTENTE') {
        console.warn('[MOCK] ⚠️ Impossible d\'annuler une demande déjà traitée');
        return false;
    }

    demandes.splice(index, 1);
    console.log('[MOCK] 🗑️ Demande annulée:', id);
    return true;
}

/**
 * État de debug
 */
export function getDebugState() {
    return {
        solde: {
            annuel: solde.annuel,
            total: solde.annuelTotal + solde.maladieTotal + solde.rttTotal,
            pris: solde.pris
        },
        demandes: demandes.length,
        enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
        statistiques: getStatistiques()
    };
}