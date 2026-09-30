import { DemandeRecrutement } from 'src/app/gerai/models/demande-recrutement.model';

export let MOCK_DEMANDES_REC: DemandeRecrutement[] = [
  {
    id: 1, chefId: 'chef-001',
    chefNom: 'Stéphane Manager',
    chefPhoto: 'https://randomuser.me/api/portraits/men/75.jpg',
    departement: 'Informatique',
    titrePoste: 'Développeur Full-Stack Angular / Spring Boot',
    role: 'SENIOR', nombrePostes: 2, typeContrat: 'CDI',
    justification: 'Deux projets clients critiques démarrent en juin. L\'équipe actuelle est à pleine capacité, impossible d\'absorber la charge sans renforts.',
    urgence: 'URGENTE', statut: 'EN_ATTENTE',
    dateDemande: '2026-04-15'
  },
  {
    id: 2, chefId: 'chef-002',
    chefNom: 'Houda Belhadj',
    chefPhoto: 'https://randomuser.me/api/portraits/women/72.jpg',
    departement: 'Data & Analytics',
    titrePoste: 'Data Engineer',
    role: 'JUNIOR', nombrePostes: 1, typeContrat: 'CDI',
    justification: 'La migration vers le data lake est bloquée faute de ressources. Un profil junior peut prendre en charge les pipelines ETL sous supervision.',
    urgence: 'NORMALE', statut: 'EN_ATTENTE',
    dateDemande: '2026-04-17'
  },
  {
    id: 3, chefId: 'chef-001',
    chefNom: 'Stéphane Manager',
    chefPhoto: 'https://randomuser.me/api/portraits/men/75.jpg',
    departement: 'Informatique',
    titrePoste: 'Ingénieur DevOps',
    role: 'SENIOR', nombrePostes: 1, typeContrat: 'CDI',
    justification: 'L\'infrastructure CI/CD est gérée manuellement. Un DevOps senior permettrait d\'automatiser et sécuriser les déploiements.',
    urgence: 'CRITIQUE', statut: 'APPROUVEE',
    dateDemande: '2026-04-10',
    dateTraitement: '2026-04-14',
    traiteePar: 'Leila RH',
    commentaireRh: 'Besoin validé — offre publiée.',
    jobId: 8
  },
  {
    id: 4, chefId: 'chef-003',
    chefNom: 'Nadia Ferchichi',
    chefPhoto: 'https://randomuser.me/api/portraits/women/58.jpg',
    departement: 'Marketing & Communication',
    titrePoste: 'Responsable Marketing Digital',
    role: 'MANAGER', nombrePostes: 1, typeContrat: 'CDI',
    justification: 'L\'équipe manque d\'un responsable pour coordonner les campagnes digitales et gérer le budget media.',
    urgence: 'NORMALE', statut: 'REJETEE',
    dateDemande: '2026-03-28',
    dateTraitement: '2026-04-05',
    traiteePar: 'Leila RH',
    commentaireRh: 'Budget recrutement épuisé pour Q2. Relancer en Q3.'
  },
  {
    id: 5, chefId: 'chef-002',
    chefNom: 'Houda Belhadj',
    chefPhoto: 'https://randomuser.me/api/portraits/women/72.jpg',
    departement: 'Data & Analytics',
    titrePoste: 'Business Analyst',
    role: 'SENIOR', nombrePostes: 1, typeContrat: 'CDI',
    justification: 'Les projets BI s\'accumulent et il manque un profil capable de faire le lien entre les équipes métier et technique.',
    urgence: 'URGENTE', statut: 'CONVERTIE',
    dateDemande: '2026-03-20',
    dateTraitement: '2026-03-25',
    traiteePar: 'Leila RH',
    commentaireRh: 'Offre publiée sur le portail.',
    jobId: 11
  }
];
