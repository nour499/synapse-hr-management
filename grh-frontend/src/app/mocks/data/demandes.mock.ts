import {
    Demande,
    StatistiquesDemandes,
    TypeDemande,
    TYPES_DEMANDE_CONFIG
} from 'src/app/gerai/models/demande.model';

/* ══════════════════════════════════════════════════════════════
   📊 DONNÉES MOCK - DEMANDES (Partagées Chef & Employé)
   ══════════════════════════════════════════════════════════════ */

// Helper pour obtenir la config d'un type
const getTypeConfig = (type: TypeDemande) => {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type) || TYPES_DEMANDE_CONFIG[4];
};

// Helper pour obtenir les infos de statut
const getStatutInfo = (statut: Demande['statut']) => {
    const configs = {
        'EN_ATTENTE': { label: 'En attente', icon: 'ti ti-clock', color: '#F59E0B' },
        'VALIDEE_CHEF': { label: 'Validée Chef', icon: 'ti ti-check', color: '#10B981' },
        'VALIDEE_RH': { label: 'Validée RH', icon: 'ti ti-circle-check', color: '#059669' },
        'REJETEE': { label: 'Rejetée', icon: 'ti ti-x', color: '#EF4444' }
    };
    return configs[statut] || configs['EN_ATTENTE'];
};

/* ──────────────────────────────────────────────────────────
   💾 LISTE DES DEMANDES
   ────────────────────────────────────────────────────────── */

export let demandes: Demande[] = [
    {
        id: 1,
        employeId: 'emp-001',
        employeNom: 'Ben Ali',
        employePrenom: 'Sami',
        employeInitiales: 'SB',
        employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        type: 'CONGE',
        typeLabel: 'Congé',
        typeIcon: 'ti ti-beach',
        typeColor: '#3B82F6',
        description: 'Congé annuel - Vacances d\'été en famille',
        dateCreation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: '2024-07-15',
        dateFin: '2024-07-26',
        joursOuvres: 10,
        statut: 'EN_ATTENTE',
        statutLabel: 'En attente',
        statutIcon: 'ti ti-clock',
        statutColor: '#F59E0B',
        commentaireChef: null,
        commentaireRh: null
    },
    {
        id: 2,
        employeId: 'emp-001',
        employeNom: 'Ben Ali',
        employePrenom: 'Sami',
        employeInitiales: 'SB',
        employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        type: 'FORMATION',
        typeLabel: 'Formation',
        typeIcon: 'ti ti-school',
        typeColor: '#10B981',
        description: 'Formation Angular Advanced - Certification officielle',
        dateCreation: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: '2024-05-10',
        dateFin: '2024-05-12',
        joursOuvres: 3,
        statut: 'VALIDEE_CHEF',
        statutLabel: 'Validée Chef',
        statutIcon: 'ti ti-check',
        statutColor: '#10B981',
        validePar: 'mgr-001',
        validateurNom: 'Stéphane Manager',
        dateValidation: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commentaireChef: 'Formation approuvée, très pertinente pour le projet',
        commentaireRh: null
    },
    {
        id: 3,
        employeId: 'emp-001',
        employeNom: 'Ben Ali',
        employePrenom: 'Sami',
        employeInitiales: 'SB',
        employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        type: 'DOCUMENT_ADMINISTRATIF',
        typeLabel: 'Document administratif',
        typeIcon: 'ti ti-file-text',
        typeColor: '#8B5CF6',
        description: 'Attestation de travail pour demande de crédit immobilier',
        dateCreation: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: null,
        dateFin: null,
        statut: 'VALIDEE_RH',
        statutLabel: 'Validée RH',
        statutIcon: 'ti ti-circle-check',
        statutColor: '#059669',
        validePar: 'rh-001',
        validateurNom: 'Leila RH',
        dateValidation: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commentaireChef: 'OK',
        commentaireRh: 'Document préparé et envoyé par email'
    },
    {
        id: 4,
        employeId: 'emp-001',
        employeNom: 'Ben Ali',
        employePrenom: 'Sami',
        employeInitiales: 'SB',
        employePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        type: 'PRET',
        typeLabel: 'Prêt',
        typeIcon: 'ti ti-coin',
        typeColor: '#F59E0B',
        description: 'Demande de prêt personnel - 5000 TND',
        dateCreation: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: null,
        dateFin: null,
        statut: 'REJETEE',
        statutLabel: 'Rejetée',
        statutIcon: 'ti ti-x',
        statutColor: '#EF4444',
        validePar: 'mgr-001',
        validateurNom: 'Stéphane Manager',
        dateValidation: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commentaireChef: 'Quota annuel de prêts dépassé',
        commentaireRh: null
    },
    {
        id: 5,
        employeId: 'emp-002',
        employeNom: 'Trabelsi',
        employePrenom: 'Ines',
        employeInitiales: 'IT',
        employePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        type: 'CONGE',
        typeLabel: 'Congé',
        typeIcon: 'ti ti-beach',
        typeColor: '#3B82F6',
        description: 'RTT - Pont du week-end',
        dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: '2024-06-14',
        dateFin: '2024-06-14',
        joursOuvres: 1,
        statut: 'EN_ATTENTE',
        statutLabel: 'En attente',
        statutIcon: 'ti ti-clock',
        statutColor: '#F59E0B',
        commentaireChef: null,
        commentaireRh: null
    },
    {
        id: 6,
        employeId: 'emp-003',
        employeNom: 'Karray',
        employePrenom: 'Youssef',
        employeInitiales: 'YK',
        employePhoto: 'https://randomuser.me/api/portraits/men/67.jpg',
        type: 'FORMATION',
        typeLabel: 'Formation',
        typeIcon: 'ti ti-school',
        typeColor: '#10B981',
        description: 'Certification PMP - Project Management Professional',
        dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: '2025-08-04',
        dateFin: '2025-08-08',
        joursOuvres: 5,
        statut: 'EN_ATTENTE',
        statutLabel: 'En attente',
        statutIcon: 'ti ti-clock',
        statutColor: '#F59E0B',
        commentaireChef: null,
        commentaireRh: null
    },
    {
        id: 7,
        employeId: 'emp-004',
        employeNom: 'Gharbi',
        employePrenom: 'Mohamed',
        employeInitiales: 'MG',
        employePhoto: 'https://randomuser.me/api/portraits/men/51.jpg',
        type: 'PRET',
        typeLabel: 'Prêt',
        typeIcon: 'ti ti-coin',
        typeColor: '#F59E0B',
        description: 'Demande de prêt personnel - 8 000 TND — Achat véhicule',
        dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: null,
        dateFin: null,
        statut: 'EN_ATTENTE',
        statutLabel: 'En attente',
        statutIcon: 'ti ti-clock',
        statutColor: '#F59E0B',
        commentaireChef: null,
        commentaireRh: null
    },
    {
        id: 8,
        employeId: 'emp-005',
        employeNom: 'Sassi',
        employePrenom: 'Leila',
        employeInitiales: 'LS',
        employePhoto: 'https://randomuser.me/api/portraits/women/29.jpg',
        type: 'DOCUMENT_ADMINISTRATIF',
        typeLabel: 'Document administratif',
        typeIcon: 'ti ti-file-text',
        typeColor: '#8B5CF6',
        description: 'Attestation de salaire pour demande de visa Schengen',
        dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: null,
        dateFin: null,
        statut: 'VALIDEE_RH',
        statutLabel: 'Validée RH',
        statutIcon: 'ti ti-circle-check',
        statutColor: '#059669',
        validePar: 'rh-001',
        validateurNom: 'Leila RH',
        dateValidation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commentaireChef: 'OK',
        commentaireRh: 'Document préparé et envoyé par email'
    },
    {
        id: 9,
        employeId: 'emp-006',
        employeNom: 'Hammami',
        employePrenom: 'Youssef',
        employeInitiales: 'YH',
        employePhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
        type: 'MALADIE',
        typeLabel: 'Congé maladie',
        typeIcon: 'ti ti-stethoscope',
        typeColor: '#EF4444',
        description: 'Congé maladie — certificat médical joint (chirurgie genou)',
        dateCreation: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateDebut: '2025-07-07',
        dateFin: '2025-07-18',
        joursOuvres: 10,
        statut: 'EN_ATTENTE',
        statutLabel: 'En attente',
        statutIcon: 'ti ti-clock',
        statutColor: '#F59E0B',
        commentaireChef: null,
        commentaireRh: null
    }
];

export let nextDemandeId = 6;

/* ══════════════════════════════════════════════════════════════
   🔧 FONCTIONS UTILITAIRES
   ══════════════════════════════════════════════════════════════ */

/**
 * Récupère toutes les demandes
 */
export function getToutesDemandes(): Demande[] {
    return [...demandes].sort((a, b) =>
        new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
}

/**
 * Récupère les demandes d'un employé spécifique
 */
export function getDemandesByEmploye(employeId: string): Demande[] {
    return demandes
        .filter(d => d.employeId === employeId)
        .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
}

/**
 * Récupère une demande par son ID
 */
export function getDemandeById(id: number): Demande | undefined {
    return demandes.find(d => d.id === id);
}

/**
 * Récupère les demandes en attente (pour le chef)
 */
export function getDemandesEnAttente(employeId?: string): Demande[] {
    let result = demandes.filter(d => d.statut === 'EN_ATTENTE');
    if (employeId) {
        result = result.filter(d => d.employeId === employeId);
    }
    return result.sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
}

/**
 * Récupère l'historique (demandes traitées)
 */
export function getHistorique(employeId?: string): Demande[] {
    let result = demandes.filter(d => d.statut !== 'EN_ATTENTE');
    if (employeId) {
        result = result.filter(d => d.employeId === employeId);
    }
    return result.sort((a, b) => new Date(b.dateValidation || b.dateCreation).getTime() -
        new Date(a.dateValidation || a.dateCreation).getTime());
}

/**
 * Calcule les statistiques pour un employé
 */
export function getStatistiques(employeId: string): StatistiquesDemandes {
    const demandesEmploye = getDemandesByEmploye(employeId);

    const stats: StatistiquesDemandes = {
        total: demandesEmploye.length,
        enAttente: demandesEmploye.filter(d => d.statut === 'EN_ATTENTE').length,
        validees: demandesEmploye.filter(d => d.statut === 'VALIDEE_CHEF' || d.statut === 'VALIDEE_RH').length,
        rejetees: demandesEmploye.filter(d => d.statut === 'REJETEE').length,
        parType: {
            'CONGE': demandesEmploye.filter(d => d.type === 'CONGE').length,
            'FORMATION': demandesEmploye.filter(d => d.type === 'FORMATION').length,
            'DOCUMENT_ADMINISTRATIF': demandesEmploye.filter(d => d.type === 'DOCUMENT_ADMINISTRATIF').length,
            'PRET': demandesEmploye.filter(d => d.type === 'PRET').length,
            'AUTRE': demandesEmploye.filter(d => d.type === 'AUTRE').length
        }
    };

    return stats;
}

/**
 * Crée une nouvelle demande
 */
export function creerDemande(data: {
    employeId: string;
    type: TypeDemande;
    description: string;
    dateDebut: string | null;
    dateFin: string | null;
}): Demande {
    const typeConfig = getTypeConfig(data.type);
    const statutInfo = getStatutInfo('EN_ATTENTE');

    // Récupérer les infos de l'employé depuis les demandes existantes
    const employeInfo = demandes.find(d => d.employeId === data.employeId);

    const nouvelleDemande: Demande = {
        id: nextDemandeId++,
        employeId: data.employeId,
        employeNom: employeInfo?.employeNom || 'Utilisateur',
        employePrenom: employeInfo?.employePrenom || 'Test',
        employeInitiales: employeInfo?.employeInitiales || 'UT',
        employePhoto: employeInfo?.employePhoto,
        type: data.type,
        typeLabel: typeConfig.label,
        typeIcon: typeConfig.icon,
        typeColor: typeConfig.color,
        description: data.description,
        dateCreation: new Date().toISOString().split('T')[0],
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        statut: 'EN_ATTENTE',
        statutLabel: statutInfo.label,
        statutIcon: statutInfo.icon,
        statutColor: statutInfo.color,
        commentaireChef: null,
        commentaireRh: null
    };

    demandes.unshift(nouvelleDemande);
    console.log('[MOCK] ✅ Demande créée:', nouvelleDemande);
    return nouvelleDemande;
}

/**
 * Annule une demande (suppression)
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
 * Valide ou rejette une demande (Chef)
 */
export function validerDemandeChef(
    id: number,
    approuve: boolean,
    commentaire: string = '',
    validateurId: string = 'mgr-001',
    validateurNom: string = 'Stéphane Manager'
): Demande | null {
    const index = demandes.findIndex(d => d.id === id);
    if (index === -1) return null;

    const nouveauStatut = approuve ? 'VALIDEE_CHEF' : 'REJETEE';
    const statutInfo = getStatutInfo(nouveauStatut);

    demandes[index] = {
        ...demandes[index],
        statut: nouveauStatut,
        statutLabel: statutInfo.label,
        statutIcon: statutInfo.icon,
        statutColor: statutInfo.color,
        validePar: validateurId,
        validateurNom: validateurNom,
        dateValidation: new Date().toISOString().split('T')[0],
        commentaireChef: commentaire
    };

    console.log('[MOCK] ✅ Demande', id, approuve ? 'validée' : 'rejetée', 'par le chef');
    return demandes[index];
}

/**
 * Valide ou rejette une demande (RH)
 */
export function validerDemandeRH(
    id: number,
    approuve: boolean,
    commentaire: string = '',
    validateurId: string = 'rh-001',
    validateurNom: string = 'Leila RH'
): Demande | null {
    const index = demandes.findIndex(d => d.id === id);
    if (index === -1) return null;

    const nouveauStatut = approuve ? 'VALIDEE_RH' : 'REJETEE';
    const statutInfo = getStatutInfo(nouveauStatut);

    demandes[index] = {
        ...demandes[index],
        statut: nouveauStatut,
        statutLabel: statutInfo.label,
        statutIcon: statutInfo.icon,
        statutColor: statutInfo.color,
        validePar: validateurId,
        validateurNom: validateurNom,
        dateValidation: new Date().toISOString().split('T')[0],
        commentaireRh: commentaire
    };

    console.log('[MOCK] ✅ Demande', id, approuve ? 'validée' : 'rejetée', 'par RH');
    return demandes[index];
}

/**
 * État de debug
 */
export function getDebugState() {
    return {
        total: demandes.length,
        parEmploye: {
            'emp-001': demandes.filter(d => d.employeId === 'emp-001').length,
            'emp-002': demandes.filter(d => d.employeId === 'emp-002').length
        },
        parStatut: {
            'EN_ATTENTE': demandes.filter(d => d.statut === 'EN_ATTENTE').length,
            'VALIDEE_CHEF': demandes.filter(d => d.statut === 'VALIDEE_CHEF').length,
            'VALIDEE_RH': demandes.filter(d => d.statut === 'VALIDEE_RH').length,
            'REJETEE': demandes.filter(d => d.statut === 'REJETEE').length
        }
    };
}
// On exporte une demande spécifique pour les tests de détails par exemple
export const DemandeChefMock: Demande = demandes[0];

// Optionnel : Si ton service attend une liste nommée différemment
export const DEMANDES_MOCK = demandes;