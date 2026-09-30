import {
    ProfilEmploye,
    DocumentEmploye,
    ActiviteEmploye,
    StatistiquesEmploye
} from 'src/app/gerai/models/employe-profile.model';

const calculerAnciennete = (dateEmbauche: string): string => {
    const embauche = new Date(dateEmbauche);
    const maintenant = new Date();
    const mois = Math.floor((maintenant.getTime() - embauche.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const annees = Math.floor(mois / 12);
    const moisRestants = mois % 12;
    if (annees === 0) return `${mois} mois`;
    if (moisRestants === 0) return `${annees} an${annees > 1 ? 's' : ''}`;
    return `${annees} an${annees > 1 ? 's' : ''} ${moisRestants} mois`;
};

/* ════════════════════════════════════════════════════════
   👤 PROFIL
════════════════════════════════════════════════════════ */
export let profil: ProfilEmploye = {
    // Identity (injected by Keycloak at runtime)
    id         : '',
    nom        : '',
    prenom     : '',
    nomComplet : '',
    photo      : 'assets/images/user/avatar-1.jpg',
    email      : '',

    // Contact
    telephone      : '+216 98 765 432',
    emailPersonnel : 'sami.benali@gmail.com',

    // Professional
    poste       : 'Développeur Frontend',
    departement : 'IT — Développement',
    dateEmbauche: '2022-03-15',
    anciennete  : calculerAnciennete('2022-03-15'),
    managerNom  : 'Ahmed Mansour',
    managerPhoto: 'https://randomuser.me/api/portraits/men/51.jpg',

    // Contract
    typeContrat : 'CDI',
    categoriePro: 'Cadre',
    echelon     : 'Échelon 3',

    // Rémunération (read-only)
    salaireBase : 3200,
    rib         : 'TN59 1234 5678 9012 3456 7890',
    banque      : 'Banque de l\'Habitat',

    // État civil
    genre              : 'M',
    situationFamiliale : 'Marié(e)',
    nombreEnfants      : 1,
    nationalite        : 'Tunisienne',
    cin                : '12345678',
    cnss               : '987654321',

    // Address
    dateNaissance : '1994-08-20',
    lieuNaissance : 'Tunis',
    adresse       : '45 Avenue de la République',
    ville         : 'Tunis',
    codePostal    : '1002',

    // Emergency contact
    contactUrgenceNom  : 'Fatma Ben Ali',
    contactUrgenceTel  : '+216 22 111 000',
    contactUrgenceLien : 'Conjoint(e)',

    // Education & skills
    niveauEtudes  : 'Master',
    diplome       : 'Master en Génie Logiciel',
    etablissement : 'ENSI — École Nationale des Sciences de l\'Informatique',
    competences   : ['Angular', 'TypeScript', 'Spring Boot', 'Docker', 'Git', 'Scrum'],
    langues: [
        { langue: 'Arabe',   niveau: 'Natif'          },
        { langue: 'Français',niveau: 'Courant'         },
        { langue: 'Anglais', niveau: 'Courant'         },
        { langue: 'Espagnol',niveau: 'Intermédiaire'   }
    ],
    certifications: [
        { nom: 'AWS Cloud Practitioner', organisme: 'Amazon Web Services', date: '2023-06-15' },
        { nom: 'Angular Developer',      organisme: 'Google',               date: '2022-11-10' }
    ],

    // Stats
    congesRestants   : 18,
    congesPris       : 7,
    congesTotal      : 25,
    tachesCompletes  : 42,
    tachesEnCours    : 5,
    tauxPresence     : 96,
    objectifsAtteints: 85,
    formationsSuivies: 4,
    formationsTotal  : 5
};

/* ════════════════════════════════════════════════════════
   📄 DOCUMENTS
════════════════════════════════════════════════════════ */
export let documents: DocumentEmploye[] = [
    {
        id: 1, employeId: 'kc-user-id',
        nom: 'CV_Professionnel.pdf', type: 'pdf', categorie: 'personnel',
        taille: '245 KB', tailleBytes: 251_904,
        dateAjout: new Date('2024-01-15').toISOString()
    },
    {
        id: 2, employeId: 'kc-user-id',
        nom: 'Contrat_Travail_Signe.pdf', type: 'pdf', categorie: 'contractuel',
        taille: '1.2 MB', tailleBytes: 1_258_291,
        dateAjout: new Date('2022-03-15').toISOString()
    },
    {
        id: 3, employeId: 'kc-user-id',
        nom: 'Attestation_Travail.pdf', type: 'pdf', categorie: 'administratif',
        taille: '180 KB', tailleBytes: 184_320,
        dateAjout: new Date('2024-06-01').toISOString()
    },
    {
        id: 4, employeId: 'kc-user-id',
        nom: 'Certificat_Angular.pdf', type: 'pdf', categorie: 'formation',
        taille: '320 KB', tailleBytes: 327_680,
        dateAjout: new Date('2022-11-10').toISOString()
    }
];

export let nextDocId = 5;

/* ════════════════════════════════════════════════════════
   📅 ACTIVITÉS RÉCENTES
════════════════════════════════════════════════════════ */
export let activites: ActiviteEmploye[] = [
    {
        id: 1, employeId: 'kc-user-id',
        titre: 'Connexion sécurisée',
        description: 'Authentification réussie via Keycloak SYNAPSE',
        date: new Date().toISOString(),
        type: 'presence', statut: 'validee', badge: 'Session Active'
    },
    {
        id: 2, employeId: 'kc-user-id',
        titre: 'Tâche terminée',
        description: 'Intégration API Keycloak — Refonte Système RH',
        date: new Date(Date.now() - 2 * 86_400_000).toISOString(),
        type: 'tache', statut: 'terminee', badge: 'Terminée'
    },
    {
        id: 3, employeId: 'kc-user-id',
        titre: 'Demande de congé',
        description: 'Congé annuel du 01/07 au 10/07/2025',
        date: new Date(Date.now() - 5 * 86_400_000).toISOString(),
        type: 'conge', statut: 'en_attente', badge: 'En attente'
    },
    {
        id: 4, employeId: 'kc-user-id',
        titre: 'Formation suivie',
        description: 'Angular Advanced — Certification Google',
        date: new Date(Date.now() - 10 * 86_400_000).toISOString(),
        type: 'formation', statut: 'terminee', badge: 'Complétée'
    },
    {
        id: 5, employeId: 'kc-user-id',
        titre: 'Document ajouté',
        description: 'Attestation de travail ajoutée au dossier',
        date: new Date(Date.now() - 15 * 86_400_000).toISOString(),
        type: 'document', statut: 'validee', badge: 'Ajouté'
    }
];

/* ════════════════════════════════════════════════════════
   🔧 FONCTIONS UTILITAIRES
════════════════════════════════════════════════════════ */
export function getProfil(): ProfilEmploye          { return { ...profil }; }
export function getDocuments(): DocumentEmploye[]   { return [...documents]; }
export function getActivites(): ActiviteEmploye[]   {
    return [...activites].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getStatistiques(): StatistiquesEmploye {
    return {
        tauxPresence     : profil.tauxPresence,
        objectifsAtteints: profil.objectifsAtteints,
        formationsSuivies: profil.formationsSuivies,
        formationsTotal  : profil.formationsTotal,
        tachesCompletes  : profil.tachesCompletes,
        tachesTotal      : profil.tachesCompletes + profil.tachesEnCours,
        congesRestants   : profil.congesRestants,
        congesTotal      : profil.congesTotal
    };
}

export function updateProfil(updates: Partial<ProfilEmploye>): ProfilEmploye {
    profil = { ...profil, ...updates };
    return { ...profil };
}

export function ajouterDocument(doc: Omit<DocumentEmploye, 'id'>): DocumentEmploye {
    const newDoc: DocumentEmploye = { ...doc, id: nextDocId++, dateAjout: new Date().toISOString() };
    documents.push(newDoc);
    return newDoc;
}

export function supprimerDocument(id: number): boolean {
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) return false;
    documents.splice(index, 1);
    return true;
}

export function getDebugState() {
    return { profil_id: profil.id, docs_count: documents.length, statistiques: getStatistiques() };
}
