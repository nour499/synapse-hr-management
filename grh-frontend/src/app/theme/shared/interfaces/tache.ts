export interface Tache {
  id: number;
  titre: string;
  projet: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  prioriteColor: string;
  echeance: string;
  assigneA?: string; 
}
