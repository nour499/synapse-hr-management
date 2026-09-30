import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked,
  NgZone, inject, ChangeDetectorRef
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { ChatWebSocketService } from 'src/app/gerai/services/chat-websocket.service';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';
import { Subscription } from 'rxjs';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConversationDTO, MessageDTO } from 'src/app/gerai/models/chat.model';

export interface ChatMessage {
  id: number;
  auteur: string;
  initiales: string;
  contenu: string;
  heure: Date;
  estMoi: boolean;
  lu?: boolean;
  typeMessage?: 'TEXTE' | 'IMAGE' | 'FICHIER' | 'SYSTEME';
  attachmentUrl?: string;
}

export interface Contact {
  id: number;         // conversationId (Oracle)
  employeeId: number; // Oracle employee_id
  keycloakId: string; // Keycloak sub UUID
  nom: string;
  initiales: string;
  poste: string;
  statut: 'en-ligne' | 'absent' | 'hors-ligne';
  dernierMessage?: string;
  lastMessageAt?: string;
  nonLus: number;
}

const BACK_URL = '';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, SharedModule, BreadcrumbComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private wsService      = inject(ChatWebSocketService);
  private profilService  = inject(ProfilEmployeService);
  private keycloak       = inject(Keycloak);
  private http           = inject(HttpClient);
  private sanitizer      = inject(DomSanitizer);
  private zone           = inject(NgZone);
  private cdr            = inject(ChangeDetectorRef);

  private blobCache    = new Map<string, SafeUrl>();
  private blobRawUrls  = new Map<string, string>(); // for revokeObjectURL on destroy
  private subs: Subscription[] = [];

  contacts: Contact[] = [];
  contactsFiltres: Contact[] = [];
  contactActif: Contact | null = null;
  messages: ChatMessage[] = [];
  tousMessages: Record<number, ChatMessage[]> = {};
  newMessage = '';
  recherche  = '';
  chargement = false;
  isTyping   = false;
  totalNonLus = 0;
  loadingContacts = true;
  loadingContactsError = false;

  private shouldScroll = false;
  private isSendingTyping = false;
  private stopTypingTimeout: ReturnType<typeof setTimeout> | null = null;
  private serverTypingTimeout: ReturnType<typeof setTimeout> | null = null;
  private typingThrottle: ReturnType<typeof setTimeout> | null = null;

  // Resolved after ngOnInit via ProfilEmployeService
  private moiEmployeeId = 0;

  readonly moi = {
    nom: this.keycloak.tokenParsed?.['name'] ?? 'Moi',
    id : this.keycloak.tokenParsed?.['sub'] ?? ''
  };

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this._connecterWebSocket();
    this.profilService.getDbProfile().subscribe(profile => {
      this.moiEmployeeId = profile.dbId;
      this._chargerContacts();
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    [this.stopTypingTimeout, this.serverTypingTimeout, this.typingThrottle]
      .forEach(t => { if (t) clearTimeout(t); });
    // wsService is a root singleton — do not disconnect here so the user stays
    // online while navigating away from the chat page (disconnect only on logout)
    this.blobRawUrls.forEach(raw => URL.revokeObjectURL(raw));
  }

  getBlobUrl(url: string | undefined): SafeUrl | '' {
    if (!url) return '';
    if (this.blobCache.has(url)) return this.blobCache.get(url)!;
    this._preloadBlob(url);
    return '';
  }

  private _preloadBlob(url: string): void {
    this.blobCache.set(url, '' as unknown as SafeUrl); // sentinel to prevent duplicate requests
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.blobRawUrls.set(url, objectUrl);
        this.blobCache.set(url, this.sanitizer.bypassSecurityTrustUrl(objectUrl));
        this.cdr.detectChanges();
      },
      error: () => this.blobCache.delete(url)
    });
  }

  // ── Contacts ──────────────────────────────────────────
  private _chargerContacts(): void {
    this.loadingContacts      = true;
    this.loadingContactsError = false;
    this.http.get<any[]>(`${BACK_URL}/api/chat/users`)
      .subscribe({
        next: (users) => {
          this.contacts = users
            .filter(u =>
              Number(u['employeeId'] ?? 0) > 0 &&
              Number(u['employeeId']) !== this.moiEmployeeId &&
              (u['keycloakId'] == null || u['keycloakId'] !== this.moi.id)
            )
            .map(u => {
              const empId   = Number(u['employeeId'] ?? 0);
              const nomComp = (u['nomComplet'] ?? ((u['prenom'] ?? '') + ' ' + (u['nom'] ?? '')).trim())
                              || u['username'] || `User #${empId}`;
              return {
                id        : 0,
                employeeId: empId,
                keycloakId: u['keycloakId'] ?? '',
                nom       : nomComp,
                initiales : this._initiales(nomComp),
                poste     : u['username'] ?? '',
                statut    : u['enLigne'] ? 'en-ligne' as const : 'hors-ligne' as const,
                dernierMessage: '',
                nonLus    : 0
              };
            });

          this.loadingContacts = false;
          this._majFiltres();
          this._majNonLus();
          this._chargerConversations();
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingContacts      = false;
          this.loadingContactsError = true;
          this.cdr.detectChanges();
        }
      });
  }

  rechargerContacts(): void { this._chargerContacts(); }

  private _chargerConversations(): void {
    this.http.get<ConversationDTO[]>(`${BACK_URL}/api/chat/conversations`).subscribe({
      next: (convs) => {
        convs.forEach(conv => {
          const other = conv.participants.find(p => p.employeeId !== this.moiEmployeeId);
          if (!other) return;
          const contact = this.contacts.find(c => c.employeeId === other.employeeId);
          if (!contact) return;
          contact.id          = conv.conversationId;
          contact.nonLus      = conv.nombreNonLus;
          contact.lastMessageAt = conv.lastMessageAt;
          if (conv.dernierMessage) {
            const txt = conv.dernierMessage;
            contact.dernierMessage = txt.length > 30 ? txt.substring(0, 30) + '...' : txt;
          }
        });
        this._majNonLus();
        this._majFiltres();
        this.cdr.detectChanges();
      },
      error: () => {} // non-critical — contacts still usable without conversation history
    });
  }

  onRechercheChange(): void { this._majFiltres(); }

  // ── WebSocket ─────────────────────────────────────────
  private _connecterWebSocket(): void {
    this.wsService.connect();

    // Messages reçus sur le topic de la conversation active
    this.subs.push(
      this.wsService.messageRecu$.subscribe((msg: MessageDTO) => {
        this.zone.run(() => {
          const convId = msg.conversationId;
          if (!this.tousMessages[convId]) this.tousMessages[convId] = [];
          const conv = this.tousMessages[convId];

          // Remplacer l'optimistic message si c'est le nôtre
          const idxLocal = msg.senderId === this.moiEmployeeId
            ? conv.findIndex(m => m.contenu === msg.content && m.id < 0)
            : -1;

          if (idxLocal !== -1) {
            conv[idxLocal] = this._toLocalMsg(msg);
          } else if (!conv.some(m => m.id === msg.messageId)) {
            conv.push(this._toLocalMsg(msg));
          }

          this.tousMessages[convId] = [...conv];

          if (this.contactActif?.id === convId) {
            this.messages = [...conv];
            this.shouldScroll = true;
            if (msg.senderId !== this.moiEmployeeId) {
              this.isTyping = false;
              if (this.serverTypingTimeout) clearTimeout(this.serverTypingTimeout);
              this._marquerLu(convId);
            }
          } else {
            // Fallback: match by senderId when the conversation hasn't been opened yet
            const c = this.contacts.find(ct => ct.id === convId)
                   ?? this.contacts.find(ct => ct.employeeId === msg.senderId);
            if (c) {
              if (!c.id) c.id = convId; // cache convId for future lookups
              c.nonLus++;
              this._majNonLus();
            }
          }

          const estFichier = msg.type === 'IMAGE' || msg.type === 'FICHIER';
          this._majDernierMessage(
            msg.senderId,
            estFichier ? '📎 Fichier' : (msg.content ?? ''),
          );

          this.cdr.detectChanges();
        });
      })
    );

    // Typing
    this.subs.push(
      this.wsService.typing$.subscribe(t => {
        this.zone.run(() => {
          if (t.senderId === this.moiEmployeeId) return;
          const actifEmpId = this.contacts.find(c => c.id === t.conversationId)?.employeeId;
          if (actifEmpId !== t.senderId) return;

          if (this.serverTypingTimeout) clearTimeout(this.serverTypingTimeout);
          this.isTyping = t.typing;

          if (this.isTyping) {
            this.cdr.detectChanges();
            setTimeout(() => { this.shouldScroll = true; this.scrollToBottom(); }, 50);
            this.serverTypingTimeout = setTimeout(() => {
              this.zone.run(() => { this.isTyping = false; this.cdr.detectChanges(); });
            }, 6000);
          }
          this.cdr.detectChanges();
        });
      })
    );

    // Présence (userId may be Oracle employee_id string OR Keycloak UUID)
    this.subs.push(
      this.wsService.presenceListe$.subscribe(presence => {
        this.zone.run(() => {
          const c = this.contacts.find(
            ct => ct.employeeId.toString() === presence.userId
               || (ct.keycloakId && ct.keycloakId === presence.userId)
          );
          if (c) c.statut = presence.connecte ? 'en-ligne' : 'hors-ligne';
          this._majFiltres();
          this.cdr.detectChanges();
        });
      })
    );
  }

  // ── Sélection contact ─────────────────────────────────
  selectContact(contact: Contact): void {
    this.contactActif = contact;
    contact.nonLus = 0;
    this.chargement = true;
    this.messages = [];
    this.isTyping = false;
    this.isSendingTyping = false;
    this._majNonLus();
    this._majFiltres();

    const convObs = contact.employeeId
      ? this.http.post<ConversationDTO>(`${BACK_URL}/api/chat/conversations`, { otherEmployeeId: contact.employeeId })
      : this.http.post<ConversationDTO>(`${BACK_URL}/api/chat/conversations?user2Id=${contact.keycloakId}`, null);

    convObs.subscribe({
      next: (conv) => {
        contact.id = conv.conversationId;
        this.wsService.subscribeToConversation(conv.conversationId);
        this._chargerMessages(conv.conversationId);
      },
      error: (err) => {
        console.error('[Chat] Erreur conversation:', err);
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  private _chargerMessages(convId: number): void {
    this.http.get<MessageDTO[]>(
      `${BACK_URL}/api/chat/conversations/${convId}/messages`
    ).subscribe({
      next: (msgs) => {
        this.tousMessages[convId] = (msgs ?? []).map(m => this._toLocalMsg(m));
        this.messages = [...this.tousMessages[convId]];
        this.chargement = false;
        this.shouldScroll = true;
        this._marquerLu(convId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Chat] Erreur messages:', err);
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Envoi message ─────────────────────────────────────
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.contactActif?.id) return;

    const contenu = this.newMessage.trim();

    if (this.stopTypingTimeout) clearTimeout(this.stopTypingTimeout);
    if (this.typingThrottle) clearTimeout(this.typingThrottle);
    if (this.isSendingTyping && this.contactActif.employeeId) {
      this.wsService.envoyerTyping(this.contactActif.id, this.contactActif.employeeId, false);
      this.isSendingTyping = false;
    }

    this._ajouterMessageLocal({
      id       : -(Date.now()),
      auteur   : this.moi.nom,
      initiales: this._initiales(this.moi.nom),
      contenu,
      heure    : new Date(),
      estMoi   : true,
      typeMessage: 'TEXTE'
    });

    this.wsService.envoyerMessage({
      conversationId: this.contactActif.id,
      content       : contenu,
      type          : 'TEXTE'
    });

    this._majDernierMessage(this.moiEmployeeId, contenu);
    this.newMessage = '';
    this.shouldScroll = true;
    this.cdr.detectChanges();

    setTimeout(() => this.messageInput?.nativeElement?.focus(), 50);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ── Typing ────────────────────────────────────────────
  onInputChange(): void {
    if (!this.contactActif?.id || !this.contactActif.employeeId) return;

    if (!this.isSendingTyping) {
      this.isSendingTyping = true;
      this.wsService.envoyerTyping(this.contactActif.id, this.contactActif.employeeId, true);
      this.typingThrottle = setTimeout(() => { this.isSendingTyping = false; }, 1500);
    }

    if (this.stopTypingTimeout) clearTimeout(this.stopTypingTimeout);
    this.stopTypingTimeout = setTimeout(() => {
      if (this.contactActif?.id && this.contactActif.employeeId) {
        this.wsService.envoyerTyping(this.contactActif.id, this.contactActif.employeeId, false);
        this.isSendingTyping = false;
      }
    }, 2500);
  }

  // ── Upload fichier ────────────────────────────────────
  onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.contactActif?.id) return;

    const file   = input.files[0];
    const convId = this.contactActif.id;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', String(convId));

    this.http.post<MessageDTO>(`${BACK_URL}/api/chat/upload`, formData)
      .subscribe({
        next: (msg) => {
          this.zone.run(() => {
            if (!this.tousMessages[msg.conversationId]) this.tousMessages[msg.conversationId] = [];
            const conv = this.tousMessages[msg.conversationId];
            if (!conv.some(m => m.id === msg.messageId)) {
              conv.push(this._toLocalMsg(msg));
              this.tousMessages[msg.conversationId] = [...conv];
              if (this.contactActif?.id === msg.conversationId) {
                this.messages = [...conv];
                this.shouldScroll = true;
              }
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => console.error('[Chat] Erreur upload:', err)
      });

    input.value = '';
  }

  ouvrirFichier(attachmentUrl: string): void {
    if (!attachmentUrl) return;
    const url = attachmentUrl.startsWith('http') ? attachmentUrl : `${BACK_URL}${attachmentUrl}`;
    window.open(url, '_blank');
  }

  effacerAffichage(): void {
    this.messages = [];
    if (this.contactActif?.id) this.tousMessages[this.contactActif.id] = [];
  }

  // ── Helpers ───────────────────────────────────────────
  private _majNonLus(): void {
    this.totalNonLus = this.contacts.reduce((s, c) => s + (c.nonLus || 0), 0);
  }

  private _majFiltres(): void {
    const q = this.recherche.trim().toLowerCase();
    const liste = q
      ? this.contacts.filter(c => c.nom.toLowerCase().includes(q))
      : [...this.contacts];
    liste.sort((a, b) => {
      if (b.nonLus !== a.nonLus) return b.nonLus - a.nonLus;
      if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return 0;
    });
    this.contactsFiltres = liste;
  }

  private _majDernierMessage(senderEmployeeId: number, contenu: string): void {
    const targetEmpId = senderEmployeeId === this.moiEmployeeId
      ? this.contactActif?.employeeId
      : senderEmployeeId;

    if (!targetEmpId) return;

    const texte = contenu.length > 30 ? contenu.substring(0, 30) + '...' : contenu;
    const idx = this.contacts.findIndex(c => c.employeeId === targetEmpId);
    if (idx === -1) return;

    const updated = [...this.contacts];
    updated[idx] = { ...updated[idx], dernierMessage: texte, lastMessageAt: new Date().toISOString() };
    const contact = updated.splice(idx, 1)[0];
    this.contacts = [contact, ...updated];
    this._majFiltres();
  }

  private _marquerLu(convId: number): void {
    this.http.post(`${BACK_URL}/api/chat/conversations/${convId}/lire`, {})
      .subscribe({ error: () => {} });
  }

  private _ajouterMessageLocal(msg: ChatMessage): void {
    if (!this.contactActif?.id) return;
    this.messages = [...this.messages, msg];
    this.tousMessages[this.contactActif.id] = this.messages;
    this.shouldScroll = true;
  }

  private _toLocalMsg(dto: MessageDTO): ChatMessage {
    const estMoi = dto.senderId === this.moiEmployeeId;
    const nom = dto.senderNom ?? (estMoi ? this.moi.nom : 'Correspondant');
    return {
      id        : dto.messageId,
      auteur    : nom,
      initiales : this._initiales(nom),
      contenu   : dto.isDeleted ? 'Message supprimé' : (dto.content ?? ''),
      heure     : dto.sentAt ? new Date(dto.sentAt) : new Date(),
      estMoi,
      lu           : dto.luParMoi ?? false,
      typeMessage  : dto.type,
      attachmentUrl: dto.attachmentUrl
    };
  }

  private _initiales(nom: string): string {
    return nom.split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private scrollToBottom(): void {
    try {
      if (!this.messagesContainer) return;
      const el = this.messagesContainer.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch { }
  }
}
