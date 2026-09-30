import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ProfilEmployeService } from 'src/app/gerai/services/employe-profile.service';
import { ProjetService } from 'src/app/gerai/services/projet-chef.service';
import { ToastService } from 'src/app/gerai/services/toast.service';
import { MembreEquipe } from 'src/app/gerai/models/equipe.model';

import {
  Evaluation, EvaluationChef, Recommandation,
  STATUT_EVAL_LABELS, STATUT_EVAL_COLORS,
  MENTION_LABELS, MENTION_COLORS,
  RECOMMANDATION_LABELS, RECOMMANDATION_COLORS,
  PERIODE_LABELS, calculerScore
} from 'src/app/gerai/models/evaluation.model';

@Component({
  selector   : 'app-evaluations-chef',
  standalone : true,
  imports    : [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './evaluations-chef.component.html',
  styleUrls  : ['./evaluations-chef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationsChefComponent implements OnInit {

  private http          = inject(HttpClient);
  private fb            = inject(FormBuilder);
  cdr                   = inject(ChangeDetectorRef);
  private profilService = inject(ProfilEmployeService);
  private projetService = inject(ProjetService);
  private route         = inject(ActivatedRoute);
  private toast         = inject(ToastService);

  private chefId = 0;

  evaluations : Evaluation[] = [];
  loading     = true;
  saving      = false;

  selected    : Evaluation | null = null;
  view        : 'liste' | 'detail' | 'form' = 'liste';
  filterStatut: string = '';

  // ── Initiation modal ──────────────────────────────────
  showInitierModal = false;
  initierMode      : 'one' | 'all' = 'one';
  initierLoading   = false;
  equipeMembers    : MembreEquipe[] = [];
  campagnes        : any[] = [];
  initier = {
    employeId  : 0,
    campagneId : 0,
    periode    : 'ANNUEL',
    annee      : new Date().getFullYear(),
    titre      : ''
  };

  readonly statutLabels = STATUT_EVAL_LABELS;
  readonly statutColors = STATUT_EVAL_COLORS;
  readonly mentionLabels = MENTION_LABELS;
  readonly mentionColors = MENTION_COLORS;
  readonly recommandationLabels = RECOMMANDATION_LABELS;
  readonly recommandationColors = RECOMMANDATION_COLORS;
  readonly periodeLabels = PERIODE_LABELS;

  readonly recommandations: Recommandation[] = ['AUGMENTATION','PROMOTION','FORMATION','RAS','PIP'];

  readonly objectifsCriteres = [
    { key: 'realisationObjectifs', label: 'Réalisation des objectifs' },
    { key: 'qualiteTravail',       label: 'Qualité du travail' },
    { key: 'respectDelais',        label: 'Respect des délais' },
    { key: 'contributionProjets',  label: 'Contribution aux projets' },
  ];
  readonly competencesCriteres = [
    { key: 'communication',        label: 'Communication' },
    { key: 'autonomie',            label: 'Autonomie & initiative' },
    { key: 'collaboration',        label: 'Collaboration' },
    { key: 'adaptabilite',         label: 'Adaptabilité' },
    { key: 'leadershipInitiative', label: 'Leadership / initiative' },
  ];

  form = this.fb.group({
    realisationObjectifs : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    qualiteTravail       : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    respectDelais        : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    contributionProjets  : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    communication        : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    autonomie            : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    collaboration        : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    adaptabilite         : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    leadershipInitiative : [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    pointsForts              : [''],
    axesAmelioration         : [''],
    commentaireGlobal        : [''],
    recommandation           : ['RAS' as Recommandation, Validators.required],
    commentaireRecommandation: [''],
  });

  ngOnInit(): void {
    this.profilService.getDbProfile()
      .pipe(switchMap(profile => {
        this.chefId = profile.dbId;
        return this.http.get<Evaluation[]>(`/api/evaluations?chefId=${this.chefId}`)
          .pipe(catchError(() => of([])));
      }))
      .subscribe(data => {
        this.evaluations = data;
        this.loading = false;
        this.cdr.markForCheck();
      });

    this.http.get<any[]>('/api/evaluations/campagnes').pipe(catchError(() => of([]))).subscribe(c => {
      this.campagnes = c;
      this.cdr.markForCheck();
    });

    this.projetService.getProjets().pipe(catchError(() => of([]))).subscribe(projets => {
      const seen = new Set<number>();
      const members: MembreEquipe[] = [];
      for (const p of projets) {
        for (const m of (p.membres ?? [])) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            members.push(m as MembreEquipe);
          }
        }
      }
      this.equipeMembers = members;

      // Auto-open modal when coming from Équipe via ?initier=1
      const qp = this.route.snapshot.queryParamMap;
      if (qp.get('initier') === '1') {
        const empId = Number(qp.get('employeId'));
        this.initier.employeId = empId || 0;
        this.initierMode = 'one';
        this.showInitierModal = true;
      }
      this.cdr.markForCheck();
    });
  }

  load(): void {
    this.loading = true;
    this.http.get<Evaluation[]>(`/api/evaluations?chefId=${this.chefId}`)
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.evaluations = data;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  get filtered(): Evaluation[] {
    if (!this.filterStatut) return this.evaluations;
    return this.evaluations.filter(e => e.statut === this.filterStatut);
  }

  get pendingCount(): number {
    return this.evaluations.filter(e => e.statut === 'AUTO_SOUMISE').length;
  }

  canEvaluate(e: Evaluation): boolean { return e.statut === 'AUTO_SOUMISE' || e.statut === 'EN_ATTENTE'; }

  openDetail(e: Evaluation): void {
    this.selected = e;
    this.view = 'detail';
    this.cdr.markForCheck();
  }

  openForm(e: Evaluation): void {
    this.selected = e;
    this.form.reset({
      realisationObjectifs: 0, qualiteTravail: 0, respectDelais: 0, contributionProjets: 0,
      communication: 0, autonomie: 0, collaboration: 0, adaptabilite: 0, leadershipInitiative: 0,
      pointsForts: '', axesAmelioration: '', commentaireGlobal: '',
      recommandation: 'RAS', commentaireRecommandation: ''
    });
    this.view = 'form';
    this.cdr.markForCheck();
  }

  back(): void {
    this.view = this.selected ? 'detail' : 'liste';
    if (this.view === 'liste') this.selected = null;
    this.cdr.markForCheck();
  }

  backToList(): void { this.view = 'liste'; this.selected = null; this.cdr.markForCheck(); }

  submit(): void {
    if (!this.selected || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const payload = this.form.value as EvaluationChef;

    this.http.put<Evaluation>(`/api/evaluations/${this.selected.id}/evaluation-chef`, payload)
      .pipe(catchError(() => of(null)))
      .subscribe(updated => {
        this.saving = false;
        if (updated) {
          const idx = this.evaluations.findIndex(e => e.id === updated.id);
          if (idx >= 0) this.evaluations[idx] = updated;
          this.selected = updated;
          this.view = 'detail';
          this.toast.success('Évaluation enregistrée avec succès.');
        } else {
          this.toast.error('Erreur lors de l\'enregistrement. Veuillez réessayer.');
        }
        this.cdr.markForCheck();
      });
  }

  setNote(field: string, val: number): void {
    this.form.patchValue({ [field]: val });
    this.cdr.markForCheck();
  }

  previewScore(): number {
    const v = this.form.value;
    const objMoy  = ((v.realisationObjectifs??0)+(v.qualiteTravail??0)+(v.respectDelais??0)+(v.contributionProjets??0)) / 4;
    const compMoy = ((v.communication??0)+(v.autonomie??0)+(v.collaboration??0)+(v.adaptabilite??0)+(v.leadershipInitiative??0)) / 5;
    const selF = this.selected;
    const nForms  = selF?.formationsRealisees ?? 0;
    const fScore  = nForms >= 3 ? 20 : nForms === 2 ? 16 : nForms === 1 ? 12 : 4;
    const pScore  = Math.round(((selF?.tauxPresence ?? 100) / 100) * 10);
    return Math.round((objMoy/5)*40) + Math.round((compMoy/5)*30) + fScore + pScore;
  }

  // ── Initiation modal ─────────────────────────────────────
  ouvrirInitierModal(): void {
    this.initier = { employeId: 0, campagneId: 0, periode: 'ANNUEL', annee: new Date().getFullYear(), titre: '' };
    this.initierMode = 'one';
    this.showInitierModal = true;
    this.cdr.markForCheck();
  }

  selectedCampagne(): any | undefined {
    return this.campagnes.find(c => c.id === +this.initier.campagneId);
  }

  get activeCampagnes(): any[] {
    return this.campagnes.filter(c => c.statut === 'ACTIVE' || c.statut === 'PLANIFIEE');
  }

  fermerInitierModal(): void { this.showInitierModal = false; this.cdr.markForCheck(); }

  selectedMembre(): MembreEquipe | undefined {
    return this.equipeMembers.find(m => m.id === +this.initier.employeId);
  }

  submitInitier(): void {
    if (this.initierLoading) return;
    const campagne = this.selectedCampagne();
    const base = {
      chefId     : this.chefId,
      campagneId : campagne?.id ?? null,
      periode    : campagne?.periode ?? this.initier.periode,
      annee      : campagne?.annee   ?? this.initier.annee,
      titre      : campagne?.titre   ?? (this.initier.titre || `Évaluation ${this.initier.annee}`)
    };

    this.initierLoading = true;

    if (this.initierMode === 'all') {
      const membres = this.equipeMembers.map(m => ({
        id: m.id, nom: m.nom, prenom: m.prenom, poste: m.poste ?? '', departement: m.departement ?? ''
      }));
      this.http.post<Evaluation[]>('/api/evaluations/bulk', { ...base, membres })
        .pipe(catchError(() => of([]))).subscribe(created => {
          this.evaluations = [...this.evaluations, ...created];
          this.initierLoading = false;
          this.showInitierModal = false;
          if (created.length > 0) {
            this.toast.success(`${created.length} évaluation(s) initiée(s).`);
          } else {
            this.toast.error('Erreur lors de l\'initialisation. Veuillez réessayer.');
          }
          this.cdr.markForCheck();
        });
    } else {
      const m = this.selectedMembre();
      if (!m) { this.initierLoading = false; return; }
      this.http.post<Evaluation>('/api/evaluations', {
        ...base,
        employeId: m.id, employeNom: m.nom, employePrenom: m.prenom,
        employePoste: m.poste ?? '', departement: m.departement ?? ''
      }).pipe(catchError(() => of(null))).subscribe(created => {
        this.initierLoading = false;
        this.showInitierModal = false;
        if (created) {
          this.evaluations = [...this.evaluations, created];
          this.toast.success('Évaluation initiée. Vous pouvez maintenant la remplir.');
          this.openForm(created);
        } else {
          this.toast.error('Erreur lors de l\'initialisation. Veuillez réessayer.');
        }
        this.cdr.markForCheck();
      });
    }
  }

  stars(n: number): number[] { return Array.from({ length: n }); }
  empty(n: number): number[] { return Array.from({ length: 5 - n }); }

  readonly filterOptions = [
    { value: '', label: 'Tous' },
    { value: 'EN_ATTENTE',   label: 'En attente' },
    { value: 'AUTO_SOUMISE', label: 'À évaluer' },
    { value: 'VALIDEE_CHEF', label: 'Évaluées' },
    { value: 'VALIDEE_RH',   label: 'Validées RH' },
    { value: 'CLOTUREE',     label: 'Clôturées' },
  ];
}
