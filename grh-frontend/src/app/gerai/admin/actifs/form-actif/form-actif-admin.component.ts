import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FieldErrorComponent } from 'src/app/theme/shared/components/field-error/field-error.component';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

import {
  Actif, CategorieActif,
  TYPES_TANGIBLES, TYPES_NUMERIQUES
} from 'src/app/gerai/models/actif.model';
import { Employe } from 'src/app/theme/shared/interfaces/employe';

@Component({
  selector   : 'app-form-actif-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './form-actif-admin.component.html',
  styleUrls  : ['./form-actif-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormActifAdminComponent implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);

  readonly typesTangibles  = TYPES_TANGIBLES;
  readonly typesNumeriques = TYPES_NUMERIQUES;

  isEdit    = false;
  actifId   : number | null = null;
  loading   = false;
  saving    = false;
  errorMsg  : string | null = null;
  employes  : Employe[] = [];

  form = this.fb.group({
    nom             : ['', [Validators.required, Validators.minLength(2)]],
    categorie       : ['TANGIBLE' as CategorieActif, Validators.required],
    type            : ['', Validators.required],
    marque          : [''],
    modele          : [''],
    numeroSerie     : [''],
    description     : [''],
    valeur          : [null as number | null, [Validators.min(0)]],
    dateAcquisition : [''],
    dateAttribution : [''],
    dateExpiration  : [''],
    statut          : ['DISPONIBLE', Validators.required],
    employeId       : [null as number | null]
  });

  get categorie(): CategorieActif { return this.form.get('categorie')?.value as CategorieActif; }
  get currentTypes() { return this.categorie === 'TANGIBLE' ? this.typesTangibles : this.typesNumeriques; }
  get isNumerique(): boolean { return this.categorie === 'NUMERIQUE'; }
  get isAttribue(): boolean  { return this.form.get('statut')?.value === 'ATTRIBUE'; }

  ngOnInit(): void {
    this.http.get<Employe[]>('/api/employes')
      .pipe(catchError(() => of([])))
      .subscribe(list => { this.employes = list; this.cdr.markForCheck(); });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit  = true;
      this.actifId = Number(id);
      this.loadActif(this.actifId);
    }

    // When category changes, reset the type field
    this.form.get('categorie')?.valueChanges.subscribe(() => {
      this.form.get('type')?.setValue('');
      this.cdr.markForCheck();
    });

    // employeId is required when statut = ATTRIBUE
    this.form.get('statut')?.valueChanges.subscribe(statut => {
      const emp = this.form.get('employeId')!;
      if (statut === 'ATTRIBUE') {
        emp.setValidators(Validators.required);
      } else {
        emp.clearValidators();
      }
      emp.updateValueAndValidity({ emitEvent: false });
    });
  }

  private loadActif(id: number): void {
    this.loading = true;
    this.http.get<Actif>(`/api/actifs/${id}`).subscribe({
      next: a => {
        this.form.patchValue({
          nom            : a.nom,
          categorie      : a.categorie,
          marque         : a.marque          ?? '',
          modele         : a.modele          ?? '',
          numeroSerie    : a.numeroSerie     ?? '',
          description    : a.description    ?? '',
          valeur         : a.valeur != null  ? Number(a.valeur) : null,
          dateAcquisition: a.dateAcquisition ?? '',
          dateAttribution: a.dateAttribution ?? '',
          dateExpiration : a.dateExpiration  ?? '',
          statut         : a.statut,
          employeId      : a.employeId != null ? Number(a.employeId) : null
        });
        // set type after categorie so the valueChanges reset doesn't clear it
        setTimeout(() => {
          this.form.get('type')?.setValue(a.type ?? '');
          this.cdr.markForCheck();
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Impossible de charger les données de l\'actif.';
        this.cdr.markForCheck();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving   = true;
    this.errorMsg = null;
    const val     = this.form.value;

    const emp = val.employeId
      ? this.employes.find(e => e.id === Number(val.employeId))
      : undefined;

    const payload: Partial<Actif> = {
      nom            : val.nom!,
      categorie      : val.categorie as CategorieActif,
      type           : val.type as any,
      marque         : val.marque        || undefined,
      modele         : val.modele        || undefined,
      numeroSerie    : val.numeroSerie   || undefined,
      description    : val.description  || undefined,
      valeur         : val.valeur        ?? undefined,
      dateAcquisition: val.dateAcquisition || undefined,
      dateAttribution: val.dateAttribution || undefined,
      dateExpiration : val.dateExpiration  || undefined,
      statut         : val.statut as any,
      employeId      : val.employeId     ?? undefined,
      employeNom     : emp ? `${emp.prenom} ${emp.nom}` : undefined
    };

    const req = this.isEdit
      ? this.http.put<Actif>(`/api/actifs/${this.actifId}`, payload)
      : this.http.post<Actif>('/api/actifs', payload);

    req.subscribe({
      next : () => { this.saving = false; this.router.navigate(['/admin/actifs']); },
      error: () => {
        this.saving   = false;
        this.errorMsg = 'Erreur lors de l\'enregistrement. Veuillez réessayer.';
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void { this.router.navigate(['/admin/actifs']); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
