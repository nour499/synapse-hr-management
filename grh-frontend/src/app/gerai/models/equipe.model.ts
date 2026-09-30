export interface MembreEquipe {
    id: number;
    nom: string;
    prenom: string;
    poste: string;
    email: string;
    photo?: string;
    present?: boolean;
    keycloakId?: string;
    // ✅ Propriétés ajoutées pour correspondre au HTML et aux Mocks
    statut: 'ACTIF' | 'CONGE' | 'INACTIF';
    dateEmbauche: string;
    manager?: string;
    competences?: string[];

    // Propriétés optionnelles existantes
    departement?: string;
    telephone?: string;
    anciennete?: string;
    congesRestants?: number;
    tachesCompletes?: number;
}

/**
 * DTO pour la création d'un membre
 */
export interface CreateMembreDTO {
    prenom: string;
    nom: string;
    poste: string;
    email: string;
    statut?: 'ACTIF' | 'CONGE' | 'INACTIF';
    telephone?: string;
    departement?: string;
    manager?: string;
    competences?: string[];
    photo?: string;
}

/**
 * DTO pour la mise à jour d'un membre
 */
export interface UpdateMembreDTO {
    prenom?: string;
    nom?: string;
    poste?: string;
    email?: string;
    statut?: 'ACTIF' | 'CONGE' | 'INACTIF';
    telephone?: string;
    departement?: string;
    manager?: string;
    competences?: string[];
    photo?: string;
}
