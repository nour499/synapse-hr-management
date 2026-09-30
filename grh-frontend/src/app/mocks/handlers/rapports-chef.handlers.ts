import { http, HttpResponse, delay } from 'msw';
import { MOCK_RAPPORTS } from '../data/rapports.mock';

export const RapportsHandlers = [
    /**
     * Récupération des données de rapport
     * Désormais, seul 'performance' renverra des données complètes.
     * Les types 'conges', 'projets', etc., renverront des structures vides 
     * car ils seront alimentés par d'autres services dans le composant.
     */
    http.get('/api/rapports/:type', async ({ params }) => {
        await delay(20); // Simulation latence réseau
        const { type } = params;
        const data = MOCK_RAPPORTS[type as string];

        if (!data) {
            return new HttpResponse(JSON.stringify({ error: 'Rapport non trouvé' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return HttpResponse.json(data);
    }),

    /**
     * GET /api/chef/performance
     * Métriques de performance du chef d'équipe
     */
    http.get('/api/chef/performance', () => {
        console.log('[MSW] 🏅 GET /api/chef/performance');
        return HttpResponse.json({
            tauxLivraisonProjet: 78,
            satisfactionClient: 4.2,
            collaborationEquipe: 85,
            qualiteCode: 91,
            tempsResolutionBugs: 3.1
        });
    }),

    /**
     * Simulation de l'export PDF
     */
    http.get('/api/rapports/export/:type', async ({ params }) => {
        await delay(20);
        const { type } = params;

        // Création d'un faux contenu PDF pour la simulation
        const blob = new Blob([`Contenu simulé du rapport PDF pour : ${type}`], {
            type: 'application/pdf'
        });

        return new HttpResponse(blob, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="rapport-${type}.pdf"`
            }
        });
    })
];