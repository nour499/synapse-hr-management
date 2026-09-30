export interface Membre {
    id: number;
    nom: string;
    initiales: string;
    photo?: string;
}

export enum StatutProjet {
  EN_COURS = 'EN_COURS',
  EN_PAUSE = 'EN_PAUSE',
  TERMINE = 'TERMINE',
  EN_RETARD = 'EN_RETARD'
}

export interface Projet {
  id: number;
  nom: string;
  description: string;
  couleur: string;
  statut: StatutProjet;
  progression: number;
  dateDebut: string;
  dateFin?: string;
  dateEcheance?: string;
  totalTaches: number;
  tachesCompletees: number;
  equipe: Membre[];
  membres?: any[]; // any[] covers both Employe (mock) and MembreDTO (admin API)
  chefProjet?: string;
}

export interface TacheProjet {
    id: number;
    titre: string;
    projetNom: string;
    projetCouleur: string;
    priorite: 'Haute' | 'Moyenne' | 'Basse';
    echeance: string;
    terminee: boolean;
}