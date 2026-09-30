import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DemandeRecrutement, StatutDemandeRec,
  URGENCE_LABELS, STATUT_REC_LABELS
} from 'src/app/gerai/models/demande-recrutement.model';
import { JOB_ROLE_LABELS, JOB_TYPE_LABELS } from 'src/app/gerai/models/job.model';
import { Job } from 'src/app/gerai/models/job.model';
import { AuthService } from 'src/app/gerai/services/auth.service';

@Component({
  selector   : 'app-recrutement-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './recrutement-admin.component.html',
  styleUrls  : ['./recrutement-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecrutementAdminComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  demandes  : DemandeRecrutement[] = [];
  loading    = true;
  saving     = false;

  filterStatut: StatutDemandeRec | '' = '';
  search = '';

  detailItem   : DemandeRecrutement | null = null;
  approveTarget: DemandeRecrutement | null = null;
  rejectTarget : DemandeRecrutement | null = null;
  lastCreatedJob: Job | null = null;
  errorMsg: string | null = null;

  readonly urgenceLabels = URGENCE_LABELS;
  readonly statutLabels  = STATUT_REC_LABELS;
  readonly roleLabels    = JOB_ROLE_LABELS;
  readonly typeLabels    = JOB_TYPE_LABELS;

  readonly allStatuts: (StatutDemandeRec | '')[] = ['','EN_ATTENTE','APPROUVEE','REJETEE','CONVERTIE'];

  rejectForm = this.fb.group({
    motif: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.http.get<DemandeRecrutement[]>('/api/chef/recrutement')
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.demandes = list.sort((a, b) => {
          const order: Record<string, number> = { EN_ATTENTE: 0, APPROUVEE: 1, CONVERTIE: 2, REJETEE: 3 };
          return (order[a.statut] ?? 9) - (order[b.statut] ?? 9)
            || b.dateDemande.localeCompare(a.dateDemande);
        });
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  get filtered(): DemandeRecrutement[] {
    const q = this.search.toLowerCase().trim();
    return this.demandes.filter(d => {
      const matchQ = !q
        || d.titrePoste.toLowerCase().includes(q)
        || d.chefNom.toLowerCase().includes(q)
        || d.departement.toLowerCase().includes(q);
      const matchS = !this.filterStatut || d.statut === this.filterStatut;
      return matchQ && matchS;
    });
  }

  get kpi() {
    return {
      total    : this.demandes.length,
      enAttente: this.demandes.filter(d => d.statut === 'EN_ATTENTE').length,
      converties: this.demandes.filter(d => d.statut === 'CONVERTIE').length,
      rejetees : this.demandes.filter(d => d.statut === 'REJETEE').length
    };
  }

  isPending(d: DemandeRecrutement): boolean { return d.statut === 'EN_ATTENTE'; }

  // ── Detail ───────────────────────────────────────
  openDetail(d: DemandeRecrutement): void { this.detailItem = d; this.cdr.markForCheck(); }
  closeDetail(): void { this.detailItem = null; this.cdr.markForCheck(); }

  // ── Approve → convert ────────────────────────────
  openApprove(d: DemandeRecrutement): void {
    this.approveTarget = d;
    this.detailItem    = null;
    this.cdr.markForCheck();
  }
  cancelApprove(): void { this.approveTarget = null; this.cdr.markForCheck(); }

  confirmApprove(): void {
    if (!this.approveTarget) return;
    const id = this.approveTarget.id;
    this.saving        = true;
    this.errorMsg      = null;
    this.approveTarget = null;
    this.cdr.markForCheck();

    this.http.post<DemandeRecrutement>(
      `/api/chef/recrutement/${id}/convertir`,
      { traiteePar: this.auth.fullName }
    ).pipe(catchError(err => {
      this.errorMsg = err?.error?.message ?? 'Erreur lors de l\'approbation.';
      return of(null);
    })).subscribe(result => {
      if (result) {
        this.updateLocal(result);
        this.lastCreatedJob = { titre: result.titrePoste } as Job;
      }
      this.saving = false;
      this.cdr.detectChanges();
    });
  }

  dismissJobNotice(): void { this.lastCreatedJob = null; this.cdr.markForCheck(); }

  // ── Reject ───────────────────────────────────────
  openReject(d: DemandeRecrutement): void {
    this.rejectTarget = d;
    this.detailItem   = null;
    this.rejectForm.reset();
    this.cdr.markForCheck();
  }
  cancelReject(): void { this.rejectTarget = null; this.cdr.markForCheck(); }

  confirmReject(): void {
    if (this.rejectForm.invalid || !this.rejectTarget) {
      this.rejectForm.markAllAsTouched(); return;
    }
    const id    = this.rejectTarget.id;
    const motif = this.rejectForm.value.motif!;
    this.saving       = true;
    this.errorMsg     = null;
    this.rejectTarget = null;
    this.cdr.markForCheck();

    this.http.put<DemandeRecrutement>(
      `/api/chef/recrutement/${id}/rejeter`,
      { motif, traiteePar: this.auth.fullName }
    ).pipe(catchError(err => {
      this.errorMsg = err?.error?.message ?? 'Erreur lors du rejet.';
      return of(null);
    })).subscribe(result => {
      if (result) this.updateLocal(result);
      this.saving = false;
      this.cdr.detectChanges();
    });
  }

  // ── Helpers ──────────────────────────────────────
  private updateLocal(updated: DemandeRecrutement): void {
    const idx = this.demandes.findIndex(d => d.id === updated.id);
    if (idx !== -1)
      this.demandes = [...this.demandes.slice(0, idx), updated, ...this.demandes.slice(idx + 1)];
  }

  setSearch(q: string): void                    { this.search       = q; this.cdr.markForCheck(); }
  setStatut(s: StatutDemandeRec | ''): void     { this.filterStatut = s; this.cdr.markForCheck(); }

  clearError(): void { this.errorMsg = null; this.cdr.markForCheck(); }

  hasRejectError(): boolean {
    const c = this.rejectForm.get('motif');
    return !!(c?.invalid && c?.touched);
  }

  initiales(nom: string): string {
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }
}
