import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, switchMap, catchError, of } from 'rxjs';

import { DemandeService }      from 'src/app/gerai/services/demande.service';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';
import { ToastService }         from 'src/app/gerai/services/toast.service';
import { CreateDemandeDTO, TYPES_DEMANDE_CONFIG } from 'src/app/gerai/models/demande.model';
import { TeamAbsence } from 'src/app/gerai/models/conge.model';
import { FieldErrorComponent } from 'src/app/theme/shared/components/field-error/field-error.component';

export const DOC_TYPES = [
  { id: 1, key: 'ATTESTATION_TRAVAIL',  label: 'Attestation de travail'  },
  { id: 2, key: 'ATTESTATION_SALAIRE',  label: 'Attestation de salaire'  },
  { id: 3, key: 'BULLETIN_PAIE',        label: 'Bulletin de paie'         },
  { id: 4, key: 'FICHE_PAIE_ANNUELLE',  label: 'Fiche de paie annuelle'  },
  { id: 5, key: 'ATTESTATION_CONGE',    label: 'Attestation de congé'    },
  { id: 6, key: 'ORDRE_MISSION',        label: "Ordre de mission"         },
  { id: 7, key: 'CERTIFICAT_PRESENCE',  label: 'Certificat de présence'  },
  { id: 8, key: 'ATTESTATION_CNSS',     label: 'Attestation CNSS / CNAM' },
];

export const DOC_MOTIFS = [
  { value: 'BANQUE',         label: 'Banque / Organisme financier' },
  { value: 'AMBASSADE',      label: 'Ambassade / Visa'             },
  { value: 'ADMINISTRATION', label: 'Administration publique'      },
  { value: 'ASSURANCE',      label: 'Assurance'                    },
  { value: 'AUTRE',          label: 'Autre (préciser)'             },
];

export const CREDIT_MOTIFS = [
  { value: 'MEDICAL',    label: 'Médical / Santé'             },
  { value: 'IMMOBILIER', label: 'Immobilier / Logement'       },
  { value: 'VEHICULE',   label: 'Véhicule'                    },
  { value: 'EDUCATION',  label: 'Éducation / Scolarité'       },
  { value: 'FAMILIAL',   label: 'Événement familial'          },
  { value: 'AUTRE',      label: 'Autre (préciser)'            },
];

function _dateRangeValidator(g: AbstractControl): ValidationErrors | null {
  const debut = g.get('dateDebut')?.value;
  const fin   = g.get('dateFin')?.value;
  if (!debut || !fin) return null;
  return new Date(fin) >= new Date(debut) ? null : { dateRange: true };
}

@Component({
  selector: 'app-deposer-demande',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './deposer-demande.component.html',
  styleUrls: ['./deposer-demande.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeposerDemandeComponent implements OnInit {

  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private http           = inject(HttpClient);
  private demandeService = inject(DemandeService);
  private profilService  = inject(ProfilEmployeService);
  private toast          = inject(ToastService);
  private destroyRef     = inject(DestroyRef);

  private static readonly LEAVE_TYPES_WITH_TEAM = new Set([
    'CONGE','MALADIE','FAMILIAL','HAJJ','MATERNITE','POSTNATAL','ALLAITEMENT',
    'SANS_SOLDE','LONGUE_MALADIE','NAISSANCE_PERE','CREATION_ENTREPRISE','OBLIGATIONS_LEGALES'
  ]);

  readonly typesConfig  = TYPES_DEMANDE_CONFIG;
  readonly docTypes     = DOC_TYPES;
  readonly docMotifs    = DOC_MOTIFS;
  readonly creditMotifs = CREDIT_MOTIFS;

  form = this.fb.group({
    type             : ['', Validators.required],
    description      : ['', [Validators.required, Validators.minLength(10)]],
    dateDebut        : [''],
    dateFin          : [''],
    montant          : [''],
    dureeMois        : [''],
    // FORMATION
    titreFormation   : [''],
    organisme        : [''],
    lieu             : [''],
    budget           : [''],
    dureeFormation   : [''],
    modeFormation    : ['PRESENTIEL'],
    // CREDIT
    motifCredit      : [''],
    motifCreditAutre : [''],
    remboursementAccepte: [false],
    // DOCUMENT_ADMINISTRATIF
    typeDocument     : [''],
    nombreCopies     : [1],
    langueDocument   : ['FR'],
    motifDocument    : [''],
    motifAutre       : [''],
    moisBulletin     : [''],
    urgent           : [false],
  }, { validators: _dateRangeValidator });

  files             : File[]      = [];
  certificatMedical : File | null = null;
  certError              = false;
  motifAutreError        = false;
  moisBulletinError      = false;
  motifCreditAutreError  = false;

  isSaving   = false;
  errorMsg   : string | null = null;
  soldeAcknowledged = false;

  teamAbsences  : TeamAbsence[] = [];
  loadingTeam   = false;
  congesRestants  = 0;
  salaireMensuel  = 0;   // Chargé depuis le profil employé
  mensualite      = 0;

  get capaciteEndettement(): number {
    return Math.floor(this.salaireMensuel * 0.33);
  }

  get tauxEndettementResultant(): number {
    if (!this.salaireMensuel) return 0;
    return Math.round((this.mensualite / this.salaireMensuel) * 100);
  }

  get depasse33Pct(): boolean {
    return this.mensualite > 0 && this.mensualite > this.capaciteEndettement;
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  ngOnInit(): void {
    // ── Type changes → conditional validators ──────────────────
    this.form.get('type')!.valueChanges.subscribe(type => {
      const needsDates    = this.typesConfig.find(c => c.type === type)?.requiresDates ?? false;
      const needsCredit   = type === 'CREDIT';
      const needsFormation = type === 'FORMATION';
      const needsDocument = type === 'DOCUMENT_ADMINISTRATIF';

      const debut       = this.form.get('dateDebut')!;
      const fin         = this.form.get('dateFin')!;
      const montant     = this.form.get('montant')!;
      const dureeMois   = this.form.get('dureeMois')!;
      const titre       = this.form.get('titreFormation')!;
      const organisme   = this.form.get('organisme')!;
      const budget      = this.form.get('budget')!;
      const description = this.form.get('description')!;
      const typeDoc     = this.form.get('typeDocument')!;
      const copies      = this.form.get('nombreCopies')!;
      const langue      = this.form.get('langueDocument')!;
      const motifDoc    = this.form.get('motifDocument')!;
      const motifCredit = this.form.get('motifCredit')!;
      const rembours    = this.form.get('remboursementAccepte')!;

      debut.setValidators(needsDates ? [Validators.required] : []);
      fin.setValidators(needsDates && !needsFormation ? [Validators.required] : []);

      // CREDIT
      if (needsCredit) {
        montant.setValidators([Validators.required, Validators.min(1)]);
        dureeMois.setValidators([Validators.required, Validators.min(1), Validators.max(120)]);
        motifCredit.setValidators([Validators.required]);
        rembours.setValidators([Validators.requiredTrue]);
        description.clearValidators();
      } else {
        montant.clearValidators();
        dureeMois.clearValidators();
        motifCredit.clearValidators();
        rembours.clearValidators();
        this.form.get('motifCreditAutre')!.clearValidators();
        this.mensualite = 0;
      }

      // FORMATION
      if (needsFormation) {
        titre.setValidators([Validators.required, Validators.minLength(3)]);
        organisme.setValidators([Validators.required]);
        budget.setValidators([Validators.min(0)]);
      } else {
        titre.clearValidators();
        organisme.clearValidators();
        budget.clearValidators();
      }

      // DOCUMENT
      if (needsDocument) {
        typeDoc.setValidators([Validators.required]);
        copies.setValidators([Validators.required, Validators.min(1), Validators.max(10)]);
        langue.setValidators([Validators.required]);
        motifDoc.setValidators([Validators.required]);
        description.clearValidators();
      } else {
        typeDoc.clearValidators();
        copies.clearValidators();
        langue.clearValidators();
        motifDoc.clearValidators();
        this.form.get('motifAutre')!.clearValidators();
        this.form.get('moisBulletin')!.clearValidators();
      }

      // Description required for all types except credit & document
      if (!needsCredit && !needsDocument) {
        description.setValidators([Validators.required, Validators.minLength(10)]);
      }

      this.motifAutreError       = false;
      this.moisBulletinError     = false;
      this.motifCreditAutreError = false;
      this.soldeAcknowledged     = false;

      [debut, fin, montant, dureeMois, titre, organisme, budget,
       typeDoc, copies, langue, motifDoc, motifCredit, rembours, description]
        .forEach(c => c.updateValueAndValidity({ emitEvent: false }));
      this.cdr.markForCheck();
    });

    // ── Reactive mensualité calculation ────────────────────────
    this.form.get('montant')!.valueChanges.subscribe(() => this.updateMensualite());
    this.form.get('dureeMois')!.valueChanges.subscribe(() => this.updateMensualite());

    // ── Leave balance + salaire (capacité d'endettement) ──────
    this.profilService.getStatistiques().subscribe({
      next: stats => {
        this.congesRestants = stats.congesRestants;
        this.cdr.markForCheck();
      }
    });

    this.profilService.getProfil().subscribe({
      next: (profil: any) => {
        this.salaireMensuel = profil?.salaire ?? 0;
        this.cdr.markForCheck();
      }
    });

    // ── Reset acknowledgment when dates change ─────────────────
    this.form.get('dateDebut')!.valueChanges.subscribe(() => { this.soldeAcknowledged = false; });
    this.form.get('dateFin')!.valueChanges.subscribe(() => { this.soldeAcknowledged = false; });

    // ── Team absences (tous les types de congé avec dates) ─────
    this.form.valueChanges.pipe(
      debounceTime(400),
      switchMap(v => {
        const debut   = v.dateDebut;
        const fin     = v.dateFin;
        const isLeave = DeposerDemandeComponent.LEAVE_TYPES_WITH_TEAM.has(v.type ?? '');
        if (!debut || !fin || !isLeave) {
          this.teamAbsences = [];
          this.loadingTeam  = false;
          return of([]);
        }
        this.loadingTeam = true;
        this.cdr.markForCheck();
        return this.http.get<TeamAbsence[]>(
          `/api/conges/equipe?dateDebut=${debut}&dateFin=${fin}`
        ).pipe(catchError(() => { this.loadingTeam = false; this.cdr.markForCheck(); return of([]); }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(absences => {
      this.teamAbsences = absences as TeamAbsence[];
      this.loadingTeam  = false;
      this.cdr.markForCheck();
    });
  }

  private updateMensualite(): void {
    const amount = parseFloat(this.form.get('montant')?.value  || '0');
    const months = parseInt(this.form.get('dureeMois')?.value  || '0', 10);
    this.mensualite = (amount > 0 && months > 0) ? Math.ceil(amount / months) : 0;
    this.cdr.markForCheck();
  }

  // ── Computed helpers ───────────────────────────────────────
  get selectedType(): string  { return this.form.get('type')?.value ?? ''; }
  get isConge(): boolean      { return this.selectedType === 'CONGE';                  }
  get isMaladie(): boolean    { return this.selectedType === 'MALADIE';                }
  get isCredit(): boolean     { return this.selectedType === 'CREDIT';                 }
  get isFormation(): boolean  { return this.selectedType === 'FORMATION';              }
  get isDocument(): boolean   { return this.selectedType === 'DOCUMENT_ADMINISTRATIF'; }
  get isAutre(): boolean      { return this.selectedType === 'AUTRE';                  }

  get requiresDates(): boolean {
    return this.typesConfig.find(c => c.type === this.selectedType)?.requiresDates ?? false;
  }

  get isBulletin(): boolean {
    const k = this.form.get('typeDocument')?.value;
    return k === 'BULLETIN_PAIE' || k === 'FICHE_PAIE_ANNUELLE';
  }

  get isMotifAutre(): boolean {
    return this.form.get('motifDocument')?.value === 'AUTRE';
  }

  get isMotifCreditAutre(): boolean {
    return this.form.get('motifCredit')?.value === 'AUTRE';
  }

  get dureeJours(): number {
    const debut = this.form.get('dateDebut')?.value;
    const fin   = this.form.get('dateFin')?.value;
    if (!debut || !fin) return 0;
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    if (d2 < d1) return 0;
    return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  get depasseSolde(): boolean {
    return this.isConge && this.dureeJours > 0 && this.dureeJours > this.congesRestants;
  }

  get joursDepassement(): number {
    return Math.max(0, this.dureeJours - this.congesRestants);
  }

  // ── Certificate upload ─────────────────────────────────────
  onCertificatSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.certificatMedical = input.files?.[0] ?? null;
    this.certError = false;
    this.cdr.markForCheck();
  }

  removeCertificat(): void {
    this.certificatMedical = null;
    this.cdr.markForCheck();
  }

  // ── General attachments ────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.files = Array.from(input.files);
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
  }

  // ── Submit ─────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    if (this.depasseSolde && !this.soldeAcknowledged) {
      this.errorMsg = 'Veuillez cocher la case de confirmation de dépassement de solde avant de soumettre.';
      this.cdr.markForCheck();
      return;
    }

    if (this.isMaladie && !this.certificatMedical) {
      this.certError = true;
      this.cdr.markForCheck();
      return;
    }

    if (this.isCredit && this.isMotifCreditAutre &&
        !this.form.get('motifCreditAutre')?.value?.trim()) {
      this.motifCreditAutreError = true;
      this.cdr.markForCheck();
      return;
    }

    if (this.isDocument) {
      if (this.isMotifAutre && !this.form.get('motifAutre')?.value?.trim()) {
        this.motifAutreError = true;
        this.cdr.markForCheck();
        return;
      }
      if (this.isBulletin && !this.form.get('moisBulletin')?.value) {
        this.moisBulletinError = true;
        this.cdr.markForCheck();
        return;
      }
    }

    this.isSaving = true;
    this.errorMsg = null;

    const val = this.form.value;
    const TYPE_MAP: Record<string, string> = { CREDIT: 'PRET' };
    const backendType = TYPE_MAP[val.type ?? ''] ?? val.type;

    const dto: any = {
      type  : backendType,
      reason: val.description
    };

    if (this.isCredit) {
      const motifLabel = val.motifCredit === 'AUTRE'
        ? (val.motifCreditAutre || '')
        : (this.creditMotifs.find(m => m.value === val.motifCredit)?.label || '');
      dto.amount                = parseFloat(val.montant  || '0');
      dto.durationMonths        = parseInt(val.dureeMois  || '0', 10);
      dto.currency              = 'TND';
      dto.capaciteEndettement   = this.capaciteEndettement;
      dto.tauxEndettement       = this.tauxEndettementResultant;
      dto.reason                = [motifLabel, val.description].filter(Boolean).join(' — ');
    } else if (this.isFormation) {
      dto.trainingTitle = val.titreFormation || '';
      dto.provider      = val.organisme      || '';
      dto.lieu          = val.lieu           || '';
      dto.modeFormation = val.modeFormation  || 'PRESENTIEL';
      dto.estimatedCost = val.budget ? parseFloat(val.budget) : null;
      dto.durationDays  = val.dureeFormation ? parseInt(val.dureeFormation, 10) : null;
      dto.plannedDate   = val.dateDebut      || null;
    } else if (this.isDocument) {
      const docType    = this.docTypes.find(d => d.key === val.typeDocument);
      const motifLabel = val.motifDocument === 'AUTRE'
        ? (val.motifAutre || '')
        : (this.docMotifs.find(m => m.value === val.motifDocument)?.label || '');
      dto.docTypeId   = docType?.id ?? 1;
      dto.copiesCount = Number(val.nombreCopies) || 1;
      dto.language    = val.langueDocument || 'FR';
      dto.urgent      = val.urgent ?? false;
      dto.reason      = [motifLabel, val.description].filter(Boolean).join(' — ');
      if (this.isBulletin) dto.moisBulletin = val.moisBulletin || null;
    } else if (this.isAutre) {
      dto.startDatetime = val.dateDebut ? `${val.dateDebut}T08:00:00` : null;
      dto.endDatetime   = val.dateFin   ? `${val.dateFin}T18:00:00`   : null;
    } else if (this.requiresDates) {
      const config = this.typesConfig.find(c => c.type === val.type);
      dto.startDate   = val.dateDebut || null;
      dto.endDate     = val.dateFin   || null;
      dto.daysCount   = this.dureeJours > 0 ? this.dureeJours : null;
      dto.leaveTypeId = config?.leaveTypeId ?? 1;
    }

    this.demandeService.createDemande(dto).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Demande envoyée avec succès.');
        this.router.navigate(['/employe/demandes']);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err?.error?.message
          || err?.error?.error
          || 'Erreur lors de l\'envoi. Veuillez réessayer.';
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void { this.router.navigate(['/employe/demandes']); }
}
