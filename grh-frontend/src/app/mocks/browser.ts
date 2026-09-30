// src/app/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { allHandlers } from './handlers';

export const worker = setupWorker(...allHandlers);

export async function enableMocking(): Promise<void> {
    console.log('🔧 [MSW] Initialisation des mocks...');

    await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
            url: '/mockServiceWorker.js'  // ✅ absolu, fonctionne sur toutes les routes
        },
        // Force the new service worker to take control immediately,
        // preventing stale cached workers from missing handlers.
        quiet: false
    });

    console.log('✅ [MSW] Mocks activés — handlers:', allHandlers.length);
}