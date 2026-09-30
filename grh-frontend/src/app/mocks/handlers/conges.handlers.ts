import { http, HttpResponse } from 'msw';
import {
    getSolde,
    getDemandes,
    getStatistiques,
    creerDemande,
    annulerDemande,
    getEquipeAbsences
} from '../data/conges.mock';
import { CreateDemandeDTO } from 'src/app/gerai/models/conge.model';

/* ══════════════════════════════════════════════════════════════
   🌐 HANDLERS MSW - CONGÉS (INSTANTANÉ)
   ══════════════════════════════════════════════════════════════ */

export const congesHandlers = [

    /**
     * GET /api/conges/equipe?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD
     * Absences approuvées des collègues sur une période
     */
    http.get('/api/conges/equipe', ({ request }) => {
        const url      = new URL(request.url);
        const dateDebut = url.searchParams.get('dateDebut') ?? undefined;
        const dateFin   = url.searchParams.get('dateFin')   ?? undefined;
        return HttpResponse.json(getEquipeAbsences(dateDebut, dateFin));
    }),

    /**
     * GET /api/conges/solde
     * Récupère le solde de congés de l'employé
     */
    http.get('/api/conges/solde', () => {
        const solde = getSolde();
        console.log('[MSW] 💰 GET /api/conges/solde');
        return HttpResponse.json(solde);
    }),

    /**
     * GET /api/conges/mes-demandes
     * Récupère toutes les demandes de congés de l'employé
     */
    http.get('/api/conges/mes-demandes', () => {
        const demandes = getDemandes();
        console.log('[MSW] 📋 GET /api/conges/mes-demandes -', demandes.length, 'demandes');
        return HttpResponse.json(demandes);
    }),

    /**
     * GET /api/conges/statistiques
     * Récupère les statistiques de congés
     */
    http.get('/api/conges/statistiques', () => {
        const stats = getStatistiques();
        console.log('[MSW] 📊 GET /api/conges/statistiques');
        return HttpResponse.json(stats);
    }),

    /**
     * GET /api/conges/complet
     * Récupère toutes les données d'un coup (optimisé)
     */
    http.get('/api/conges/complet', () => {
        const data = {
            solde: getSolde(),
            demandes: getDemandes(),
            statistiques: getStatistiques()
        };
        console.log('[MSW] 🎯 GET /api/conges/complet (optimisé)');
        return HttpResponse.json(data);
    }),

    /**
     * POST /api/conges/demander
     * Crée une nouvelle demande de congé
     */
    http.post('/api/conges/demander', async ({ request }) => {
        const data = await request.json() as CreateDemandeDTO;

        // Validation basique
        if (!data.type || !data.dateDebut || !data.dateFin) {
            return new HttpResponse(
                JSON.stringify({ error: 'Données incomplètes' }),
                { status: 400 }
            );
        }

        // Vérifier que dateDebut < dateFin
        if (new Date(data.dateDebut) > new Date(data.dateFin)) {
            return new HttpResponse(
                JSON.stringify({ error: 'La date de début doit être avant la date de fin' }),
                { status: 400 }
            );
        }

        const nouvelleDemande = creerDemande({
            type: data.type,
            dateDebut: data.dateDebut,
            dateFin: data.dateFin,
            motif: data.motif
        });

        console.log('[MSW] ✅ POST /api/conges/demander -', data.type, data.dateDebut, '→', data.dateFin);
        return HttpResponse.json(nouvelleDemande, { status: 201 });
    }),

    /**
     * DELETE /api/conges/:id
     * Annule une demande en attente
     */
    http.delete('/api/conges/:id', ({ params }) => {
        const id = Number(params['id']);
        const success = annulerDemande(id);

        if (!success) {
            return new HttpResponse(
                JSON.stringify({ error: 'Demande introuvable ou déjà traitée' }),
                { status: 400 }
            );
        }

        console.log('[MSW] 🗑️ DELETE /api/conges/' + id);
        return new HttpResponse(null, { status: 204 });
    })
];

/* ══════════════════════════════════════════════════════════════
   🧪 HELPERS POUR DEBUG
   ══════════════════════════════════════════════════════════════ */

export {
    getSolde,
    getDemandes,
    getStatistiques
} from '../data/conges.mock';