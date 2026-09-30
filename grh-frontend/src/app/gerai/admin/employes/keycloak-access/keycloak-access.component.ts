import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef, inject, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient }   from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';

import {
  EmployeAccess, KeycloakRole, KeycloakGroup,
  KEYCLOAK_ROLES, KEYCLOAK_GROUPS
} from 'src/app/gerai/models/keycloak-access.model';

@Component({
  selector   : 'app-keycloak-access',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './keycloak-access.component.html',
  styleUrls  : ['./keycloak-access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeycloakAccessComponent implements OnInit, OnChanges {

  @Input() employeId!   : number;
  @Input() mode         : 'create' | 'edit' = 'edit';
  // For create mode — pre-selected values bound with [(ngModel)] won't work with
  // OnPush+standalone easily, so we emit changes upward
  @Output() rolesChange  = new EventEmitter<string[]>();
  @Output() groupsChange = new EventEmitter<string[]>();

  private http = inject(HttpClient);
  private cdr  = inject(ChangeDetectorRef);

  // Data
  availableRoles : KeycloakRole[]  = KEYCLOAK_ROLES;
  availableGroups: KeycloakGroup[] = KEYCLOAK_GROUPS;
  access         : EmployeAccess | null = null;
  loading  = false;
  saving   = false;
  errorMsg : string | null = null;
  successMsg: string | null = null;

  // Edit state
  selectedRoles : string[] = ['employe'];
  selectedGroups: string[] = [];

  // Reset password
  showResetConfirm = false;
  resetResult: { motDePasse: string; emailEnvoye: boolean } | null = null;
  resetPwdVisible = false;

  ngOnInit(): void {
    if (this.mode === 'edit' && this.employeId) {
      this.loadAccess();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeId'] && !changes['employeId'].firstChange && this.mode === 'edit') {
      this.loadAccess();
    }
  }

  private loadAccess(): void {
    this.loading = true;
    this.http.get<EmployeAccess>(`/api/admin/keycloak/employes/${this.employeId}/access`)
      .pipe(catchError(() => of(null)))
      .subscribe(data => {
        this.access         = data;
        this.selectedRoles  = data?.roles  ? [...data.roles]  : ['employe'];
        this.selectedGroups = data?.groups ? [...data.groups] : [];
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  // ── Role selection ─────────────────────────────────────
  toggleRole(roleName: string): void {
    // Single role selection
    this.selectedRoles = [roleName];
    this.rolesChange.emit(this.selectedRoles);
    this.cdr.markForCheck();
  }

  hasRole(name: string): boolean { return this.selectedRoles.includes(name); }

  // ── Group selection ────────────────────────────────────
  toggleGroup(path: string): void {
    const idx = this.selectedGroups.indexOf(path);
    if (idx === -1) this.selectedGroups.push(path);
    else            this.selectedGroups.splice(idx, 1);
    this.groupsChange.emit([...this.selectedGroups]);
    this.cdr.markForCheck();
  }

  hasGroup(path: string): boolean { return this.selectedGroups.includes(path); }

  // ── Save (edit mode) ───────────────────────────────────
  saveRoles(): void {
    if (this.mode !== 'edit') return;
    this.saving = true;
    this.http.put<EmployeAccess>(
      `/api/admin/keycloak/employes/${this.employeId}/roles`,
      { roles: this.selectedRoles }
    ).pipe(catchError(() => of(null)))
     .subscribe(res => {
       this.saving = false;
       if (res) { this.access = res; this.showSuccess('Rôle mis à jour avec succès.'); }
       else       this.errorMsg = 'Erreur lors de la mise à jour du rôle.';
       this.cdr.markForCheck();
     });
  }

  saveGroups(): void {
    if (this.mode !== 'edit') return;
    this.saving = true;
    this.http.put<EmployeAccess>(
      `/api/admin/keycloak/employes/${this.employeId}/groups`,
      { groups: this.selectedGroups }
    ).pipe(catchError(() => of(null)))
     .subscribe(res => {
       this.saving = false;
       if (res) { this.access = res; this.showSuccess('Groupes mis à jour avec succès.'); }
       else       this.errorMsg = 'Erreur lors de la mise à jour des groupes.';
       this.cdr.markForCheck();
     });
  }

  // ── Account toggle ─────────────────────────────────────
  toggleAccount(): void {
    if (!this.access) return;
    const enabled = !this.access.accountEnabled;
    this.http.put<EmployeAccess>(
      `/api/admin/keycloak/employes/${this.employeId}/account`,
      { accountEnabled: enabled }
    ).pipe(catchError(() => of(null)))
     .subscribe(res => {
       if (res) {
         this.access = res;
         this.showSuccess(enabled ? 'Compte activé.' : 'Compte désactivé.');
       }
       this.cdr.markForCheck();
     });
  }

  // ── Reset password ─────────────────────────────────────
  confirmReset(): void { this.showResetConfirm = true; this.cdr.markForCheck(); }
  cancelReset():  void { this.showResetConfirm = false; this.resetResult = null; this.cdr.markForCheck(); }

  doResetPassword(): void {
    this.showResetConfirm = false;
    this.http.post<{ motDePasse: string; emailEnvoye: boolean }>(
      `/api/admin/keycloak/employes/${this.employeId}/reset-password`, {}
    ).pipe(catchError(() => of(null)))
     .subscribe(res => {
       if (res) { this.resetResult = res; this.resetPwdVisible = false; }
       else      this.errorMsg = 'Erreur lors de la réinitialisation.';
       this.cdr.markForCheck();
     });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg   = null;
    setTimeout(() => { this.successMsg = null; this.cdr.markForCheck(); }, 3000);
  }

  roleFor(name: string): KeycloakRole | undefined {
    return this.availableRoles.find(r => r.name === name);
  }

  copyToClipboard(text: string): void { navigator.clipboard.writeText(text); }
}
