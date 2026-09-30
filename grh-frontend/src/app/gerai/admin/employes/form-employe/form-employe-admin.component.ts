import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FieldErrorComponent } from 'src/app/theme/shared/components/field-error/field-error.component';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Employe } from 'src/app/theme/shared/interfaces/employe';
import { ProvisionResult } from 'src/app/mocks/handlers/keycloak-provision.handlers';
import { KeycloakAccessComponent } from '../keycloak-access/keycloak-access.component';

const DIPLOMES = [
  'Bac', 'Bac+2 / BTS', 'Licence', 'Licence Informatique',
  'Licence Design Graphique', 'Ingénieur Informatique',
  'Ingénieur Data Science', 'Ingénieur Systèmes',
  'Master Informatique', 'Master Qualité Logicielle',
  'MBA Management', 'Doctorat', 'Autre'
];

@Component({
  selector   : 'app-form-employe-admin',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, KeycloakAccessComponent, FieldErrorComponent],
  templateUrl: './form-employe-admin.component.html',
  styleUrls  : ['./form-employe-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormEmployeAdminComponent implements OnInit {

  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);

  readonly diplomes    = DIPLOMES;

  // Populated from the DB — title/name displayed, id used for FK
  departments: string[] = [];
  postes:      string[] = [];
  private deptMap:  Map<string, number> = new Map();
  private posteMap: Map<string, number> = new Map();

  isEdit    = false;
  employeId : number | null = null;
  loading   = false;
  saving    = false;
  errorMsg  : string | null = null;

  // ── Keycloak provisioning ─────────────────────────────
  provisionResult  : ProvisionResult | null = null;
  showSuccessModal = false;
  passwordVisible  = false;

  // Roles & groups selected in the KeycloakAccessComponent (create mode)
  selectedRoles : string[] = ['employe'];
  selectedGroups: string[] = [];

  form = this.fb.group({
    prenom        : ['', [Validators.required, Validators.minLength(2)]],
    nom           : ['', [Validators.required, Validators.minLength(2)]],
    genre         : [''],
    dateNaissance : [''],
    email         : ['', [Validators.required, Validators.email]],
    telephone     : ['', Validators.pattern(/^\+?[\d\s\-]{8,15}$/)],
    adresse       : [''],
    poste         : [''],
    departement   : [''],
    diplome       : [''],
    dateEmbauche  : [''],
    salaire       : [null as number | null, [Validators.min(0)]],
    lieuTravail   : ['BUREAU'],
    statut        : ['ACTIF', Validators.required]
  });

  // Auto-generated username preview
  get usernamePreview(): string {
    const prenom = this.form.get('prenom')?.value ?? '';
    const nom    = this.form.get('nom')?.value    ?? '';
    if (!prenom || !nom) return '—';
    return this.buildUsername(prenom, nom);
  }

  private buildUsername(prenom: string, nom: string): string {
    const normalize = (s: string) =>
      s.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/\s+/g, '.');
    return `${normalize(prenom)}.${normalize(nom)}`;
  }

  ngOnInit(): void {
    this.http.get<{id: number, title: string}[]>('/api/employes/postes').subscribe({
      next: items => {
        this.postes = items.map(p => p.title);
        items.forEach(p => this.posteMap.set(p.title, p.id));
        this.cdr.markForCheck();
      }
    });
    this.http.get<{id: number, name: string}[]>('/api/employes/departements').subscribe({
      next: items => {
        this.departments = items.map(d => d.name);
        items.forEach(d => this.deptMap.set(d.name, d.id));
        this.cdr.markForCheck();
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit    = true;
      this.employeId = Number(id);
      this.loadEmploye(this.employeId);
    }
  }

  private toDateInput(val: any): string {
    if (!val) return '';
    if (Array.isArray(val)) {
      const [y, m, d] = val;
      return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    const s = String(val);
    return s.length >= 10 ? s.slice(0, 10) : '';
  }

  private loadEmploye(id: number): void {
    this.loading = true;
    this.http.get<Employe>(`/api/employes/${id}`).subscribe({
      next: e => {
        this.form.patchValue({
          prenom        : e.prenom,
          nom           : e.nom,
          genre         : e.genre        ?? '',
          dateNaissance : this.toDateInput(e.dateNaissance),
          email         : e.email,
          telephone     : e.telephone    ?? '',
          adresse       : e.adresse      ?? '',
          poste         : e.poste        ?? '',
          departement   : e.departement  ?? '',
          diplome       : e.diplome      ?? '',
          dateEmbauche  : this.toDateInput(e.dateEmbauche),
          salaire       : e.salaire      ?? null,
          lieuTravail   : e.lieuTravail  ?? 'BUREAU',
          statut        : e.statut       ?? 'ACTIF'
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Impossible de charger les données de l\'employé.';
        this.cdr.markForCheck();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving   = true;
    this.errorMsg = null;
    const val     = this.form.value;

    if (this.isEdit) {
      // Edit: map to backend field names
      const editPayload = {
        firstName  : val.prenom!,
        lastName   : val.nom!,
        email      : val.email!,
        phone      : val.telephone   || undefined,
        address    : val.adresse     || undefined,
        gender     : val.genre       || undefined,
        birthDate  : val.dateNaissance || undefined,
        hireDate   : val.dateEmbauche  || undefined,
        deptId     : this.deptMap.get(val.departement ?? '')  ?? undefined,
        positionId : this.posteMap.get(val.poste      ?? '')  ?? undefined
      };
      this.http.put(`/api/employes/${this.employeId}`, editPayload).subscribe({
        next : () => { this.saving = false; this.router.navigate(['/admin/employes']); },
        error: () => {
          this.saving   = false;
          this.errorMsg = 'Erreur lors de la mise à jour.';
          this.cdr.markForCheck();
        }
      });
      return;
    }

    // Create: backend expects firstName/lastName/username/deptId/positionId
    const createPayload = {
      username   : this.buildUsername(val.prenom!, val.nom!),
      firstName  : val.prenom!,
      lastName   : val.nom!,
      email      : val.email!,
      phone      : val.telephone   || undefined,
      address    : val.adresse     || undefined,
      gender     : val.genre       || undefined,
      birthDate  : val.dateNaissance || undefined,
      hireDate   : val.dateEmbauche  || undefined,
      deptId     : this.deptMap.get(val.departement ?? '')  ?? undefined,
      positionId : this.posteMap.get(val.poste      ?? '')  ?? undefined,
      roles      : this.selectedRoles.length ? this.selectedRoles : ['employe']
    };

    this.http.post<any>('/api/employes', createPayload).subscribe({
      next: response => {
        this.saving          = false;
        this.provisionResult = {
          username      : response.username ?? this.buildUsername(val.prenom!, val.nom!),
          motDePasse    : response.temporaryPassword ?? '(envoyé par email)',
          emailEnvoye   : true,
          keycloakUserId: response.keycloakUserId ?? '',
          message       : 'Compte créé. Mot de passe temporaire envoyé par e-mail.'
        } as ProvisionResult;
        this.showSuccessModal = true;
        this.cdr.markForCheck();
      },
      error: err => {
        this.saving   = false;
        this.errorMsg = 'Erreur lors de la création : ' + (err.error?.message ?? 'Vérifiez les données et réessayez.');
        this.cdr.markForCheck();
      }
    });
  }

  closeModalAndNavigate(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/admin/employes']);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  cancel(): void { this.router.navigate(['/admin/employes']); }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
