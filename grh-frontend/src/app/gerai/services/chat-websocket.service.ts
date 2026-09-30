import { Injectable, OnDestroy, inject } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import Keycloak from 'keycloak-js';
import { MessageDTO, TypingResponse } from 'src/app/gerai/models/chat.model';

export interface PresenceDTO {
  userId: string;
  connecte: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatWebSocketService implements OnDestroy {

  private keycloak = inject(Keycloak);
  private client!: Client;
  private subscriptions: StompSubscription[] = [];
  private conversationSub: StompSubscription | null = null;

  messageRecu$   = new Subject<MessageDTO>();
  typing$        = new Subject<TypingResponse>();
  connecte$      = new Subject<boolean>();
  presenceListe$ = new Subject<PresenceDTO>();

  // ── Connexion ─────────────────────────────────────────
  connect(): void {
    if (this.client?.active) return;

    const token = this.keycloak.token ?? '';

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8086/ws?token=${token}`),

      connectHeaders: { token },
      reconnectDelay: 5000,
      debug: () => {},

      onConnect: () => {
        this.connecte$.next(true);
        this._abonnerPresence();
      },

      onDisconnect: () => {
        this.connecte$.next(false);
      },

      onStompError: (frame) => {
        console.error('[STOMP] Erreur:', frame.headers['message']);
      }
    });

    this.client.activate();
  }

  // ── Abonnement à une conversation ─────────────────────
  subscribeToConversation(conversationId: number): void {
    if (this.conversationSub) {
      this.conversationSub.unsubscribe();
      this.conversationSub = null;
    }

    const doSubscribe = () => {
      this.conversationSub = this.client.subscribe(
        `/topic/conversation/${conversationId}`,
        (msg: IMessage) => {
          try {
            const data: MessageDTO = JSON.parse(msg.body);
            this.messageRecu$.next(data);
          } catch (err) {
            console.error('[Chat] Erreur parsing message', err);
          }
        }
      );
    };

    if (this.client?.connected) {
      doSubscribe();
    } else {
      // Wait for connection then subscribe (handles startup race condition)
      const sub = this.connecte$.subscribe(connected => {
        if (connected) {
          sub.unsubscribe();
          doSubscribe();
        }
      });
    }
  }

  // ── Abonnements permanents après connexion ────────────
  private _abonnerPresence(): void {
    // Clear any stale subscriptions from a previous connection before re-subscribing
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    // Personal queue: receives messages for this user regardless of active conversation
    const subMsg = this.client.subscribe(
      `/user/queue/messages`,
      (msg: IMessage) => {
        try {
          const data: MessageDTO = JSON.parse(msg.body);
          this.messageRecu$.next(data);
        } catch { }
      }
    );

    const sub1 = this.client.subscribe(
      `/user/queue/typing`,
      (msg: IMessage) => {
        try {
          const data: TypingResponse = JSON.parse(msg.body);
          this.typing$.next(data);
        } catch { }
      }
    );

    const sub2 = this.client.subscribe(
      `/topic/presence`,
      (msg: IMessage) => {
        try {
          const data: PresenceDTO = JSON.parse(msg.body);
          this.presenceListe$.next(data);
        } catch { }
      }
    );

    this.subscriptions.push(subMsg, sub1, sub2);
  }

  // ── Envoi message ─────────────────────────────────────
  envoyerMessage(payload: {
    conversationId: number;
    content: string;
    type?: string;
    attachmentUrl?: string;
    replyToId?: number;
  }): void {
    if (!this.client?.connected) {
      console.warn('[Chat] WebSocket non connecté');
      return;
    }
    this.client.publish({
      destination: '/app/chat.envoyer',
      body: JSON.stringify({
        conversationId: payload.conversationId,
        content       : payload.content,
        type          : payload.type ?? 'TEXTE',
        attachmentUrl : payload.attachmentUrl ?? null,
        replyToId     : payload.replyToId ?? null
      })
    });
  }

  // ── Typing indicator ──────────────────────────────────
  envoyerTyping(
    conversationId: number,
    destinataireEmployeeId: number,
    typing: boolean
  ): void {
    if (!this.client?.connected) return;
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId, destinataireEmployeeId, typing })
    });
  }

  // ── Déconnexion ───────────────────────────────────────
  disconnect(): void {
    this.conversationSub?.unsubscribe();
    this.conversationSub = null;
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    if (this.client?.active) {
      this.client.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
