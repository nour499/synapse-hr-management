import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';

import {
  DemandeFormation, StatutFormation,
  STATUT_FORMATION_LABELS, STATUT_FORMATION_COLORS,
  TYPE_FORMATION_LABELS, MODE_FORMATION_LABELS,
  TypeFormation, ModeFormation,
  FORMATION_STEPS, STATUTS_ACTIFS
} from 'src/app/gerai/models/formation.model';
import { AuthService } from 'src/app/gerai/services/auth.service';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';

@Component({
  selector   : 'app-formations-employe',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './formations-employe.component.html',
  styleUrls  : ['./formations-employe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormationsEmployeComponent implements OnInit {

  private http         = inject(HttpClient);
  private fb           = inject(FormBuilder);
  private cdr          = inject(ChangeDetectorRef);
  private auth         = inject(AuthService);
  private profilService = inject(ProfilEmployeService);

  // Données
  formations: DemandeFormation[] = [];
  loading    = true;
  saving     = false;

  // Vue
  activeTab: 'actives' | 'historique' = 'actives';
  showForm  = false;
  selectedFormation: DemandeFormation | null = null;

  // Resolved from backend profile on init
  private employeId  = 0;
  private managerId  : number | null = null;

  // Labels
  readonly statutLabels = STATUT_FORMATION_LABELS;
  readonly statutColors = STATUT_FORMATION_COLORS;
  readonly typeLabels   = TYPE_FORMATION_LABELS;
  readonly modeLabels   = MODE_FORMATION_LABELS;
  readonly formationSteps = FORMATION_STEPS;

  readonly types: TypeFormation[]  = ['TECHNIQUE','MANAGEMENT','LANGUE','SECURITE','QUALITE','SOFT_SKILL','CERTIFICATION','AUTRE'];
  readonly modes: ModeFormation[]  = ['PRESENTIEL','DISTANCIEL','HYBRIDE'];

  form = this.fb.group({
    titre              : ['', [Validators.required, Validators.minLength(5)]],
    organisme          : ['', Validators.required],
    type               : ['TECHNIQUE' as TypeFormation, Validators.required],
    mode               : ['DISTANCIEL' as ModeFormation, Validators.required],
    dureeJours         : [1, [Validators.required, Validators.min(1)]],
    coutEstime         : [null as number | null],
    lieu               : [''],
    dateDebutSouhaitee : [''],
    dateFinSouhaitee   : [''],
    objectifs          : ['', [Validators.required, Validators.minLength(20)]],
    competencesVisees  : [''],
  });

  ngOnInit(): void {
    this.profilService.getDbProfile()
      .pipe(switchMap(profile => {
        this.employeId = profile.dbId;
        this.managerId = profile.managerId;
        return this.http.get<DemandeFormation[]>(`/api/formations?employeId=${this.employeId}`)
          .pipe(catchError(() => of([])));
      }))
      .subscribe(data => {
        this.formations = data;
        this.loading    = false;
        this.cdr.markForCheck();
      });
  }

  load(): void {
    this.loading = true;
    this.http.get<DemandeFormation[]>(`/api/formations?employeId=${this.employeId}`)
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.formations = data;
        this.loading    = false;
        this.cdr.markForCheck();
      });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving = true;
    const v = this.form.value;

    const payload: Partial<DemandeFormation> = {
      employeId     : this.employeId,
      employeNom    : this.auth.lastName,
      employePrenom : this.auth.firstName,
      chefId        : this.managerId ?? undefined,
      titre         : v.titre!,
      organisme     : v.organisme!,
      type          : v.type as TypeFormation,
      mode          : v.mode as ModeFormation,
      dureeJours    : v.dureeJours!,
      coutEstime    : v.coutEstime ?? undefined,
      lieu          : v.lieu       || undefined,
      dateDebutSouhaitee: v.dateDebutSouhaitee || undefined,
      dateFinSouhaitee  : v.dateFinSouhaitee   || undefined,
      objectifs     : v.objectifs!,
      competencesVisees: v.competencesVisees
        ? v.competencesVisees.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
    };

    this.http.post<DemandeFormation>('/api/formations', payload)
      .pipe(catchError(() => of(null)))
      .subscribe(f => {
        this.saving = false;
        if (f) {
          this.formations.unshift(f);
          this.cancelForm();
          this.activeTab = 'actives';
        }
        this.cdr.markForCheck();
      });
  }

  openForm(): void {
    this.showForm         = true;
    this.selectedFormation = null;
    this.cdr.markForCheck();
  }

  cancelForm(): void {
    this.showForm = false;
    this.form.reset({ type: 'TECHNIQUE', mode: 'DISTANCIEL', dureeJours: 1 });
    this.cdr.markForCheck();
  }

  stepIndex(statut: StatutFormation): number {
    return this.formationSteps.findIndex(s => s.statut === statut);
  }

  isActive(f: DemandeFormation): boolean {
    return STATUTS_ACTIFS.includes(f.statut);
  }

  get activeFormations():    DemandeFormation[] { return this.formations.filter(f =>  STATUTS_ACTIFS.includes(f.statut)); }
  get historicFormations():  DemandeFormation[] { return this.formations.filter(f => !STATUTS_ACTIFS.includes(f.statut)); }

  select(f: DemandeFormation): void { this.selectedFormation = f; this.showForm = false; this.cdr.markForCheck(); }
  closeDetail(): void { this.selectedFormation = null; this.cdr.markForCheck(); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  starArray(n: number): number[] { return Array.from({ length: n }); }
}
