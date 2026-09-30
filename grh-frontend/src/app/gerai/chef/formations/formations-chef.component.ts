import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';

import {
  DemandeFormation, StatutFormation,
  STATUT_FORMATION_LABELS, STATUT_FORMATION_COLORS,
  TYPE_FORMATION_LABELS, MODE_FORMATION_LABELS
} from 'src/app/gerai/models/formation.model';

@Component({
  selector   : 'app-formations-chef',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule],
  templateUrl: './formations-chef.component.html',
  styleUrls  : ['./formations-chef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormationsChefComponent implements OnInit {

  private http          = inject(HttpClient);
  private fb            = inject(FormBuilder);
  cdr                   = inject(ChangeDetectorRef);
  private profilService = inject(ProfilEmployeService);

  formations   : DemandeFormation[] = [];
  loading      = true;
  submitting   = false;

  selected     : DemandeFormation | null = null;
  filterStatut : string = '';

  private chefId = 0;

  readonly statutLabels = STATUT_FORMATION_LABELS;
  readonly statutColors = STATUT_FORMATION_COLORS;
  readonly typeLabels   = TYPE_FORMATION_LABELS;
  readonly modeLabels   = MODE_FORMATION_LABELS;

  readonly statuts = [
    { value: '',            label: 'Tous' },
    { value: 'EN_ATTENTE',  label: 'En attente' },
    { value: 'APPROUVE_CHEF', label: 'Approuvés' },
    { value: 'REJETE_CHEF', label: 'Rejetés' },
  ];

  decisionForm = this.fb.group({
    decision    : ['APPROUVE_CHEF', Validators.required],
    commentaire : [''],
  });

  ngOnInit(): void {
    this.profilService.getDbProfile()
      .pipe(switchMap(profile => {
        this.chefId = profile.dbId;
        return this.http.get<DemandeFormation[]>(`/api/formations?chefId=${this.chefId}`)
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
    this.http.get<DemandeFormation[]>(`/api/formations?chefId=${this.chefId}`)
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.formations = data;
        this.loading    = false;
        this.cdr.markForCheck();
      });
  }

  get filtered(): DemandeFormation[] {
    if (!this.filterStatut) return this.formations;
    return this.formations.filter(f => f.statut === this.filterStatut);
  }

  get pendingCount(): number {
    return this.formations.filter(f => f.statut === 'EN_ATTENTE').length;
  }

  openDecision(f: DemandeFormation): void {
    this.selected = f;
    this.decisionForm.reset({ decision: 'APPROUVE_CHEF', commentaire: '' });
    this.cdr.markForCheck();
  }

  closeDecision(): void { this.selected = null; this.cdr.markForCheck(); }

  submitDecision(): void {
    if (!this.selected || this.decisionForm.invalid) return;

    this.submitting = true;
    const { decision, commentaire } = this.decisionForm.value;

    this.http.put<DemandeFormation>(
      `/api/formations/${this.selected.id}/chef-decision`,
      { decision, commentaire }
    ).pipe(catchError(() => of(null)))
     .subscribe(updated => {
        this.submitting = false;
        if (updated) {
          const idx = this.formations.findIndex(f => f.id === updated.id);
          if (idx >= 0) this.formations[idx] = updated;
        }
        this.selected = null;
        this.cdr.markForCheck();
     });
  }

  canDecide(f: DemandeFormation): boolean {
    return f.statut === 'EN_ATTENTE';
  }
}
