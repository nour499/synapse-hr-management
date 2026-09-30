import { Actif, DemandeActif } from 'src/app/gerai/models/actif.model';

export let MOCK_ACTIFS: Actif[] = [
  // ── TANGIBLE ──────────────────────────────────────────────
  {
    id: 1, nom: 'MacBook Pro 14"', categorie: 'TANGIBLE', type: 'ORDINATEUR',
    marque: 'Apple', modele: 'MacBook Pro M3', numeroSerie: 'SN-MPB-0012',
    description: 'Ordinateur portable principal', valeur: 2800,
    dateAcquisition: '2023-01-15', dateAttribution: '2023-01-20',
    statut: 'ATTRIBUE', employeId: 1, employeNom: 'Sami Ben Ali'
  },
  {
    id: 2, nom: 'Dell XPS 15', categorie: 'TANGIBLE', type: 'ORDINATEUR',
    marque: 'Dell', modele: 'XPS 15 9530', numeroSerie: 'SN-DL-0045',
    description: 'Ordinateur portable développeur', valeur: 1900,
    dateAcquisition: '2022-06-10', dateAttribution: '2022-06-15',
    statut: 'ATTRIBUE', employeId: 4, employeNom: 'Mohamed Gharbi'
  },
  {
    id: 3, nom: 'Workstation HP Z4 G5', categorie: 'TANGIBLE', type: 'WORKSTATION',
    marque: 'HP', modele: 'Z4 G5', numeroSerie: 'SN-HPZ4-007',
    description: 'Station de travail haute performance', valeur: 4200,
    dateAcquisition: '2023-03-01', dateAttribution: '2023-03-05',
    statut: 'ATTRIBUE', employeId: 2, employeNom: 'Ines Trabelsi'
  },
  {
    id: 4, nom: 'iPhone 15 Pro', categorie: 'TANGIBLE', type: 'TELEPHONE',
    marque: 'Apple', modele: 'iPhone 15 Pro', numeroSerie: 'SN-IP15-021',
    description: 'Téléphone professionnel', valeur: 1300,
    dateAcquisition: '2023-10-01', dateAttribution: '2023-10-05',
    statut: 'ATTRIBUE', employeId: 3, employeNom: 'Youssef Karray'
  },
  {
    id: 5, nom: 'Sony WH-1000XM5', categorie: 'TANGIBLE', type: 'CASQUE',
    marque: 'Sony', modele: 'WH-1000XM5', numeroSerie: 'SN-SONY-033',
    description: 'Casque antibruit', valeur: 380,
    dateAcquisition: '2022-11-20', dateAttribution: '2022-11-25',
    statut: 'ATTRIBUE', employeId: 6, employeNom: 'Youssef Hammami'
  },
  {
    id: 6, nom: 'Canon PIXMA G6050', categorie: 'TANGIBLE', type: 'IMPRIMANTE',
    marque: 'Canon', modele: 'PIXMA G6050', numeroSerie: 'SN-CAN-009',
    description: 'Imprimante multifonction bureau', valeur: 420,
    dateAcquisition: '2021-09-10',
    statut: 'DISPONIBLE'
  },
  {
    id: 7, nom: 'Renault Clio – TN 234 B 567', categorie: 'TANGIBLE', type: 'VEHICULE',
    marque: 'Renault', modele: 'Clio V', numeroSerie: 'VIN-RC-456789',
    description: 'Véhicule de fonction', valeur: 18000,
    dateAcquisition: '2022-03-01', dateAttribution: '2022-03-10',
    statut: 'ATTRIBUE', employeId: 3, employeNom: 'Youssef Karray'
  },
  {
    id: 8, nom: 'ThinkPad X1 Carbon', categorie: 'TANGIBLE', type: 'ORDINATEUR',
    marque: 'Lenovo', modele: 'ThinkPad X1 Carbon Gen 11', numeroSerie: 'SN-LEN-055',
    description: 'En réparation (écran fissuré)', valeur: 1600,
    dateAcquisition: '2021-07-15',
    statut: 'EN_MAINTENANCE'
  },

  // ── NUMÉRIQUE ─────────────────────────────────────────────
  {
    id: 9, nom: 'JetBrains All Products', categorie: 'NUMERIQUE', type: 'LICENCE_LOGICIEL',
    marque: 'JetBrains', description: 'Suite complète IDEs JetBrains',
    dateAcquisition: '2025-05-10', dateExpiration: '2026-05-10',
    statut: 'ATTRIBUE', employeId: 1, employeNom: 'Sami Ben Ali'
  },
  {
    id: 10, nom: 'Adobe Creative Cloud', categorie: 'NUMERIQUE', type: 'ABONNEMENT',
    marque: 'Adobe', description: 'Suite créative complète',
    dateAcquisition: '2024-01-01', dateExpiration: '2024-12-31',
    statut: 'ATTRIBUE', employeId: 5, employeNom: 'Leila Sassi'
  },
  {
    id: 11, nom: 'Microsoft 365 Business', categorie: 'NUMERIQUE', type: 'ABONNEMENT',
    marque: 'Microsoft', description: 'Office + Teams + 1TB OneDrive',
    dateAcquisition: '2024-01-01', dateExpiration: '2024-12-31',
    statut: 'ATTRIBUE', employeId: 2, employeNom: 'Ines Trabelsi'
  },
  {
    id: 12, nom: 'AWS IAM – DevOps', categorie: 'NUMERIQUE', type: 'CLE_ACCES',
    marque: 'Amazon Web Services', description: 'Clé d\'accès IAM avec droits DevOps',
    dateAcquisition: '2023-06-01',
    statut: 'ATTRIBUE', employeId: 6, employeNom: 'Youssef Hammami'
  },
  {
    id: 13, nom: 'Figma Professional', categorie: 'NUMERIQUE', type: 'ABONNEMENT',
    marque: 'Figma', description: 'Licence design professionnel',
    dateAcquisition: '2024-01-01', dateExpiration: '2024-12-31',
    statut: 'ATTRIBUE', employeId: 5, employeNom: 'Leila Sassi'
  },
  {
    id: 14, nom: 'GitHub Copilot', categorie: 'NUMERIQUE', type: 'ABONNEMENT',
    marque: 'GitHub', description: 'Assistant IA pour développeurs',
    dateAcquisition: '2024-03-01', dateExpiration: '2025-02-28',
    statut: 'ATTRIBUE', employeId: 4, employeNom: 'Mohamed Gharbi'
  },
  {
    id: 15, nom: 'VPN Corporate – Accès SSL', categorie: 'NUMERIQUE', type: 'CLE_ACCES',
    marque: 'Cisco', description: 'Certificat VPN SSL entreprise',
    dateAcquisition: '2024-01-01', dateExpiration: '2024-12-31',
    statut: 'DISPONIBLE'
  },
  {
    id: 16, nom: 'Samsung Galaxy S24', categorie: 'TANGIBLE', type: 'TELEPHONE',
    marque: 'Samsung', modele: 'Galaxy S24', numeroSerie: 'SN-SG24-099',
    description: 'Écran fissuré, batterie défectueuse', valeur: 950,
    dateAcquisition: '2024-02-01', dateAttribution: '2024-02-05',
    statut: 'EN_MAINTENANCE', employeId: 1, employeNom: 'Sami Ben Ali'
  },
  {
    id: 17, nom: 'GitHub Copilot', categorie: 'NUMERIQUE', type: 'ABONNEMENT',
    marque: 'GitHub', description: 'Assistant IA pour développeurs',
    dateAcquisition: '2025-04-20', dateExpiration: '2026-04-19',
    statut: 'ATTRIBUE', employeId: 1, employeNom: 'Sami Ben Ali'
  },
];

let nextId = MOCK_ACTIFS.length + 1;
export const getNextActifId = () => nextId++;

// ── Demandes actif (réparation / renouvellement) ──────────────
export let MOCK_DEMANDES_ACTIF: DemandeActif[] = [
  {
    id: 1, actifId: 16, actifNom: 'Samsung Galaxy S24', actifType: 'TELEPHONE',
    employeId: 1, employeNom: 'Sami Ben Ali',
    type: 'REPARATION', description: 'Écran fissuré suite à une chute, batterie ne tient plus la charge.',
    urgence: 'URGENTE', statut: 'EN_COURS',
    dateCreation: '2026-04-10', dateTraitement: '2026-04-12',
    commentaireAdmin: 'Envoyé au SAV Samsung, retour estimé dans 7 jours.'
  },
  {
    id: 2, actifId: 1, actifNom: 'MacBook Pro 14"', actifType: 'ORDINATEUR',
    employeId: 1, employeNom: 'Sami Ben Ali',
    type: 'REPARATION', description: 'Trackpad peu réactif, double-clic aléatoire.',
    urgence: 'NORMALE', statut: 'RESOLUE',
    dateCreation: '2025-11-10', dateTraitement: '2025-11-15',
    commentaireAdmin: 'Nettoyage + recalibrage effectués par IT.'
  },
];

let nextDemandeActifId = 3;
export const getNextDemandeActifId = () => nextDemandeActifId++;
