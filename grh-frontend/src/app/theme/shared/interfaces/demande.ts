export interface Demande {
  id: number;
  type: string;
  date: string;
  statut: 'En attente' | 'Validée' | 'Refusée' | 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
  statusColor: string;
  bgColor: string;
  icon: string;
  
  // ✅ Ajouter ces champs optionnels pour la liste détaillée
  dateDemande?: Date;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  statutLabel?: string;
  statutIcon?: string;
  iconColor?: string;
  validePar?: string | null;
  employeId?: number;
  employe?: string;
}