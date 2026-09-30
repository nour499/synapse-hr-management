/**
 * notifications.mock.ts
 * Source unique pour simulation notifications (Kafka ready)
 */

import { Notification } from 'src/app/gerai/models/notification.model';

/* ═════════════════════════════════════════════════════════════
   TYPES
   ═════════════════════════════════════════════════════════════ */

/**
 * Template utilisé par la simulation WebSocket.
 * role:
 *   - undefined → notification globale (topic notifications.global)
 *   - 'CHEF'    → notifications.chef
 *   - 'EMPLOYE' → notifications.employe
 */
export type NotificationTemplate = {
    titre: string;
    message: (detail?: string) => string;
    type: 'info' | 'success' | 'warning' | 'danger';
    icone: string;
    lien?: string | null;
    role?: 'CHEF' | 'EMPLOYE';
};

/* ═════════════════════════════════════════════════════════════
   HELPERS
   ═════════════════════════════════════════════════════════════ */

const now = Date.now();
const ago = (min: number) => new Date(now - min * 60_000).toISOString();

let _id = 1;
const nextId = () => _id++;

/* ═════════════════════════════════════════════════════════════
   MOCK CHEF (simulation HTTP initiale)
   ═════════════════════════════════════════════════════════════ */

export let MOCK_CHEF_NOTIFICATIONS: Notification[] = [
    {
        id: nextId(),
        titre: 'Nouvelle demande à valider',
        message: 'Ahmed Ben Ali a soumis une demande de congé.',
        type: 'info',
        icone: 'ti ti-clipboard-check',
        heure: ago(5),
        lue: false,
        lien: '/chef/demandes',
        role: 'CHEF'
    },
    {
        id: nextId(),
        titre: 'Projet terminé',
        message: 'Le projet "Migration Cloud" est marqué terminé.',
        type: 'success',
        icone: 'ti ti-circle-check',
        heure: ago(30),
        lue: false,
        lien: '/chef/projets',
        role: 'CHEF'
    },
    {
        id: nextId(),
        titre: 'Échéance proche',
        message: 'Le projet "Dashboard Analytics" arrive à échéance.',
        type: 'warning',
        icone: 'ti ti-alert-triangle',
        heure: ago(120),
        lue: false,
        lien: '/chef/projets',
        role: 'CHEF'
    },
    {
        id: nextId(),
        titre: 'Délai critique dépassé',
        message: 'Le projet "Refonte Site Web" dépasse son délai.',
        type: 'danger',
        icone: 'ti ti-alert-circle',
        heure: ago(240),
        lue: false,
        lien: '/chef/projets',
        role: 'CHEF'
    }
];

/* ═════════════════════════════════════════════════════════════
   MOCK EMPLOYÉ (simulation HTTP initiale)
   ═════════════════════════════════════════════════════════════ */

export let MOCK_EMPLOYE_NOTIFICATIONS: Notification[] = [
    {
        id: nextId(),
        titre: 'Demande traitée',
        message: 'Votre demande a été examinée par Ahmed Ben Ali.',
        type: 'info',
        icone: 'ti ti-file-check',
        heure: ago(2),
        lue: false,
        lien: '/employe/demandes',
        role: 'EMPLOYE'
    },
    {
        id: nextId(),
        titre: 'Nouvelle tâche assignée',
        message: 'Une nouvelle tâche "Revue de code sprint 12" vous a été affectée.',
        type: 'info',
        icone: 'ti ti-subtask',
        heure: ago(45),
        lue: false,
        lien: '/employe/taches',
        role: 'EMPLOYE'
    },
    {
        id: nextId(),
        titre: 'Formation obligatoire',
        message: 'La formation "Sécurité des données" commence le 15/03 à 09h00.',
        type: 'warning',
        icone: 'ti ti-school',
        heure: ago(90),
        lue: true,
        lien: '/employe/formations',
        role: 'EMPLOYE'
    },
    {
        id: nextId(),
        titre: 'Tâche en retard',
        message: 'La tâche "Tests unitaires module RH" dépasse son délai.',
        type: 'danger',
        icone: 'ti ti-alert-circle',
        heure: ago(200),
        lue: false,
        lien: '/employe/taches',
        role: 'EMPLOYE'
    }
];

/* ═════════════════════════════════════════════════════════════
   HELPER POUR FILTRAGE PAR ROLE (simulation backend)
   ═════════════════════════════════════════════════════════════ */

export function getMockNotificationsByRole(role: 'CHEF' | 'EMPLOYE'): Notification[] {
    return role === 'CHEF'
        ? [...MOCK_CHEF_NOTIFICATIONS]
        : [...MOCK_EMPLOYE_NOTIFICATIONS];
}

/* ═════════════════════════════════════════════════════════════
   TEMPLATES WEBSOCKET (Kafka simulation)
   ═════════════════════════════════════════════════════════════ */

export const NOTIFICATIONS_TEMPLATES: NotificationTemplate[] = [

    /* ───── GLOBAL (topic notifications.global) ───── */

    {
        titre: 'Nouveau message',
        message: (nom: string = 'Utilisateur') =>
            `Vous avez reçu un message de ${nom}.`,
        type: 'info',
        icone: 'ti ti-message-circle',
        lien: '/chat'
    },
    {
        titre: 'Maintenance système',
        message: () =>
            'Une maintenance est prévue ce soir à 22h.',
        type: 'warning',
        icone: 'ti ti-refresh-alert',
        lien: null
    },

    /* ───── CHEF ONLY (topic notifications.chef) ───── */

    {
        titre: 'Nouvelle demande à valider',
        message: (nom: string = 'Employé') =>
            `${nom} a soumis une demande en attente de validation.`,
        type: 'info',
        icone: 'ti ti-clipboard-check',
        lien: '/chef/demandes',
        role: 'CHEF'
    },
    {
        titre: 'Projet critique',
        message: (projet: string = 'Projet') =>
            `Le projet "${projet}" nécessite une attention immédiate.`,
        type: 'danger',
        icone: 'ti ti-alert-circle',
        lien: '/chef/projets',
        role: 'CHEF'
    },

    /* ───── EMPLOYÉ ONLY (topic notifications.employe) ───── */

    {
        titre: 'Demande approuvée',
        message: () =>
            'Votre dernière demande a été approuvée.',
        type: 'success',
        icone: 'ti ti-circle-check',
        lien: '/employe/demandes',
        role: 'EMPLOYE'
    },
    {
        titre: 'Nouvelle tâche',
        message: (tache: string = 'Tâche') =>
            `Une nouvelle tâche "${tache}" vous a été assignée.`,
        type: 'info',
        icone: 'ti ti-subtask',
        lien: '/employe/taches',
        role: 'EMPLOYE'
    }
];

/* ═════════════════════════════════════════════════════════════
   DONNÉES CONTEXTUELLES (simulation dynamique)
   ═════════════════════════════════════════════════════════════ */

export const NOMS_EMPLOYES = [
    'Ahmed Ben Ali',
    'Sami Trabelsi',
    'Leila Khalil',
    'Mehdi Saidi',
    'Sarah Ben Amor'
];

export const PROJETS = [
    'Migration Cloud',
    'Dashboard Analytics',
    'Refonte Site Web'
];

export const TACHES = [
    'Revue de code sprint 12',
    'Tests unitaires module RH',
    'Déploiement production'
];