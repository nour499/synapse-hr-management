import { Employe } from './employe';  // même dossier interfaces/

export interface Projet {
  id: number;
  nom: string;
  description?: string;
  statut: 'Encours' | 'Termine' | 'Enattente' | 'Enretard';
  dateDebut: string;
  datefin?: string;
  progression?: number;
  chefProjet?: string;
  membres?: Employe[];
  priorite?: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
}