import { http, HttpResponse } from 'msw';
import {
    getProfil,
    getDocuments,
    getActivites,
    getStatistiques,
    updateProfil,
    ajouterDocument,
    supprimerDocument
} from '../data/employe-profile.mock';
import { UpdateProfilDTO } from 'src/app/gerai/models/employe-profile.model';

/* ══════════════════════════════════════════════════════════════
   🌐 HANDLERS MSW - PROFIL EMPLOYÉ (INSTANTANÉ)
   ══════════════════════════════════════════════════════════════ */

export const profilEmployeHandlers = [

    /**
     * GET /api/employe/profil
     * Récupère le profil de l'employé connecté
     */
    http.get('/api/employe/profil', () => {
        const profil = getProfil();
        console.log('[MSW] 👤 GET /api/employe/profil');
        return HttpResponse.json(profil);
    }),

    /**
     * PUT /api/employe/profil
     * Met à jour le profil de l'employé
     */
    http.put('/api/employe/profil', async ({ request }) => {
        const updates = await request.json() as UpdateProfilDTO;
        const updatedProfil = updateProfil(updates);

        console.log('[MSW] ✅ PUT /api/employe/profil mis à jour');
        return HttpResponse.json(updatedProfil);
    }),

    /**
     * GET /api/employe/documents
     * Récupère les documents de l'employé
     */
    http.get('/api/employe/documents', () => {
        const docs = getDocuments();
        console.log('[MSW] 📄 GET /api/employe/documents -', docs.length, 'documents');
        return HttpResponse.json(docs);
    }),

    /**
     * POST /api/employe/documents
     * Upload un document
     */
    http.post('/api/employe/documents', async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return new HttpResponse(
                JSON.stringify({ error: 'Fichier manquant' }),
                { status: 400 }
            );
        }

        // Déterminer le type de fichier
        let type: 'pdf' | 'excel' | 'word' | 'image' = 'pdf';
        if (file.name.match(/\.(xlsx?|csv)$/i)) type = 'excel';
        else if (file.name.match(/\.(docx?|odt)$/i)) type = 'word';
        else if (file.name.match(/\.(jpe?g|png|gif|webp)$/i)) type = 'image';

        const nouveauDoc = ajouterDocument({
            employeId: 'emp-001',
            nom: file.name,
            type,
            categorie: 'personnel',
            taille: `${Math.round(file.size / 1024)} KB`,
            tailleBytes: file.size,
            dateAjout: new Date().toISOString()
        });

        console.log('[MSW] ✅ POST /api/employe/documents -', file.name);
        return HttpResponse.json(nouveauDoc, { status: 201 });
    }),

    /**
     * DELETE /api/employe/documents/:id
     * Supprime un document
     */
    http.delete('/api/employe/documents/:id', ({ params }) => {
        const id = Number(params['id']);
        const success = supprimerDocument(id);

        if (!success) {
            return new HttpResponse(null, { status: 404 });
        }

        console.log('[MSW] 🗑️ DELETE /api/employe/documents/' + id);
        return new HttpResponse(null, { status: 204 });
    }),

    /**
     * GET /api/employe/documents/:id/:action
     * Télécharge un document (simulation Jasper Reports)
     */
    http.get('/api/employe/documents/:id/:action', async ({ params }) => {
        const { action } = params;

        // Création d'un Blob PDF factice
        const dummyPdfContent = new Uint8Array([
            0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a,
            0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f,
            0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a
        ]);
        const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });

        const disposition = action === 'download' ? 'attachment' : 'inline';

        console.log('[MSW] 📥 GET /api/employe/documents/*/' + action);

        return new HttpResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `${disposition}; filename="document.pdf"`,
            },
        });
    }),

    /**
     * GET /api/employe/activites
     * Récupère les activités de l'employé
     */
    http.get('/api/employe/activites', () => {
        const activites = getActivites();
        console.log('[MSW] 📅 GET /api/employe/activites -', activites.length, 'activités');
        return HttpResponse.json(activites);
    }),

    /**
     * GET /api/employe/statistiques
     * Récupère les statistiques de l'employé
     */
    http.get('/api/employe/statistiques', () => {
        const stats = getStatistiques();
        console.log('[MSW] 📊 GET /api/employe/statistiques');
        return HttpResponse.json(stats);
    }),

    /**
     * GET /api/employe/performance
     * Métriques de performance individuelle
     */
    http.get('/api/employe/performance', () => {
        console.log('[MSW] 🏅 GET /api/employe/performance');
        return HttpResponse.json({
            tachesCompletees: 24,
            tauxCompletion: 80,
            tempsResolutionBugs: 2.3,
            documentationCompletion: 72,
            codeQuality: 88
        });
    })
];

/* ══════════════════════════════════════════════════════════════
   🧪 HELPERS POUR DEBUG
   ══════════════════════════════════════════════════════════════ */

export {
    getProfil,
    getDocuments,
    getActivites
} from '../data/employe-profile.mock';