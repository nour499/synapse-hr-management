import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of, switchMap, interval, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/gerai/services/auth.service';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';

import {
  Actif, DemandeActif, TypeDemandeActif, UrgenceDemandeActif,
  ALL_TYPE_LABELS, ALL_TYPE_ICONS,
  STATUT_DEMANDE_ACTIF_LABELS, STATUT_DEMANDE_ACTIF_COLORS
} from 'src/app/gerai/models/actif.model';

const BASE = '/api/actifs';

@Component({
  selector   : 'app-mes-actifs',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './mes-actifs.component.html',
  styleUrls  : ['./mes-actifs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MesActifsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  private http          = inject(HttpClient);
  private fb            = inject(FormBuilder);
  private cdr           = inject(ChangeDetectorRef);
  private auth          = inject(AuthService);
  private profilService = inject(ProfilEmployeService);

  private employeId = 0;

  actifs          : Actif[]         = [];
  demandes        : DemandeActif[]  = [];
  loading         = true;
  saving          = false;
  refreshing      = false;

  // Modal state
  showModal       = false;
  modalActif      : Actif | null    = null;
  modalType       : TypeDemandeActif = 'REPARATION';

  readonly typeLabels   = ALL_TYPE_LABELS;
  readonly typeIcons    = ALL_TYPE_ICONS;
  readonly statutLabels = STATUT_DEMANDE_ACTIF_LABELS;
  readonly statutColors = STATUT_DEMANDE_ACTIF_COLORS;

  form = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
    urgence    : ['NORMALE' as UrgenceDemandeActif, Validators.required],
  });

  ngOnInit(): void {
    this.profilService.getDbProfile()
      .pipe(switchMap(profile => {
        this.employeId = profile.dbId;
        return forkJoin({
          actifs  : this.http.get<Actif[]>(`${BASE}`).pipe(catchError(() => of([]))),
          demandes: this.http.get<DemandeActif[]>(`${BASE}/demandes?employeId=${this.employeId}`).pipe(catchError(() => of([])))
        });
      }))
      .subscribe(({ actifs, demandes }) => {
        this.actifs   = actifs;
        this.demandes = demandes;
        this.loading  = false;
        this.cdr.markForCheck();

        // Poll for status updates every 30 s
        interval(30_000).pipe(takeUntil(this.destroy$)).subscribe(() => this.refreshDemandes());
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  refreshDemandes(): void {
    this.refreshing = true;
    this.http.get<DemandeActif[]>(`${BASE}/demandes?employeId=${this.employeId}`)
      .pipe(catchError(() => of(this.demandes)))
      .subscribe(demandes => {
        this.demandes  = demandes;
        this.refreshing = false;
        this.cdr.markForCheck();
      });
  }

  // ── Helpers ──────────────────────────────────────────────
  isExpiringSoon(a: Actif): boolean {
    if (!a.dateExpiration) return false;
    const days = (new Date(a.dateExpiration).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 30;
  }

  isExpired(a: Actif): boolean {
    if (!a.dateExpiration) return false;
    return new Date(a.dateExpiration) < new Date();
  }

  daysUntilExpiry(a: Actif): number {
    if (!a.dateExpiration) return 999;
    return Math.ceil((new Date(a.dateExpiration).getTime() - Date.now()) / 86_400_000);
  }

  // Used for the status badge — shows any demande regardless of status
  demandeForActif(actifId: number): DemandeActif | undefined {
    return this.demandes
      .filter(d => d.actifId === actifId)
      .sort((a, b) => new Date(b.dateCreation ?? '').getTime() - new Date(a.dateCreation ?? '').getTime())[0];
  }

  // Used to hide the report button — only when there is an open/in-progress demande
  hasActiveDemande(actifId: number): boolean {
    return this.demandes.some(d => d.actifId === actifId && ['EN_ATTENTE', 'EN_COURS'].includes(d.statut));
  }

  get tangibles(): Actif[]  { return this.actifs.filter(a => a.categorie === 'TANGIBLE'); }
  get numeriques(): Actif[] { return this.actifs.filter(a => a.categorie === 'NUMERIQUE'); }

  get pendingCount(): number {
    return this.demandes.filter(d => ['EN_ATTENTE', 'EN_COURS'].includes(d.statut)).length;
  }

  // ── Modal ────────────────────────────────────────────────
  openModal(actif: Actif, type: TypeDemandeActif): void {
    this.modalActif = actif;
    this.modalType  = type;
    this.form.reset({ description: '', urgence: 'NORMALE' });
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal  = false;
    this.modalActif = null;
    this.cdr.markForCheck();
  }

  submit(): void {
    if (!this.modalActif || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.form.value;
    const payload: Partial<DemandeActif> = {
      actifId    : this.modalActif.id,
      actifNom   : this.modalActif.nom,
      actifType  : this.modalActif.type,
      employeId  : this.employeId,
      employeNom : this.auth.fullName,
      type       : this.modalType,
      description: v.description!,
      urgence    : v.urgence as UrgenceDemandeActif,
    };

    this.http.post<DemandeActif>(`${BASE}/demandes`, payload)
      .pipe(catchError(() => of(null)))
      .subscribe(d => {
        this.saving = false;
        if (d) this.demandes = [...this.demandes, d];
        this.closeModal();
        this.cdr.markForCheck();
      });
  }
}
