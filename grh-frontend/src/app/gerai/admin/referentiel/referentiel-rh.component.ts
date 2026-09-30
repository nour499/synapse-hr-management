import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }      from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import {
  TypeConge, JourFerie, GrilleSalariale, Competence,
  CategorieCompetence, NiveauPoste,
  NIVEAU_LABELS, CATEGORIE_LABELS, CATEGORIE_COLORS
} from '../../models/referentiel.model';

type Tab = 'conges' | 'feries' | 'grille' | 'competences';

@Component({
  selector: 'app-referentiel-rh',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './referentiel-rh.component.html',
  styleUrls: ['./referentiel-rh.component.scss']
})
export class ReferentielRhComponent implements OnInit {

  activeTab: Tab = 'conges';
  loading = true;

  // ── Data ──────────────────────────────────────────────────
  typesConge      : TypeConge[]       = [];
  joursFeries     : JourFerie[]       = [];
  grilleSalariale : GrilleSalariale[] = [];
  competences     : Competence[]      = [];

  // ── UI state ──────────────────────────────────────────────
  editingId    : number | null = null;
  showForm     = false;
  searchComp   = '';
  filterCateg  : CategorieCompetence | '' = '';
  editGrilleId : number | null = null;

  // ── Forms ─────────────────────────────────────────────────
  congeForm!      : FormGroup;
  ferieForm!      : FormGroup;
  grilleForm!     : FormGroup;
  competenceForm! : FormGroup;

  readonly niveaux    = Object.keys(NIVEAU_LABELS) as NiveauPoste[];
  readonly categories = Object.keys(CATEGORIE_LABELS) as CategorieCompetence[];
  readonly niveauLabels    = NIVEAU_LABELS;
  readonly categorieLabels = CATEGORIE_LABELS;
  readonly categorieColors = CATEGORIE_COLORS;

  readonly tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'conges',      label: 'Types de congé',      icon: 'ti ti-beach' },
    { key: 'feries',      label: 'Jours fériés',         icon: 'ti ti-calendar-event' },
    { key: 'grille',      label: 'Grille salariale',     icon: 'ti ti-coins' },
    { key: 'competences', label: 'Compétences',          icon: 'ti ti-certificate' }
  ];

  readonly couleurOptions = [
    '#6366F1','#EF4444','#EC4899','#0EA5E9','#10B981','#F59E0B','#8B5CF6','#64748B','#F97316'
  ];

  get filteredCompetenceGroups(): { cat: CategorieCompetence; label: string; color: string; items: Competence[] }[] {
    const search = this.searchComp.toLowerCase();
    return this.categories
      .map(cat => ({
        cat,
        label: CATEGORIE_LABELS[cat],
        color: CATEGORIE_COLORS[cat],
        items: this.competences.filter(c =>
          c.categorie === cat &&
          (!this.filterCateg || this.filterCateg === cat) &&
          (!search || c.nom.toLowerCase().includes(search))
        )
      }))
      .filter(g => g.items.length > 0);
  }

  constructor(private http: HttpClient, private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.initForms();
    forkJoin({
      conges  : this.http.get<TypeConge[]>      ('/api/admin/referentiel/types-conge').pipe(catchError(() => of([]))),
      feries  : this.http.get<JourFerie[]>      ('/api/admin/referentiel/jours-feries').pipe(catchError(() => of([]))),
      grille  : this.http.get<GrilleSalariale[]>('/api/admin/referentiel/grille-salariale').pipe(catchError(() => of([]))),
      comps   : this.http.get<Competence[]>     ('/api/admin/referentiel/competences').pipe(catchError(() => of([])))
    }).subscribe(({ conges, feries, grille, comps }) => {
      this.typesConge      = conges;
      this.joursFeries     = feries.sort((a,b) => a.date.localeCompare(b.date));
      this.grilleSalariale = grille;
      this.competences     = comps;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  private initForms() {
    this.congeForm = this.fb.group({
      code       : ['', Validators.required],
      libelle    : ['', Validators.required],
      description: [''],
      nombreJours: [1, [Validators.required, Validators.min(1)]],
      paye       : [true],
      actif      : [true],
      couleur    : ['#6366F1'],
      icone      : ['ti ti-beach']
    });
    this.ferieForm = this.fb.group({
      libelle    : ['', Validators.required],
      date       : ['', Validators.required],
      recurrent  : [true],
      description: ['']
    });
    this.grilleForm = this.fb.group({
      salaireMin : [0, Validators.required],
      salaireMax : [0, Validators.required],
      salaireBase: [0, Validators.required],
      avantages  : ['']
    });
    this.competenceForm = this.fb.group({
      nom      : ['', Validators.required],
      categorie: ['TECHNIQUE', Validators.required],
      description: [''],
      actif    : [true]
    });
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    this.cancelEdit();
    this.cd.markForCheck();
  }

  // ── Types de congé ──────────────────────────────────────
  openCongeForm(tc?: TypeConge) {
    this.showForm  = true;
    this.editingId = tc?.id ?? null;
    this.congeForm.patchValue(tc ?? { code:'', libelle:'', description:'', nombreJours:1, paye:true, actif:true, couleur:'#6366F1', icone:'ti ti-beach' });
    this.cd.markForCheck();
  }

  saveConge() {
    if (this.congeForm.invalid) return;
    const val = this.congeForm.value;
    const obs = this.editingId
      ? this.http.put<TypeConge>(`/api/admin/referentiel/types-conge/${this.editingId}`, val)
      : this.http.post<TypeConge>('/api/admin/referentiel/types-conge', val);
    obs.pipe(catchError(() => of(null))).subscribe(res => {
      if (!res) return;
      if (this.editingId) {
        const idx = this.typesConge.findIndex(x => x.id === this.editingId);
        if (idx !== -1) this.typesConge[idx] = res;
      } else {
        this.typesConge.push(res);
      }
      this.cancelEdit();
      this.cd.markForCheck();
    });
  }

  deleteConge(id: number) {
    this.http.delete(`/api/admin/referentiel/types-conge/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.typesConge = this.typesConge.filter(x => x.id !== id);
      this.cd.markForCheck();
    });
  }

  toggleCongeActif(tc: TypeConge) {
    this.http.put<TypeConge>(`/api/admin/referentiel/types-conge/${tc.id}`, { ...tc, actif: !tc.actif })
      .pipe(catchError(() => of(null))).subscribe(res => {
        if (!res) return;
        const idx = this.typesConge.findIndex(x => x.id === tc.id);
        if (idx !== -1) this.typesConge[idx] = res;
        this.cd.markForCheck();
      });
  }

  // ── Jours fériés ────────────────────────────────────────
  openFerieForm(jf?: JourFerie) {
    this.showForm  = true;
    this.editingId = jf?.id ?? null;
    this.ferieForm.patchValue(jf ?? { libelle:'', date:'', recurrent:true, description:'' });
    this.cd.markForCheck();
  }

  saveFerie() {
    if (this.ferieForm.invalid) return;
    const val = this.ferieForm.value;
    const obs = this.editingId
      ? this.http.put<JourFerie>(`/api/admin/referentiel/jours-feries/${this.editingId}`, val)
      : this.http.post<JourFerie>('/api/admin/referentiel/jours-feries', val);
    obs.pipe(catchError(() => of(null))).subscribe(res => {
      if (!res) return;
      if (this.editingId) {
        const idx = this.joursFeries.findIndex(x => x.id === this.editingId);
        if (idx !== -1) this.joursFeries[idx] = res;
      } else {
        this.joursFeries.push(res);
        this.joursFeries.sort((a,b) => a.date.localeCompare(b.date));
      }
      this.cancelEdit();
      this.cd.markForCheck();
    });
  }

  deleteFerie(id: number) {
    this.http.delete(`/api/admin/referentiel/jours-feries/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.joursFeries = this.joursFeries.filter(x => x.id !== id);
      this.cd.markForCheck();
    });
  }

  // ── Grille salariale ────────────────────────────────────
  startEditGrille(gs: GrilleSalariale) {
    this.editGrilleId = gs.id;
    this.grilleForm.patchValue({
      salaireMin : gs.salaireMin,
      salaireMax : gs.salaireMax,
      salaireBase: gs.salaireBase,
      avantages  : gs.avantages?.join(', ') ?? ''
    });
    this.cd.markForCheck();
  }

  saveGrille(gs: GrilleSalariale) {
    if (this.grilleForm.invalid) return;
    const { salaireMin, salaireMax, salaireBase, avantages } = this.grilleForm.value;
    const body = {
      ...gs, salaireMin: +salaireMin, salaireMax: +salaireMax, salaireBase: +salaireBase,
      avantages: avantages ? avantages.split(',').map((s: string) => s.trim()).filter(Boolean) : []
    };
    this.http.put<GrilleSalariale>(`/api/admin/referentiel/grille-salariale/${gs.id}`, body)
      .pipe(catchError(() => of(null))).subscribe(res => {
        if (!res) return;
        const idx = this.grilleSalariale.findIndex(x => x.id === gs.id);
        if (idx !== -1) this.grilleSalariale[idx] = res;
        this.editGrilleId = null;
        this.cd.markForCheck();
      });
  }

  // ── Compétences ─────────────────────────────────────────
  openCompetenceForm(c?: Competence) {
    this.showForm  = true;
    this.editingId = c?.id ?? null;
    this.competenceForm.patchValue(c ?? { nom:'', categorie:'TECHNIQUE', description:'', actif:true });
    this.cd.markForCheck();
  }

  saveCompetence() {
    if (this.competenceForm.invalid) return;
    const val = this.competenceForm.value;
    const obs = this.editingId
      ? this.http.put<Competence>(`/api/admin/referentiel/competences/${this.editingId}`, val)
      : this.http.post<Competence>('/api/admin/referentiel/competences', val);
    obs.pipe(catchError(() => of(null))).subscribe(res => {
      if (!res) return;
      if (this.editingId) {
        const idx = this.competences.findIndex(x => x.id === this.editingId);
        if (idx !== -1) this.competences[idx] = res;
      } else {
        this.competences.push(res);
      }
      this.cancelEdit();
      this.cd.markForCheck();
    });
  }

  deleteCompetence(id: number) {
    this.http.delete(`/api/admin/referentiel/competences/${id}`).pipe(catchError(() => of(null))).subscribe(() => {
      this.competences = this.competences.filter(x => x.id !== id);
      this.cd.markForCheck();
    });
  }

  cancelEdit() {
    this.showForm  = false;
    this.editingId = null;
    this.editGrilleId = null;
    this.congeForm.reset({ paye:true, actif:true, couleur:'#6366F1', icone:'ti ti-beach', nombreJours:1 });
    this.ferieForm.reset({ recurrent:true });
    this.competenceForm.reset({ categorie:'TECHNIQUE', actif:true });
    this.cd.markForCheck();
  }

  formatSalaire(n: number): string {
    return n.toLocaleString('fr-MA') + ' MAD';
  }

  isToday(date: string): boolean {
    return date === new Date().toISOString().slice(0,10);
  }

  isPast(date: string): boolean {
    return date < new Date().toISOString().slice(0,10);
  }
}
