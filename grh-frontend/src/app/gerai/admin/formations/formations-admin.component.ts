import {
  Component, OnInit, inject, ElementRef,
  ChangeDetectorRef, ChangeDetectionStrategy,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DemandeFormation, StatutFormation,
  STATUT_FORMATION_LABELS, STATUT_FORMATION_COLORS,
  TYPE_FORMATION_LABELS, MODE_FORMATION_LABELS,
  FORMATION_STEPS
} from 'src/app/gerai/models/formation.model';
import { AuthService } from 'src/app/gerai/services/auth.service';

type DrawerMode = 'detail' | 'rh-decision' | 'planifier' | 'completer';

@Component({
  selector   : 'app-formations-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './formations-admin.component.html',
  styleUrls  : ['./formations-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormationsAdminComponent implements OnInit, AfterViewChecked {

  private http    = inject(HttpClient);
  private fb      = inject(FormBuilder);
  private el      = inject(ElementRef);
  cdr             = inject(ChangeDetectorRef);
  private auth    = inject(AuthService);

  private drawerWasOpen = false;

  formations  : DemandeFormation[] = [];
  loading     = true;
  submitting  = false;

  selected    : DemandeFormation | null = null;
  drawerMode  : DrawerMode = 'detail';
  filterStatut: string = '';
  searchTerm  : string = '';

  readonly statutLabels   = STATUT_FORMATION_LABELS;
  readonly statutColors   = STATUT_FORMATION_COLORS;
  readonly typeLabels     = TYPE_FORMATION_LABELS;
  readonly modeLabels     = MODE_FORMATION_LABELS;
  readonly formationSteps = FORMATION_STEPS;

  readonly filterOptions = [
    { value: '',              label: 'Tous' },
    { value: 'EN_ATTENTE',   label: 'En attente chef' },
    { value: 'APPROUVE_CHEF',label: 'À valider RH' },
    { value: 'APPROUVE_RH',  label: 'À planifier' },
    { value: 'PLANIFIEE',    label: 'Planifiées' },
    { value: 'EN_COURS',     label: 'En cours' },
    { value: 'COMPLETEE',    label: 'Complétées' },
    { value: 'REJETE_CHEF',  label: 'Rejetées chef' },
    { value: 'REJETE_RH',    label: 'Rejetées RH' },
    { value: 'ANNULEE',      label: 'Annulées' },
  ];

  rhForm = this.fb.group({
    decision    : ['APPROUVE_RH', Validators.required],
    commentaire : [''],
  });

  planForm = this.fb.group({
    dateDebutReelle : ['', Validators.required],
    dateFinReelle   : ['', Validators.required],
    lieu            : [''],
  });

  completerForm = this.fb.group({
    certificatObtenu : [false],
    evaluation       : [null as number | null],
    noteEvaluation   : [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<DemandeFormation[]>('/api/formations')
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.formations = data;
        this.loading    = false;
        this.cdr.detectChanges();
      });
  }

  get filtered(): DemandeFormation[] {
    let list = this.formations;
    if (this.filterStatut) list = list.filter(f => f.statut === this.filterStatut);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(f =>
        f.titre.toLowerCase().includes(q) ||
        f.employeNom.toLowerCase().includes(q) ||
        f.employePrenom.toLowerCase().includes(q) ||
        f.organisme.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get stats() {
    return {
      total      : this.formations.length,
      enAttente  : this.formations.filter(f => f.statut === 'EN_ATTENTE').length,
      aValiderRH : this.formations.filter(f => f.statut === 'APPROUVE_CHEF').length,
      planifiees : this.formations.filter(f => f.statut === 'PLANIFIEE').length,
      enCours    : this.formations.filter(f => f.statut === 'EN_COURS').length,
      completees : this.formations.filter(f => f.statut === 'COMPLETEE').length,
    };
  }

  // ─── Drawer ─────────────────────────────────────────
  openDetail(f: DemandeFormation): void {
    this.selected   = f;
    this.drawerMode = 'detail';
    this.cdr.markForCheck();
  }

  openRhDecision(f: DemandeFormation): void {
    this.selected   = f;
    this.drawerMode = 'rh-decision';
    this.rhForm.reset({ decision: 'APPROUVE_RH', commentaire: '' });
    this.cdr.markForCheck();
  }

  openPlanifier(f: DemandeFormation): void {
    this.selected   = f;
    this.drawerMode = 'planifier';
    this.planForm.reset({
      dateDebutReelle: f.dateDebutSouhaitee ?? '',
      dateFinReelle  : f.dateFinSouhaitee   ?? '',
      lieu           : f.lieu               ?? '',
    });
    this.cdr.markForCheck();
  }

  openCompleter(f: DemandeFormation): void {
    this.selected   = f;
    this.drawerMode = 'completer';
    this.completerForm.reset({ certificatObtenu: false, evaluation: null, noteEvaluation: '' });
    this.cdr.markForCheck();
  }

  closeDrawer(): void { this.selected = null; this.cdr.markForCheck(); }

  // ─── Actions ────────────────────────────────────────
  submitRhDecision(): void {
    if (!this.selected || this.rhForm.invalid) return;
    this.submitting = true;
    const { decision, commentaire } = this.rhForm.value;

    this.http.put<DemandeFormation>(
      `/api/formations/${this.selected.id}/rh-decision`,
      { decision, commentaire, traiteeParRh: this.auth.fullName }
    ).pipe(catchError(() => of(null)))
     .subscribe(updated => {
        this.submitting = false;
        if (updated) this.replaceInList(updated);
        this.selected = null;
        this.cdr.detectChanges();
     });
  }

  submitPlanifier(): void {
    if (!this.selected || this.planForm.invalid) return;
    this.submitting = true;
    const v = this.planForm.value;

    this.http.put<DemandeFormation>(
      `/api/formations/${this.selected.id}/planifier`,
      { dateDebutReelle: v.dateDebutReelle, dateFinReelle: v.dateFinReelle, lieu: v.lieu || undefined }
    ).pipe(catchError(() => of(null)))
     .subscribe(updated => {
        this.submitting = false;
        if (updated) this.replaceInList(updated);
        this.selected = null;
        this.cdr.detectChanges();
     });
  }

  demarrer(f: DemandeFormation): void {
    this.http.put<DemandeFormation>(`/api/formations/${f.id}/demarrer`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        if (updated) this.replaceInList(updated);
        this.selected = null;
        this.cdr.detectChanges();
      });
  }

  submitCompleter(): void {
    if (!this.selected) return;
    this.submitting = true;
    const v = this.completerForm.value;

    this.http.put<DemandeFormation>(
      `/api/formations/${this.selected.id}/completer`,
      { certificatObtenu: v.certificatObtenu, evaluation: v.evaluation, noteEvaluation: v.noteEvaluation || undefined }
    ).pipe(catchError(() => of(null)))
     .subscribe(updated => {
        this.submitting = false;
        if (updated) this.replaceInList(updated);
        this.selected = null;
        this.cdr.detectChanges();
     });
  }

  annuler(f: DemandeFormation): void {
    if (!confirm('Annuler cette formation ?')) return;
    this.http.put<DemandeFormation>(`/api/formations/${f.id}/annuler`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        if (updated) this.replaceInList(updated);
        this.selected = null;
        this.cdr.detectChanges();
      });
  }

  private replaceInList(updated: DemandeFormation): void {
    const idx = this.formations.findIndex(f => f.id === updated.id);
    if (idx >= 0) this.formations[idx] = updated;
  }

  // ─── Helpers ────────────────────────────────────────
  canRhDecide(f: DemandeFormation)   : boolean { return f.statut === 'APPROUVE_CHEF'; }
  canPlanifier(f: DemandeFormation)  : boolean { return f.statut === 'APPROUVE_RH'; }
  canDemarrer(f: DemandeFormation)   : boolean { return f.statut === 'PLANIFIEE'; }
  canCompleter(f: DemandeFormation)  : boolean { return f.statut === 'EN_COURS'; }
  canAnnuler(f: DemandeFormation)    : boolean { return !['COMPLETEE','ANNULEE'].includes(f.statut); }

  stepIndex(statut: StatutFormation): number {
    return this.formationSteps.findIndex(s => s.statut === statut);
  }

  starArray(n: number): number[] { return Array.from({ length: n }); }

  onSearch(val: string): void { this.searchTerm = val; this.cdr.markForCheck(); }
  onFilter(val: string): void { this.filterStatut = val; this.cdr.markForCheck(); }

  // ─── Focus management ────────────────────────────────
  ngAfterViewChecked(): void {
    const drawerOpen = !!this.selected;
    if (drawerOpen && !this.drawerWasOpen) {
      const drawer = this.el.nativeElement.querySelector('[role="dialog"]') as HTMLElement | null;
      drawer?.focus();
    }
    this.drawerWasOpen = drawerOpen;
  }

  handleDrawerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;

    const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const panel     = event.currentTarget as HTMLElement;
    const nodes     = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(n => !n.closest('[hidden]'));
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
