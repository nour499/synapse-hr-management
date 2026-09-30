import {
  Component, OnInit, OnDestroy, inject, ElementRef,
  ChangeDetectorRef, ChangeDetectionStrategy,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription, catchError, of } from 'rxjs';
import { NotificationWebSocketService } from 'src/app/gerai/services/notification-websocket.service';
import { DemandeService } from 'src/app/gerai/services/demande.service';

import {
  Demande, TypeDemande, StatutDemande,
  TYPES_DEMANDE_CONFIG, TypeDemandeConfig
} from 'src/app/gerai/models/demande.model';

const STATUT_ORDER: Record<string, number> = {
  EN_ATTENTE        : 0,
  EN_ETUDE_MEDICALE : 0,
  VALIDEE_CHEF      : 1,
  EN_ETUDE_DG       : 2,
  VALIDEE_DG        : 3,
  VALIDEE           : 4,
  VALIDEE_RH        : 4,
  REJETEE           : 5
};

@Component({
  selector   : 'app-demandes-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './demandes-admin.component.html',
  styleUrls  : ['./demandes-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemandesAdminComponent implements OnInit, OnDestroy, AfterViewChecked {

  private http     = inject(HttpClient);
  private fb       = inject(FormBuilder);
  private cdr      = inject(ChangeDetectorRef);
  private el       = inject(ElementRef);
  private notifWs  = inject(NotificationWebSocketService);
  private demandeService = inject(DemandeService);
  private notifSub?: Subscription;

  readonly dgForm = this.fb.group({
    montantApprouve: [null as number | null, [Validators.required, Validators.min(0)]],
    nbTranches:      [null as number | null, [Validators.required, Validators.min(1)]],
    commentaire:      ['']
  });

  private drawerWasOpen = false;

  demandes : Demande[] = [];
  loading  = true;
  saving   = false;

  // ── Filters ──────────────────────────────────────
  search      = '';
  filterStatut: string       = '';
  filterType  : TypeDemande | '' = '';

  // ── Panels ───────────────────────────────────────
  detailItem   : Demande | null = null;
  rejectTarget : Demande | null = null;
  approveTarget: Demande | null = null;
  dgTarget     : Demande | null = null;

  // ── Lookup ───────────────────────────────────────
  readonly typesConfig = TYPES_DEMANDE_CONFIG;

  readonly statutLabels: Record<string, string> = {
    EN_ATTENTE        : 'En attente',
    VALIDEE_CHEF      : 'Validée chef',
    EN_ETUDE_DG       : 'En étude comité',
    VALIDEE_DG        : 'Approuvée comité',
    VALIDEE_RH        : 'Approuvée RH',
    VALIDEE           : 'Validée',
    REJETEE           : 'Rejetée',
    ANNULEE           : 'Annulée',
    EN_ETUDE_MEDICALE : 'Comité médical'
  };

  private static readonly CHIP_MAP: Record<string, {cls: string; icon: string; label: string}> = {
    EN_ATTENTE        : { cls: 'sc-pending',   icon: 'ti ti-clock',        label: 'En attente' },
    VALIDEE_CHEF      : { cls: 'sc-chef',      icon: 'ti ti-circle-check', label: 'Validée chef' },
    VALIDEE_RH        : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Approuvée RH' },
    VALIDEE           : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Validée' },
    REJETEE           : { cls: 'sc-rejected',  icon: 'ti ti-circle-x',     label: 'Rejetée' },
    EN_ETUDE_DG       : { cls: 'sc-study',     icon: 'ti ti-building',     label: 'Étude comité' },
    VALIDEE_DG        : { cls: 'sc-committee', icon: 'ti ti-circle-check', label: 'Approuvée comité' },
    EN_ETUDE_MEDICALE : { cls: 'sc-medical',   icon: 'ti ti-activity',     label: 'Comité médical' },
    ANNULEE           : { cls: 'sc-cancelled', icon: 'ti ti-ban',          label: 'Annulée' },
  };

  statutChip(statut: string) {
    return DemandesAdminComponent.CHIP_MAP[statut]
      ?? { cls: 'sc-cancelled', icon: 'ti ti-dots', label: statut };
  }

  // ── Reject form ───────────────────────────────────
  rejectForm = this.fb.group({
    motif: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.loadDemandes();

    this.notifSub = this.notifWs.nouvelleNotification$.subscribe(() => {
      this.loadDemandes();
    });
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  private loadDemandes(): void {
    this.http.get<Demande[]>('/api/demandes/toutes')
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.demandes = list;
        this.loading  = false;
        this.cdr.markForCheck();
      });
  }

  private typeSegment(type: TypeDemande): string {
    const map: Record<string, string> = {
      // Leave types (all route to /conge endpoint)
      CONGE: 'conge', MALADIE: 'conge', ANNUEL: 'conge', RTT: 'conge', SANS_SOLDE: 'conge',
      FAMILIAL: 'conge', HAJJ: 'conge', MATERNITE: 'conge', POSTNATAL: 'conge',
      ALLAITEMENT: 'conge', LONGUE_MALADIE: 'conge', NAISSANCE_PERE: 'conge',
      CREATION_ENTREPRISE: 'conge', OBLIGATIONS_LEGALES: 'conge',
      // Other request types — backend enum value first, frontend alias second
      FORMATION: 'formation',
      PRET: 'pret', CREDIT: 'pret',
      DOCUMENT: 'document', DOCUMENT_ADMINISTRATIF: 'document',
      AUTORISATION: 'autorisation', AUTRE: 'autorisation'
    };
    return map[type as string] ?? 'conge';
  }

  // ── Computed ─────────────────────────────────────
  private static readonly VALIDEE_GROUP = new Set(['VALIDEE', 'VALIDEE_CHEF', 'VALIDEE_RH']);

  get filtered(): Demande[] {
    const q = this.search.toLowerCase().trim();
    return this.demandes
      .filter(d => {
        const matchSearch = !q
          || `${d.employePrenom} ${d.employeNom}`.toLowerCase().includes(q)
          || d.description.toLowerCase().includes(q);
        const matchStatut = !this.filterStatut
          || (this.filterStatut === 'VALIDEE'
              ? DemandesAdminComponent.VALIDEE_GROUP.has(d.statut as string)
              : d.statut === this.filterStatut);
        const matchType   = !this.filterType   || d.type === this.filterType;
        return matchSearch && matchStatut && matchType;
      })
      .sort((a, b) => (STATUT_ORDER[a.statut] ?? 9) - (STATUT_ORDER[b.statut] ?? 9));
  }

  get kpi() {
    return {
      total       : this.demandes.length,
      enAttente   : this.demandes.filter(d => d.statut === 'EN_ATTENTE').length,
      enAttenteDg : this.demandes.filter(d => d.statut === 'EN_ETUDE_DG').length,
      validees    : this.demandes.filter(d => ['VALIDEE_CHEF','VALIDEE_RH','VALIDEE'].includes(d.statut as string)).length,
      rejetees    : this.demandes.filter(d => d.statut === 'REJETEE').length
    };
  }

  typeConfig(type: TypeDemande): TypeDemandeConfig {
    return this.typesConfig.find(c => c.type === type)
      ?? { type, label: type, icon: 'ti ti-dots', color: '#64748B', requiresDates: false };
  }

  isPending(d: Demande): boolean {
    // PRET/CREDIT in EN_ETUDE_DG: only committee can act — blocked for RH
    if ((d.type === 'PRET' || d.type === 'CREDIT') && d.statut === 'EN_ETUDE_DG') return false;
    // PRET/CREDIT in VALIDEE_DG: committee approved, RH must do final validation
    if ((d.type === 'PRET' || d.type === 'CREDIT') && d.statut === 'VALIDEE_DG') return true;
    return d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF';
  }

  isCreditForDg(d: Demande): boolean {
    return (d.type === 'PRET' || d.type === 'CREDIT') && d.statut === 'EN_ETUDE_DG';
  }

  // ── Detail drawer ─────────────────────────────────
  openDetail(d: Demande): void {
    this.detailItem = d;
    this.cdr.markForCheck();
  }
  closeDetail(): void { this.detailItem = null; this.cdr.markForCheck(); }

  // ── Approve ──────────────────────────────────────
  openApprove(d: Demande): void {
    this.approveTarget = d;
    this.detailItem    = null;
    this.cdr.markForCheck();
  }
  cancelApprove(): void { this.approveTarget = null; this.cdr.markForCheck(); }

  confirmApprove(): void {
    if (!this.approveTarget) return;
    const id  = this.approveTarget.id;
    const seg = this.typeSegment(this.approveTarget.type);
    this.saving        = true;
    this.approveTarget = null;
    this.cdr.markForCheck();
    this.http.put<Demande>(`/api/demandes/${seg}/${id}/valider`, { nouveauStatut: 'VALIDEE_RH' })
      .pipe(catchError(() => of(null)))
      .subscribe(result => {
        if (result) this.updateLocal(result);
        this.saving = false;
        this.cdr.markForCheck();
      });
  }

  // ── Reject ───────────────────────────────────────
  openReject(d: Demande): void {
    this.rejectTarget = d;
    this.detailItem   = null;
    this.rejectForm.reset();
    this.cdr.markForCheck();
  }
  cancelReject(): void { this.rejectTarget = null; this.cdr.markForCheck(); }

  // ── Décision Direction RH (crédit en EN_ETUDE_DG) ───────
  openDg(d: Demande): void {
    if (!this.isCreditForDg(d)) return;
    this.dgTarget     = d;
    this.detailItem   = null;
    this.dgForm.reset({ montantApprouve: null, nbTranches: null, commentaire: '' });
    this.cdr.markForCheck();
  }
  cancelDg(): void { this.dgTarget = null; this.cdr.markForCheck(); }

  confirmDg(approuve: boolean): void {
    if (!this.dgTarget) return;
    if (approuve && this.dgForm.invalid) {
      this.dgForm.markAllAsTouched();
      return;
    }
    const id = this.dgTarget.id;
    const v  = this.dgForm.value;
    this.saving    = true;
    this.dgTarget  = null;
    this.cdr.markForCheck();
    this.demandeService.directionDecision(id, {
      approuve,
      montantApprouve: approuve ? (v.montantApprouve ?? undefined) : undefined,
      nbTranches:      approuve ? (v.nbTranches ?? undefined)      : undefined,
      commentaire:     v.commentaire || undefined
    }).pipe(catchError(() => of(null)))
      .subscribe(result => {
        if (result) this.updateLocal(result);
        this.saving = false;
        this.cdr.markForCheck();
      });
  }

  hasDgError(field: string): boolean {
    const c = this.dgForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  confirmReject(): void {
    if (this.rejectForm.invalid || !this.rejectTarget) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    const id    = this.rejectTarget.id;
    const motif = this.rejectForm.value.motif!;
    const seg   = this.typeSegment(this.rejectTarget.type);
    this.saving      = true;
    this.rejectTarget = null;
    this.cdr.markForCheck();
    this.http.put<Demande>(`/api/demandes/${seg}/${id}/valider`, { nouveauStatut: 'REJETEE', commentaire: motif })
      .pipe(catchError(() => of(null)))
      .subscribe(result => {
        if (result) this.updateLocal(result);
        this.saving = false;
        this.cdr.markForCheck();
      });
  }

  // ── Helpers ──────────────────────────────────────
  private updateLocal(updated: Demande): void {
    const idx = this.demandes.findIndex(d => d.id === updated.id);
    if (idx !== -1) this.demandes = [...this.demandes.slice(0, idx), updated, ...this.demandes.slice(idx + 1)];
  }

  setSearch(q: string): void               { this.search       = q; this.cdr.markForCheck(); }
  setStatut(s: string): void               { this.filterStatut = s; this.cdr.markForCheck(); }
  setType(t: TypeDemande | ''): void        { this.filterType   = t; this.cdr.markForCheck(); }

  initiales(nom: string, prenom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  hasRejectError(): boolean {
    const c = this.rejectForm.get('motif');
    return !!(c?.invalid && c?.touched);
  }

  // ─── Focus management ────────────────────────────────
  ngAfterViewChecked(): void {
    const drawerOpen = !!this.detailItem;
    if (drawerOpen && !this.drawerWasOpen) {
      const drawer = this.el.nativeElement.querySelector('[role="dialog"]') as HTMLElement | null;
      drawer?.focus();
    }
    this.drawerWasOpen = drawerOpen;
  }

  handleDrawerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDetail();
      return;
    }
    if (event.key !== 'Tab') return;

    const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const panel     = event.currentTarget as HTMLElement;
    const nodes     = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!nodes.length) return;

    const first = nodes[0];
    const last  = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
