export interface Departement {
  id              : number;
  nom             : string;
  code            : string;
  responsable     : string | null;
  responsablePhoto?: string;
  telephone       : string;
  email           : string;
  capacite        : number;
  anneeCreation   : number;
  totalEmployes   : number;
  description    ?: string;
}
