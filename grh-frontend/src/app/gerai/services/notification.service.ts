import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { Notification, BackendNotificationDTO, mapBackendNotification } from '../models/notification.model';
import { UserRole } from '../models/user-role.type';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  private _notifs = new BehaviorSubject<Notification[]>([]);
  readonly notifications$ = this._notifs.asObservable();
  readonly unreadCount$ = this._notifs.pipe(
    map(ns => ns.filter(n => !n.lue).length),
    distinctUntilChanged()
  );

  load(_role?: UserRole): void {
    this.http.get<BackendNotificationDTO[]>('/api/notifications').pipe(
      map(dtos => dtos.map(mapBackendNotification))
    ).subscribe({
      next: serverNotifs => {
        // Merge: keep any in-memory notifications not yet returned by server
        // (e.g. WS-pushed ones arriving between saves and this REST call)
        const serverIds = new Set(serverNotifs.map(n => n.id));
        const localOnly = this._notifs.value.filter(n => !serverIds.has(n.id));
        this._notifs.next([...serverNotifs, ...localOnly]);
      },
      error: () => {}
    });
  }

  push(notif: Notification): void {
    // Deduplicate: skip if a notification with the same positive DB id already exists
    if (notif.id && this._notifs.value.some(n => n.id === notif.id)) return;
    this._notifs.next([notif, ...this._notifs.value]);
  }

  markAsRead(id: number): Observable<void> {
    this._notifs.next(this._notifs.value.map(n => n.id === id ? { ...n, lue: true } : n));
    return this.http.patch<void>(`/api/notifications/${id}/read`, {}).pipe(
      catchError(() => of(undefined))
    );
  }

  markAllAsRead(_role?: UserRole): Observable<void> {
    this._notifs.next(this._notifs.value.map(n => ({ ...n, lue: true })));
    return this.http.post<void>('/api/notifications/mark-all-read', {}).pipe(
      catchError(() => of(undefined))
    );
  }

  deleteNotification(id: number): Observable<void> {
    this._notifs.next(this._notifs.value.filter(n => n.id !== id));
    return this.http.delete<void>(`/api/notifications/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }

  deleteAll(_role?: UserRole): Observable<void> {
    this._notifs.next([]);
    return this.http.delete<void>('/api/notifications').pipe(
      catchError(() => of(undefined))
    );
  }
}
