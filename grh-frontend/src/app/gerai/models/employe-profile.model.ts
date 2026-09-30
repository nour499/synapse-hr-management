// ── Supporting types ──────────────────────────────────────
export interface Langue {
    langue: string;
    niveau: 'Débutant' | 'Intermédiaire' | 'Courant' | 'Natif';
}

export interface Certification {
    nom: string;
    organisme: string;
    date: string;
}

// ── Main profile ──────────────────────────────────────────
export interface ProfilEmploye {
    id: string;               // Keycloak ID
    nom: string;
    prenom: string;
    nomComplet: string;
    photo: string;

    // ── Contact pro ──────────────────────────────────────
    email: string;
    telephone: string;
    emailPersonnel?: string;

    // ── Informations professionnelles ────────────────────
    poste: string;
    departement: string;
    dateEmbauche: string;
    anciennete: string;       // Computed "2 ans 3 mois"
    managerNom?: string;
    managerPhoto?: string;

    // ── Contrat ──────────────────────────────────────────
    typeContrat: 'CDI' | 'CDD' | 'INTERIM' | 'STAGE';
    dateFinContrat?: string;
    periodeEssaiJusquau?: string;
    categoriePro?: string;
    echelon?: string;

    // ── Rémunération (read-only) ─────────────────────────
    salaireBase?: number;
    rib?: string;
    banque?: string;

    // ── État civil ───────────────────────────────────────
    genre: 'M' | 'F' | '';
    situationFamiliale: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf/Veuve' | '';
    nombreEnfants: number;
    nationalite: string;
    cin: string;
    cnss?: string;

    // ── Adresse ──────────────────────────────────────────
    dateNaissance: string;
    lieuNaissance: string;
    adresse: string;
    ville: string;
    codePostal: string;

    // ── Contact d'urgence ────────────────────────────────
    contactUrgenceNom: string;
    contactUrgenceTel: string;
    contactUrgenceLien: string;   // Conjoint, Parent, Ami…

    // ── Formation & compétences ──────────────────────────
    niveauEtudes: string;
    diplome: string;
    etablissement: string;
    competences: string[];
    langues: Langue[];
    certifications: Certification[];

    // ── Statistiques ─────────────────────────────────────
    congesRestants: number;
    congesPris: number;
    congesTotal: number;
    tachesCompletes: number;
    tachesEnCours: number;
    tauxPresence: number;
    objectifsAtteints: number;
    formationsSuivies: number;
    formationsTotal: number;
}

// ── Documents ─────────────────────────────────────────────
export interface DocumentEmploye {
    id: number;
    employeId: string;
    nom: string;
    type: 'pdf' | 'excel' | 'word' | 'image';
    categorie: 'personnel' | 'contractuel' | 'administratif' | 'formation';
    taille: string;
    tailleBytes: number;
    dateAjout: string;
    dateModification?: string;
    url?: string;
    description?: string;
}

// ── Activities ────────────────────────────────────────────
export interface ActiviteEmploye {
    id: number;
    employeId: string;
    titre: string;
    description: string;
    date: string;
    type: 'demande' | 'tache' | 'formation' | 'document' | 'conge' | 'presence';
    statut?: 'validee' | 'refusee' | 'en_attente' | 'terminee' | 'en_cours';
    badge?: string;
    icone?: string;
    lien?: string;
}

// ── Statistics ────────────────────────────────────────────
export interface StatistiquesEmploye {
    tauxPresence: number;
    objectifsAtteints: number;
    formationsSuivies: number;
    formationsTotal: number;
    tachesCompletes: number;
    tachesTotal: number;
    congesRestants: number;
    congesTotal: number;
}

// ── Performance Metrics ───────────────────────────────────
export interface PerformanceEmploye {
    tachesCompletees: number;          // Tasks Completed (count)
    tauxCompletion: number;            // % tasks completed vs assigned
    tempsResolutionBugs: number;       // Bug Resolution Time (avg days)
    documentationCompletion: number;   // Documentation Completion (%)
    codeQuality: number;               // Code Quality score (0–100)
}

// ── Aggregate ─────────────────────────────────────────────
export interface ProfilComplet {
    profil: ProfilEmploye;
    documents: DocumentEmploye[];
    activites: ActiviteEmploye[];
    statistiques: StatistiquesEmploye;
}

// ── DTOs ──────────────────────────────────────────────────
export interface UpdateProfilDTO {
    // Personal (editable by employee)
    telephone?: string;
    emailPersonnel?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
    genre?: 'M' | 'F' | '';
    situationFamiliale?: ProfilEmploye['situationFamiliale'];
    nombreEnfants?: number;
    nationalite?: string;
    cin?: string;
    contactUrgenceNom?: string;
    contactUrgenceTel?: string;
    contactUrgenceLien?: string;
    // Skills (editable by employee)
    competences?: string[];
    langues?: Langue[];
    niveauEtudes?: string;
    diplome?: string;
    etablissement?: string;
}

// ── Misc ──────────────────────────────────────────────────
export interface SoldeConge {
    annuel: number;
    maladie: number;
    rtt: number;
    pris: number;
}

export interface DemandeConge {
    id: number;
    employeId: string;
    type: 'ANNUEL' | 'MALADIE' | 'RTT' | 'SANS_SOLDE';
    dateDebut: string;
    dateFin: string;
    jours: number;
    statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
    motif?: string;
    dateDemande: string;
    dateReponse?: string;
    commentaire?: string;
}
