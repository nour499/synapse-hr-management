import { Injectable, OnDestroy, NgZone, inject } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import Keycloak from 'keycloak-js';

import { Notification, BackendNotificationDTO, mapBackendNotification } from 'src/app/gerai/models/notification.model';
import { UserRole } from 'src/app/gerai/models/user-role.type';
import { environment } from 'src/environments/environment';
import {
  NOTIFICATIONS_TEMPLATES,
  NOMS_EMPLOYES,
  PROJETS,
  TACHES
} from 'src/app/mocks/data/notifications.mock';

@Injectable({ providedIn: 'root' })
export class NotificationWebSocketService implements OnDestroy {

  private zone     = inject(NgZone);
  private keycloak = inject(Keycloak);

  readonly nouvelleNotification$ = new Subject<Notification>();
  readonly connecte$             = new Subject<boolean>();

  // ── simulation state ──────────────────────────────────────────
  private simulationSub?: Subscription;
  private nextId = 10_000;

  // ── STOMP state ───────────────────────────────────────────────
  private stomp?: RxStomp;
  private stompSubs: Subscription[] = [];

  private isConnected  = false;
  private roleActif: UserRole | null = null;

  /* ══════════════════════════════════════════════════════════════
     CONNECT — picks the right strategy based on environment flag
     ══════════════════════════════════════════════════════════════ */

  connect(role: UserRole): void {
    if (this.isConnected && this.roleActif === role) return;
    if (this.isConnected) this.disconnect();

    this.roleActif  = role;
    this.isConnected = true;

    environment.mockWs ? this._connectSimulation(role)
                       : this._connectStomp(role);
  }

  /* ──────────────────────────────────────────────────────────────
     STRATEGY A — Simulation (mockWs: true)
     ────────────────────────────────────────────────────────────── */

  private _connectSimulation(role: UserRole): void {
    this.zone.run(() => this.connecte$.next(true));
    console.info(`[NotifWS] 🔌 simulation — topic: notifications.${role.toLowerCase()}`);

    this.simulationSub = interval(45_000).subscribe(() => {
      if (Math.random() < 0.65) {
        this.zone.run(() => this._genererNotification());
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     STRATEGY B — Real STOMP (mockWs: false)
     ────────────────────────────────────────────────────────────── */

  private _connectStomp(role: UserRole): void {
    const config: RxStompConfig = {
      brokerURL: environment.notificationWsUrl,
      connectHeaders: {
        Authorization: `Bearer ${this.keycloak.token ?? ''}`
      },
      reconnectDelay: 5000,
      // refresh token on each reconnect attempt
      beforeConnect: async (client) => {
        try {
          await this.keycloak.updateToken(30);
          client.configure({
            connectHeaders: { Authorization: `Bearer ${this.keycloak.token ?? ''}` }
          });
        } catch { /* token refresh failed — let Keycloak handle redirect */ }
      }
    };

    this.stomp = new RxStomp();
    this.stomp.configure(config);
    this.stomp.activate();

    // connection state
    this.stompSubs.push(
      this.stomp.connected$.subscribe(() => {
        this.zone.run(() => this.connecte$.next(true));
        console.info(`[NotifWS] 🔌 STOMP connected`);
      })
    );

    const parse = (body: string): Notification => {
      const raw = JSON.parse(body);
      // handle both backend DTO format and already-mapped frontend format
      return 'notificationId' in raw ? mapBackendNotification(raw as BackendNotificationDTO) : raw as Notification;
    };

    // personal channel  → /user/queue/notifications
    this.stompSubs.push(
      this.stomp.watch('/user/queue/notifications').subscribe(msg => {
        this.zone.run(() => this.nouvelleNotification$.next(parse(msg.body)));
      })
    );

    // role broadcast → /topic/notifications.chef  or  .employe
    this.stompSubs.push(
      this.stomp.watch(`/topic/notifications.${role.toLowerCase()}`).subscribe(msg => {
        this.zone.run(() => this.nouvelleNotification$.next(parse(msg.body)));
      })
    );
  }

  /* ══════════════════════════════════════════════════════════════
     DISCONNECT
     ══════════════════════════════════════════════════════════════ */

  disconnect(): void {
    // simulation cleanup
    this.simulationSub?.unsubscribe();
    this.simulationSub = undefined;

    // STOMP cleanup
    this.stompSubs.forEach(s => s.unsubscribe());
    this.stompSubs = [];
    this.stomp?.deactivate();
    this.stomp = undefined;

    this.isConnected = false;
    this.roleActif   = null;
    this.zone.run(() => this.connecte$.next(false));
  }

  ngOnDestroy(): void { this.disconnect(); }

  /* ══════════════════════════════════════════════════════════════
     SIMULATION HELPERS  (only used when mockWs: true)
     ══════════════════════════════════════════════════════════════ */

  private _genererNotification(): void {
    if (!this.roleActif) return;
    const pool = NOTIFICATIONS_TEMPLATES.filter(t => !t.role || t.role === this.roleActif);
    if (!pool.length) return;
    const template = pool[Math.floor(Math.random() * pool.length)];
    const detail   = this._resolveDetail(template.titre);
    this.nouvelleNotification$.next({
      id:      this.nextId++,
      titre:   template.titre,
      message: template.message(detail),
      type:    template.type,
      icone:   template.icone,
      heure:   new Date().toISOString(),
      lue:     false,
      lien:    template.lien ?? null,
      role:    template.role ?? this.roleActif
    });
  }

  private _resolveDetail(titre: string): string {
    const lower = titre.toLowerCase();
    if (lower.includes('projet'))  return PROJETS[Math.floor(Math.random() * PROJETS.length)];
    if (lower.includes('tâche'))   return TACHES[Math.floor(Math.random() * TACHES.length)];
    return NOMS_EMPLOYES[Math.floor(Math.random() * NOMS_EMPLOYES.length)];
  }

  /* dev helper — call from browser console */
  envoyerNotificationTest(type: Notification['type'] = 'info'): void {
    if (!this.roleActif) return;
    const pool = NOTIFICATIONS_TEMPLATES.filter(
      t => (!t.role || t.role === this.roleActif) && t.type === type
    );
    if (!pool.length) return;
    const t = pool[0];
    this.zone.run(() => this.nouvelleNotification$.next({
      id:      this.nextId++,
      titre:   t.titre,
      message: t.message('Utilisateur Test'),
      type:    t.type,
      icone:   t.icone,
      heure:   new Date().toISOString(),
      lue:     false,
      lien:    t.lien ?? null,
      role:    t.role ?? this.roleActif!
    }));
  }
}
