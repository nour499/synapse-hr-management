import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BreadcrumbComponent } from 'src/app/theme/shared/components/breadcrumbs/breadcrumbs.component';
import { ConfirmModalComponent } from 'src/app/theme/shared/components/confirm-modal/confirm-modal.component';
import { Notification } from 'src/app/gerai/models/notification.model';
import { NotificationService } from 'src/app/gerai/services/notification.service';
import { NotificationWebSocketService } from 'src/app/gerai/services/notification-websocket.service';
import { tempsRelatif } from 'src/app/gerai/utils/temps-relatif';
import { Subscription } from 'rxjs';
import { UserRole } from 'src/app/gerai/models/user-role.type';

@Component({
  selector: 'app-notifications-chef',
  standalone: true,
  imports: [CommonModule, SharedModule, BreadcrumbComponent, ConfirmModalComponent],
  templateUrl: './notifications-chef.html',
  styleUrls: ['./notifications-chef.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsChef implements OnInit, OnDestroy {
  readonly role: UserRole = 'CHEF';

  private notifService = inject(NotificationService);
  private wsService    = inject(NotificationWebSocketService);
  private router       = inject(Router);
  private cdr          = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  notifications: Notification[] = [];
  filtreActif = 'toutes';
  afficherToast = false;
  derniereNotification: Notification | null = null;
  deleteAllConfirm = false;

  filtres = [
    { value: 'toutes',   label: 'Toutes',  icone: 'ti ti-bell' },
    { value: 'non-lues', label: 'Non lues', icone: 'ti ti-bell-ringing' },
    { value: 'success',  label: 'Succès',  icone: 'ti ti-circle-check' },
    { value: 'warning',  label: 'Alertes', icone: 'ti ti-alert-triangle' },
    { value: 'danger',   label: 'Urgentes', icone: 'ti ti-alert-circle' }
  ];

  ngOnInit(): void {
    this.notifService.load(this.role);
    this.subs.push(
      this.notifService.notifications$.subscribe(ns => {
        this.notifications = ns;
        this.cdr.markForCheck();
      })
    );
    this._connecterWebSocket();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private _connecterWebSocket(): void {
    this.subs.push(
      this.wsService.nouvelleNotification$.subscribe((notif: Notification) => {
        this.derniereNotification = notif;
        this.afficherToast = true;
        this.cdr.markForCheck();
        setTimeout(() => { this.afficherToast = false; this.cdr.markForCheck(); }, 5000);
      })
    );
  }

  get totalNonLues(): number {
    return this.notifications.filter(n => !n.lue).length;
  }

  get notificationsFiltrees(): Notification[] {
    if (this.filtreActif === 'toutes') return this.notifications;
    if (this.filtreActif === 'non-lues') return this.notifications.filter(n => !n.lue);
    return this.notifications.filter(n => n.type === this.filtreActif);
  }

  getNombreParFiltre(filtre: string): number {
    if (filtre === 'toutes') return this.notifications.length;
    if (filtre === 'non-lues') return this.totalNonLues;
    return this.notifications.filter(n => n.type === filtre).length;
  }

  setFiltre(filtre: string): void { this.filtreActif = filtre; }

  marquerLue(notif: Notification): void {
    if (notif.lue) return;
    this.notifService.markAsRead(notif.id).subscribe();
  }

  marquerToutesLues(): void {
    if (this.totalNonLues === 0) return;
    this.notifService.markAllAsRead(this.role).subscribe();
  }

  supprimerNotif(notif: Notification, event: Event): void {
    event.stopPropagation();
    this.notifService.deleteNotification(notif.id).subscribe();
  }

  supprimerToutes(): void {
    if (this.notifications.length === 0) return;
    this.deleteAllConfirm = true;
  }

  confirmDeleteAll(): void {
    this.deleteAllConfirm = false;
    this.notifService.deleteAll(this.role).subscribe();
  }

  ouvrirLien(notif: Notification, event: Event): void {
    event.stopPropagation();
    if (!notif.lue) this.marquerLue(notif);
    if (!notif.lien) return;
    let lien = notif.lien;
    if (!lien.startsWith('/chef')) {
      lien = `/chef${lien.startsWith('/') ? lien : '/' + lien}`;
    }
    this.router.navigate([lien]);
  }

  fermerToast(): void { this.afficherToast = false; }

  tempsRelatif(dateStr: string | Date): string { return tempsRelatif(dateStr); }

  getClasseType(type: string): string { return `notif-${type}`; }

  envoyerNotificationTest(type: Notification['type'] = 'info'): void {
    this.wsService.envoyerNotificationTest(type);
  }
}
