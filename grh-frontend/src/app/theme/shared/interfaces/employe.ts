export type GenreEmploye      = 'M' | 'F';
export type LieuTravail       = 'BUREAU' | 'TELETRAVAIL' | 'HYBRIDE';
export type StatutEmploye     = 'ACTIF' | 'INACTIF' | 'CONGE';

export interface Employe {
  id          : number;
  nom         : string;
  prenom      : string;
  email       : string;
  photo?      : string;
  telephone?  : string;
  dateEmbauche?: string;
  poste?      : string;
  departement?: string;
  chefId?     : number;

  // ── New fields ──────────────────────────────
  genre?        : GenreEmploye;
  dateNaissance?: string;
  diplome?      : string;
  adresse?      : string;
  salaire?      : number;
  lieuTravail?  : LieuTravail;
  statut?       : StatutEmploye;

  // Current project assignment (populated by /api/affectation/employes)
  projetId?  : number;
  projetNom? : string;
}
