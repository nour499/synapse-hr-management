import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DemandeRecrutement, StatutDemandeRec, Urgence,
  URGENCE_LABELS, STATUT_REC_LABELS
} from 'src/app/gerai/models/demande-recrutement.model';
import { JobRole, JobType, JOB_ROLE_LABELS, JOB_TYPE_LABELS } from 'src/app/gerai/models/job.model';
import { AuthService } from 'src/app/gerai/services/auth.service';

@Component({
  selector   : 'app-recrutement-chef',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './recrutement-chef.component.html',
  styleUrls  : ['./recrutement-chef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecrutementChefComponent implements OnInit {

  private http = inject(HttpClient);
  private fb   = inject(FormBuilder);
  private cdr  = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  demandes : DemandeRecrutement[] = [];
  loading   = true;
  saving    = false;
  errorMsg  : string | null = null;

  showForm  = false;
  detailItem: DemandeRecrutement | null = null;

  readonly urgenceLabels = URGENCE_LABELS;
  readonly statutLabels  = STATUT_REC_LABELS;
  readonly roleLabels    = JOB_ROLE_LABELS;
  readonly typeLabels    = JOB_TYPE_LABELS;

  readonly allUrgences  : Urgence[]  = ['NORMALE','URGENTE','CRITIQUE'];
  readonly allRoles     : JobRole[]  = ['JUNIOR','SENIOR','LEAD','MANAGER','DIRECTEUR','STAGIAIRE'];
  readonly allTypes     : JobType[]  = ['CDI','CDD','STAGE','FREELANCE','ALTERNANCE'];

  form = this.fb.group({
    titrePoste   : ['', [Validators.required, Validators.minLength(3)]],
    departement  : ['', Validators.required],
    role         : ['JUNIOR' as JobRole, Validators.required],
    nombrePostes : [1, [Validators.required, Validators.min(1)]],
    typeContrat  : ['CDI' as JobType, Validators.required],
    urgence      : ['NORMALE' as Urgence, Validators.required],
    justification: ['', [Validators.required, Validators.minLength(20)]]
  });

  ngOnInit(): void {
    this.http.get<DemandeRecrutement[]>(`/api/chef/recrutement?chefId=${this.auth.email}`)
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.demandes = list.sort((a, b) => b.dateDemande.localeCompare(a.dateDemande));
        this.loading  = false;
        this.cdr.markForCheck();
      });
  }

  get kpi() {
    return {
      total    : this.demandes.length,
      enAttente: this.demandes.filter(d => d.statut === 'EN_ATTENTE').length,
      approuvee: this.demandes.filter(d => d.statut === 'APPROUVEE' || d.statut === 'CONVERTIE').length,
      rejetee  : this.demandes.filter(d => d.statut === 'REJETEE').length
    };
  }

  openForm(): void {
    this.showForm = true;
    this.errorMsg = null;
    this.form.reset({ titrePoste: '', departement: '', role: 'JUNIOR', nombrePostes: 1, typeContrat: 'CDI', urgence: 'NORMALE', justification: '' });
    this.cdr.markForCheck();
  }

  closeForm(): void { this.showForm = false; this.cdr.markForCheck(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.errorMsg = null;

    const v = this.form.value;
    const payload = {
      chefId       : this.auth.email,
      chefNom      : this.auth.fullName,
      departement  : v.departement!,
      titrePoste   : v.titrePoste!,
      role         : v.role as JobRole,
      nombrePostes : Number(v.nombrePostes),
      typeContrat  : v.typeContrat as JobType,
      justification: v.justification!,
      urgence      : v.urgence as Urgence
    };

    this.http.post<DemandeRecrutement>('/api/chef/recrutement', payload)
      .pipe(catchError(() => of(null)))
      .subscribe(r => {
        if (!r) { this.errorMsg = 'Erreur lors de l\'envoi.'; this.saving = false; this.cdr.markForCheck(); return; }
        this.demandes  = [r, ...this.demandes];
        this.saving    = false;
        this.showForm  = false;
        this.cdr.markForCheck();
      });
  }

  cancelRequest(d: DemandeRecrutement): void {
    if (d.statut !== 'EN_ATTENTE') return;
    this.http.delete(`/api/chef/recrutement/${d.id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.demandes = this.demandes.filter(x => x.id !== d.id);
        this.cdr.markForCheck();
      });
  }

  openDetail(d: DemandeRecrutement): void { this.detailItem = d; this.cdr.markForCheck(); }
  closeDetail(): void { this.detailItem = null; this.cdr.markForCheck(); }

  hasError(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }
}
