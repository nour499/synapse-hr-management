import { delay, http, HttpResponse } from 'msw';
import { ConversationDTO, MessageDTO, ParticipantDTO } from 'src/app/gerai/models/chat.model';

// ── Identité simulée ──────────────────────────────────────────
export const MOI_EMPLOYEE_ID = 1;
export const MOI_NOM         = 'Moi';

// ── Utilisateurs mock ─────────────────────────────────────────
export const CHAT_USERS_MOCK = [
    { id: '98d63792-7104-4b53-b0a5-f39b6999a0d8', employeeId: 2, username: 'nabil',   firstName: 'Nabil',  lastName: 'Benzarti', email: 'nabil@synapse.tn' },
    { id: 'd8004f21-7290-48e0-ae89-082098650085', employeeId: 3, username: 'ahmed',   firstName: 'Ahmed',  lastName: 'Khalil',   email: 'ahmed@synapse.tn' },
    { id: '749f7e52-bc66-4d0a-9d6e-0960bc21008d', employeeId: 4, username: 'sarra',   firstName: 'Sarra',  lastName: 'Trabelsi', email: 'sarra@synapse.tn' }
] as const;

export type MockUser = typeof CHAT_USERS_MOCK[number];
export function nomComplet(u: MockUser): string {
    return [u.firstName, u.lastName].filter(Boolean).join(' ');
}

// ── Auto-incrément ────────────────────────────────────────────
let _convId = 10;
let _msgId  = 100;
export const nextConvId = () => _convId++;
export const nextMsgId  = () => _msgId++;

// ── Participants helper ───────────────────────────────────────
function participant(empId: number, nom: string, online = false): ParticipantDTO {
    return { employeeId: empId, nomComplet: nom, role: 'MEMBRE', enLigne: online };
}

// ── Conversations initiales ───────────────────────────────────
export let MOCK_CONVERSATIONS: ConversationDTO[] = [
    {
        conversationId   : 1,
        type             : 'DIRECT',
        name             : nomComplet(CHAT_USERS_MOCK[0]),
        participants     : [participant(MOI_EMPLOYEE_ID, MOI_NOM, true), participant(2, nomComplet(CHAT_USERS_MOCK[0]))],
        dernierMessage   : 'Salut, as-tu validé le rapport ?',
        lastMessageAt    : _ago(60),
        nombreNonLus     : 0,
        currentEmployeeId: MOI_EMPLOYEE_ID
    },
    {
        conversationId   : 2,
        type             : 'DIRECT',
        name             : nomComplet(CHAT_USERS_MOCK[1]),
        participants     : [participant(MOI_EMPLOYEE_ID, MOI_NOM, true), participant(3, nomComplet(CHAT_USERS_MOCK[1]))],
        dernierMessage   : 'On se voit demain ?',
        lastMessageAt    : _ago(180),
        nombreNonLus     : 1,
        currentEmployeeId: MOI_EMPLOYEE_ID
    }
];

// ── Messages initiaux ─────────────────────────────────────────
export let MOCK_MESSAGES: MessageDTO[] = [
    _m(1, 1, 2, nomComplet(CHAT_USERS_MOCK[0]), 'Bonjour ! Tu vas bien ? 👋', 7),
    _m(2, 1, MOI_EMPLOYEE_ID, MOI_NOM,          'Bien merci ! Et toi ?',       6),
    _m(3, 1, 2, nomComplet(CHAT_USERS_MOCK[0]), 'Top ! Tu as lu le rapport ?', 5),
    _m(4, 1, MOI_EMPLOYEE_ID, MOI_NOM,          'Pas encore, ce soir.',        4),
    _m(5, 1, 2, nomComplet(CHAT_USERS_MOCK[0]), 'Salut, as-tu validé le rapport ?', 1),
    _m(6, 2, 3, nomComplet(CHAT_USERS_MOCK[1]), 'Hey ! Dispo demain matin ?',  5),
    _m(7, 2, MOI_EMPLOYEE_ID, MOI_NOM,          'Oui, à partir de 9h.',        4),
    _m(8, 2, 3, nomComplet(CHAT_USERS_MOCK[1]), 'On se voit demain ?',         2),
];

// ── Simulation WebSocket ──────────────────────────────────────
export const MESSAGES_SIMULATION: string[] = [
    'Tu as vu le dernier email du DRH ? 📧',
    'Je termine la revue de code, ça prend 10 min.',
    'La réunion est déplacée à 14h.',
    'Peux-tu jeter un œil au ticket #48 ?',
    'Merci pour ton aide ! 🙏',
    'On confirme pour la démo vendredi ?',
];

// ── MSW Handlers ─────────────────────────────────────────────
export const chatHandlers = [

    http.get('*/api/chat/users', async () => {
        await delay(20);
        return HttpResponse.json(CHAT_USERS_MOCK.map(u => ({ ...u, nomComplet: nomComplet(u) })));
    }),

    http.get('*/api/chat/conversations', async () => {
        await delay(20);
        return HttpResponse.json(MOCK_CONVERSATIONS);
    }),

    http.post('*/api/chat/conversations', async ({ request }) => {
        await delay(20);
        let body: { otherEmployeeId?: number } = {};
        try { body = await request.json() as typeof body; } catch { /**/ }
        const emp2Id = Number(body?.otherEmployeeId ?? 0);
        if (!emp2Id) return new HttpResponse(null, { status: 400 });

        let conv = MOCK_CONVERSATIONS.find(c =>
            c.participants.some(p => p.employeeId === MOI_EMPLOYEE_ID) &&
            c.participants.some(p => p.employeeId === emp2Id)
        );
        if (!conv) {
            const u = CHAT_USERS_MOCK.find(u => u.employeeId === emp2Id);
            const nom = u ? nomComplet(u) : 'Inconnu';
            conv = {
                conversationId   : nextConvId(),
                type             : 'DIRECT',
                name             : nom,
                participants     : [participant(MOI_EMPLOYEE_ID, MOI_NOM, true), participant(emp2Id, nom)],
                dernierMessage   : '',
                lastMessageAt    : new Date().toISOString(),
                nombreNonLus     : 0,
                currentEmployeeId: MOI_EMPLOYEE_ID
            };
            MOCK_CONVERSATIONS.push(conv);
        }
        return HttpResponse.json(conv);
    }),

    http.get('*/api/chat/conversations/:id/messages', async ({ params }) => {
        await delay(20);
        const convId = Number(params['id']);
        return HttpResponse.json(MOCK_MESSAGES.filter(m => m.conversationId === convId));
    }),

    http.post('*/api/chat/send', async ({ request }) => {
        await delay(20);
        const body = await request.json() as { conversationId: number; content: string };
        const msg: MessageDTO = {
            messageId    : nextMsgId(),
            conversationId: body.conversationId,
            senderId     : MOI_EMPLOYEE_ID,
            senderNom    : MOI_NOM,
            content      : body.content ?? '',
            type         : 'TEXTE',
            sentAt       : new Date().toISOString(),
        };
        MOCK_MESSAGES.push(msg);
        _majConv(msg);
        return HttpResponse.json(msg);
    }),

    http.post('*/api/chat/upload', async ({ request }) => {
        await delay(20);
        const fd     = await request.formData();
        const file   = fd.get('file') as File | null;
        const convId = Number(fd.get('conversationId'));
        if (!file) return new HttpResponse(null, { status: 400 });

        const isImage = file.type.startsWith('image/');
        const msg: MessageDTO = {
            messageId    : nextMsgId(),
            conversationId: convId,
            senderId     : MOI_EMPLOYEE_ID,
            senderNom    : MOI_NOM,
            content      : isImage ? '📷 Image' : '📎 Fichier',
            type         : isImage ? 'IMAGE' : 'FICHIER',
            attachmentUrl: isImage
                ? `https://placehold.co/400x300/4680FF/fff?text=${encodeURIComponent(file.name)}`
                : `/files/mock/${encodeURIComponent(file.name)}`,
            sentAt: new Date().toISOString(),
        };
        MOCK_MESSAGES.push(msg);
        _majConv(msg);
        return HttpResponse.json(msg);
    }),

    http.post('*/api/chat/read/:id', async ({ params }) => {
        await delay(20);
        const convId = Number(params['id']);
        MOCK_MESSAGES = MOCK_MESSAGES.map(m =>
            m.conversationId === convId && m.senderId !== MOI_EMPLOYEE_ID
                ? { ...m, luParMoi: true }
                : m
        );
        return HttpResponse.json({ success: true });
    }),

    http.delete('*/api/chat/conversations/:id/messages', async ({ params }) => {
        await delay(20);
        const convId = Number(params['id']);
        MOCK_MESSAGES = MOCK_MESSAGES.filter(m => m.conversationId !== convId);
        const conv = MOCK_CONVERSATIONS.find(c => c.conversationId === convId);
        if (conv) conv.dernierMessage = '';
        return HttpResponse.json({ success: true });
    })
];

// ── Utilitaires privés ────────────────────────────────────────
function _m(msgId: number, convId: number, senderId: number, senderNom: string, content: string, hoursAgo: number): MessageDTO {
    return { messageId: msgId, conversationId: convId, senderId, senderNom, content, type: 'TEXTE', sentAt: _ago(hoursAgo * 60) };
}

function _ago(min: number): string {
    return new Date(Date.now() - min * 60_000).toISOString();
}

function _majConv(msg: MessageDTO): void {
    const conv = MOCK_CONVERSATIONS.find(c => c.conversationId === msg.conversationId);
    if (!conv) return;
    conv.dernierMessage = msg.content;
    conv.lastMessageAt  = msg.sentAt;
}
