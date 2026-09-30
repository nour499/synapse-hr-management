export interface Tache {
    id: number;
    titre: string;
    projet: string;
    priorite: 'Haute' | 'Moyenne' | 'Basse';
    prioriteColor: string;
    statut?: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
    echeance: string;
    dateDebut?: string;
    effortEstime?: number;
    progression?: number;
    description?: string;
    assigneNom?: string;
    assigneA?: string;
    assignedTo?: number;
}

export interface TacheStats {
    total: number;
    aFaire: number;
    enCours: number;
    terminees: number;
}

/** Interface utilisée pour la vue Kanban des tâches employé */
export interface TacheKanban {
    id: number;
    titre: string;
    projet: string;
    projetId?: number;
    priorite: 'Haute' | 'Moyenne' | 'Basse';
    prioriteColor: string;
    statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
    echeance: string;
    progression: number;
    description?: string;
}