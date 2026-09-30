import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

import { SharedModule }  from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import {
  ProfilEmploye, DocumentEmploye, ActiviteEmploye,
  StatistiquesEmploye, ProfilComplet, UpdateProfilDTO, Langue
} from '../../models/employe-profile.model';
import { ProfilEmployeService } from '../../services/employe-profile.service';
import { ToastService } from '../../services/toast.service';

export type ProfileTab = 'infos' | 'contrat' | 'competences' | 'documents';

@Component({
  selector: 'app-profil-chef',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './profil-chef.component.html',
  styleUrls: ['./profil-chef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilChefComponent implements OnInit {

  private profilService = inject(ProfilEmployeService);
  private auth          = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);
  private toast         = inject(ToastService);

  // ── State ─────────────────────────────────────────────
  loading    = true;
  editMode   = false;
  isSaving   = false;
  activeTab  : ProfileTab = 'infos';

  // ── New skill input state ─────────────────────────────
  newCompetence = '';
  newLangue     : Langue = { langue: '', niveau: 'Intermédiaire' };

  // ── Data ──────────────────────────────────────────────
  userInfo! : ProfilEmploye;
  private backup! : ProfilEmploye;
  documents  : DocumentEmploye[]  = [];
  activities : ActiviteEmploye[]  = [];
  stats!     : StatistiquesEmploye;

  readonly tabs: { value: ProfileTab; label: string; icon: string }[] = [
    { value: 'infos',       label: 'Infos personnelles', icon: 'ti ti-user'          },
    { value: 'contrat',     label: 'Contrat & RH',       icon: 'ti ti-file-certificate' },
    { value: 'competences', label: 'Compétences',        icon: 'ti ti-award'          },
    { value: 'documents',   label: 'Documents & Activité', icon: 'ti ti-folder'       }
  ];

  readonly situationOptions = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];
  readonly niveauLangueOptions: Langue['niveau'][] = ['Débutant', 'Intermédiaire', 'Courant', 'Natif'];
  readonly niveauEtudesOptions = ['Bac', 'Bac+2', 'Licence', 'Master', 'Doctorat', 'Autre'];
  readonly contactLienOptions  = ['Conjoint(e)', 'Parent', 'Frère/Sœur', 'Ami(e)', 'Autre'];

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading = true;
    this.profilService.syncProfil().pipe(
      switchMap(() => this.profilService.getProfilComplet())
    ).subscribe({
      next: (data: ProfilComplet) => {
        this.userInfo   = data.profil;
        this.backup     = this.deepCopy(data.profil);
        this.documents  = data.documents;
        this.activities = data.activites;
        this.stats      = data.statistiques;
        this.loading    = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.showError('Erreur lors du chargement du profil.');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Tabs ──────────────────────────────────────────────
  switchTab(tab: ProfileTab): void {
    this.activeTab = tab;
  }

  // ── Edit / Save ───────────────────────────────────────
  toggleEditMode(): void {
    if (this.editMode) {
      this.userInfo = this.deepCopy(this.backup);
    } else {
      this.backup = this.deepCopy(this.userInfo);
    }
    this.editMode = !this.editMode;
    this.newCompetence = '';
    this.newLangue = { langue: '', niveau: 'Intermédiaire' };
    this.clearMessages();
    this.cdr.markForCheck();
  }

  saveProfile(): void {
    this.isSaving = true;
    const updates: UpdateProfilDTO = {
      telephone         : this.userInfo.telephone,
      emailPersonnel    : this.userInfo.emailPersonnel,
      dateNaissance     : this.userInfo.dateNaissance,
      lieuNaissance     : this.userInfo.lieuNaissance,
      adresse           : this.userInfo.adresse,
      ville             : this.userInfo.ville,
      codePostal        : this.userInfo.codePostal,
      genre             : this.userInfo.genre,
      situationFamiliale: this.userInfo.situationFamiliale,
      nombreEnfants     : this.userInfo.nombreEnfants,
      nationalite       : this.userInfo.nationalite,
      cin               : this.userInfo.cin,
      contactUrgenceNom : this.userInfo.contactUrgenceNom,
      contactUrgenceTel : this.userInfo.contactUrgenceTel,
      contactUrgenceLien: this.userInfo.contactUrgenceLien,
      competences       : this.userInfo.competences,
      langues           : this.userInfo.langues,
      niveauEtudes      : this.userInfo.niveauEtudes,
      diplome           : this.userInfo.diplome,
      etablissement     : this.userInfo.etablissement
    };

    this.profilService.updateProfil(updates).subscribe({
      next: updated => {
        this.userInfo = updated;
        this.backup   = this.deepCopy(updated);
        this.editMode = false;
        this.isSaving = false;
        this.showSuccess('Profil mis à jour avec succès.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.showError('Échec de la mise à jour. Veuillez réessayer.');
        this.cdr.markForCheck();
      }
    });
  }

  // ── Competences ───────────────────────────────────────
  addCompetence(): void {
    const val = this.newCompetence.trim();
    if (!val || this.userInfo.competences.includes(val)) return;
    this.userInfo.competences = [...this.userInfo.competences, val];
    this.newCompetence = '';
  }

  removeCompetence(c: string): void {
    this.userInfo.competences = this.userInfo.competences.filter(x => x !== c);
  }

  addLangue(): void {
    if (!this.newLangue.langue.trim()) return;
    this.userInfo.langues = [...this.userInfo.langues, { ...this.newLangue }];
    this.newLangue = { langue: '', niveau: 'Intermédiaire' };
  }

  removeLangue(idx: number): void {
    this.userInfo.langues = this.userInfo.langues.filter((_, i) => i !== idx);
  }

  // ── Documents ─────────────────────────────────────────
  uploadDocument(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = (input.files as FileList)[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      this.profilService.uploadDocument(formData).subscribe({
        next: doc => {
          this.documents = [...this.documents, doc];
          this.showSuccess('Document ajouté.');
          this.cdr.markForCheck();
        },
        error: () => { this.showError('Erreur lors de l\'ajout du document.'); this.cdr.markForCheck(); }
      });
    };
    input.click();
  }

  viewDocument(docId: number): void     { this.profilService.viewDocument(docId); }

  downloadDocument(docId: number): void {
    const doc = this.documents.find(d => d.id === docId);
    this.profilService.forceDownload(docId, doc?.nom);
  }

  deleteDocument(docId: number): void {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;
    this.profilService.deleteDocument(docId).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== docId);
        this.showSuccess(`"${doc.nom}" supprimé.`);
        this.cdr.markForCheck();
      },
      error: () => { this.showError('Erreur lors de la suppression.'); this.cdr.markForCheck(); }
    });
  }

  // ── Password ──────────────────────────────────────────
  changePassword(): void { this.auth.logout(); }

  // ── Profile completion % ──────────────────────────────
  get completionPct(): number {
    if (!this.userInfo) return 0;
    const u = this.userInfo;
    const checks = [
      !!u.telephone, !!u.dateNaissance, !!u.lieuNaissance,
      !!u.adresse, !!u.cin, !!u.nationalite,
      !!u.contactUrgenceNom, !!u.contactUrgenceTel,
      !!u.niveauEtudes, !!u.diplome,
      (u.competences?.length ?? 0) > 0, (u.langues?.length ?? 0) > 0
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  get completionColor(): string {
    if (this.completionPct >= 80) return '#10B981';
    if (this.completionPct >= 50) return '#F59E0B';
    return '#EF4444';
  }

  // ── Role helpers ──────────────────────────────────────
  get isManagerVisible(): boolean {
    return this.auth.role === 'employe';
  }

  // ── Display helpers ───────────────────────────────────
  get formationsPct(): number {
    if (!this.stats?.formationsTotal) return 0;
    return Math.round((this.stats.formationsSuivies / this.stats.formationsTotal) * 100);
  }

  get congesPris(): number {
    return this.stats ? (this.stats.congesTotal - this.stats.congesRestants) : 0;
  }

  get genreLabel(): string {
    return this.userInfo?.genre === 'M' ? 'Masculin' : this.userInfo?.genre === 'F' ? 'Féminin' : '—';
  }

  niveauLangueBadge(n: Langue['niveau']): string {
    const map: Record<string, string> = {
      'Natif': 'lng-natif', 'Courant': 'lng-courant',
      'Intermédiaire': 'lng-inter', 'Débutant': 'lng-debutant'
    };
    return map[n] ?? '';
  }

  categorieLabel(cat: DocumentEmploye['categorie']): string {
    const map: Record<string, string> = {
      personnel: 'Personnel', contractuel: 'Contrat',
      administratif: 'Administratif', formation: 'Formation'
    };
    return map[cat] ?? cat;
  }

  categorieClass(cat: DocumentEmploye['categorie']): string {
    return { personnel: 'cat-personnel', contractuel: 'cat-contractuel',
             administratif: 'cat-admin', formation: 'cat-formation' }[cat] ?? '';
  }

  typeContratBadge(t: ProfilEmploye['typeContrat']): string {
    return { CDI: 'badge-cdi', CDD: 'badge-cdd', INTERIM: 'badge-interim', STAGE: 'badge-stage' }[t] ?? '';
  }

  formatSalaire(s: number | undefined): string {
    if (s == null) return '—';
    return new Intl.NumberFormat('fr-TN').format(s) + ' DT';
  }

  // ── Private ───────────────────────────────────────────
  private showSuccess(msg: string): void { this.toast.success(msg); }
  private showError(msg: string):   void { this.toast.error(msg);   }
  private clearMessages(): void {}

  private deepCopy<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }
}
