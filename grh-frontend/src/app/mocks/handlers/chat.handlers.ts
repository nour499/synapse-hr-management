import { http, HttpResponse } from 'msw';
import { ConversationDTO, MessageDTO, ParticipantDTO } from 'src/app/gerai/models/chat.model';

/* ══════════════════════════════════════════════════════════════
   📊 DATA MOCK
   ══════════════════════════════════════════════════════════════ */

export const CHAT_USERS_MOCK = [
    { id: '98d63792-7104-4b53-b0a5-f39b6999a0d8', employeeId: 2, username: 'nabil',   firstName: 'Nabil',  lastName: 'Benzarti'  },
    { id: 'd8004f21-7290-48e0-ae89-082098650085', employeeId: 3, username: 'ahmed',   firstName: 'Ahmed',  lastName: ''          },
    { id: '749f7e52-bc66-4d0a-9d6e-0960bc21008d', employeeId: 4, username: 'sarra',   firstName: 'Sarra',  lastName: ''          },
    { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', employeeId: 5, username: 'sarah.t', firstName: 'Sarah',  lastName: 'Trabelsi'  }
];

let conversations: ConversationDTO[] = [];
let messages: MessageDTO[]           = [];
let nextConversationId               = 1;
let nextMessageId                    = 1;

const CURRENT_EMPLOYEE_ID = 1;
const CURRENT_USER_NAME   = 'Moi';

/* ══════════════════════════════════════════════════════════════
   🔧 UTILITAIRE
   ══════════════════════════════════════════════════════════════ */

function trouverOuCreerConversation(emp1Id: number, emp2Id: number, emp2Nom: string): ConversationDTO {
    let conv = conversations.find(c =>
        c.participants.some(p => p.employeeId === emp1Id) &&
        c.participants.some(p => p.employeeId === emp2Id)
    );

    if (!conv) {
        const p1: ParticipantDTO = { employeeId: emp1Id, nomComplet: CURRENT_USER_NAME, role: 'MEMBRE', enLigne: true };
        const p2: ParticipantDTO = { employeeId: emp2Id, nomComplet: emp2Nom,           role: 'MEMBRE', enLigne: false };
        conv = {
            conversationId : nextConversationId++,
            type           : 'DIRECT',
            name           : emp2Nom,
            participants   : [p1, p2],
            dernierMessage : '',
            lastMessageAt  : new Date().toISOString(),
            nombreNonLus   : 0,
            currentEmployeeId: emp1Id
        };
        conversations.push(conv);
    }

    return conv;
}

/* ══════════════════════════════════════════════════════════════
   🌐 HANDLERS HTTP
   ══════════════════════════════════════════════════════════════ */

export const chatHandlers = [

    /* USERS */
    http.get('http://localhost:8085/api/chat/users', () => {
        return HttpResponse.json(CHAT_USERS_MOCK.map(u => ({
            ...u,
            nomComplet: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username
        })));
    }),

    /* GET CONVERSATIONS */
    http.get('http://localhost:8085/api/chat/conversations', () => {
        return HttpResponse.json(conversations);
    }),

    /* CREATE / GET CONVERSATION */
    http.post('http://localhost:8085/api/chat/conversations', async ({ request }) => {
        const body = await request.json() as any;
        const emp2Id  = Number(body?.otherEmployeeId ?? 0);
        const emp2Nom = CHAT_USERS_MOCK.find(u => u.employeeId === emp2Id)?.firstName ?? 'Inconnu';
        if (!emp2Id) return HttpResponse.json({ message: 'otherEmployeeId manquant' }, { status: 400 });
        return HttpResponse.json(trouverOuCreerConversation(CURRENT_EMPLOYEE_ID, emp2Id, emp2Nom));
    }),

    /* GET MESSAGES */
    http.get('http://localhost:8085/api/chat/conversations/:id/messages', ({ params }) => {
        const convId = Number(params['id']);
        return HttpResponse.json(messages.filter(m => m.conversationId === convId));
    }),

    /* SEND MESSAGE */
    http.post('http://localhost:8085/api/chat/send', async ({ request }) => {
        const body = await request.json() as any;
        if (!body.conversationId) return HttpResponse.json({ message: 'conversationId manquant' }, { status: 400 });

        const msg: MessageDTO = {
            messageId    : nextMessageId++,
            conversationId: body.conversationId,
            senderId     : CURRENT_EMPLOYEE_ID,
            senderNom    : CURRENT_USER_NAME,
            content      : body.content ?? '',
            type         : 'TEXTE',
            sentAt       : new Date().toISOString(),
        };
        messages.push(msg);

        const conv = conversations.find(c => c.conversationId === body.conversationId);
        if (conv) { conv.dernierMessage = msg.content; conv.lastMessageAt = msg.sentAt; }

        return HttpResponse.json(msg);
    }),

    /* UPLOAD FILE */
    http.post('http://localhost:8085/api/chat/upload', async ({ request }) => {
        const formData     = await request.formData();
        const file         = formData.get('file') as File;
        const conversationId = Number(formData.get('conversationId'));
        if (!file) return HttpResponse.json({ message: 'Fichier manquant' }, { status: 400 });

        const msg: MessageDTO = {
            messageId    : nextMessageId++,
            conversationId,
            senderId     : CURRENT_EMPLOYEE_ID,
            senderNom    : CURRENT_USER_NAME,
            content      : file.type?.startsWith('image/') ? '📷 Image' : '📎 Fichier',
            type         : file.type?.startsWith('image/') ? 'IMAGE' : 'FICHIER',
            attachmentUrl: URL.createObjectURL(file),
            sentAt       : new Date().toISOString(),
        };
        messages.push(msg);
        return HttpResponse.json(msg);
    }),

    /* MARK AS READ */
    http.post('http://localhost:8085/api/chat/read/:id', () => {
        return HttpResponse.json({ success: true });
    })
];
