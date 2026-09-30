import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { DemandeService } from  'src/app/gerai/services/demande.service';
import { Demande, StatutDemande } from 'src/app/gerai/models/demande.model';
import { ChangeDetectorRef }   from '@angular/core';
import { NotificationWebSocketService } from 'src/app/gerai/services/notification-websocket.service';

@Component({
  selector: 'app-demandes-chef',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CardComponent],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesChefComponent implements OnInit, OnDestroy {

  constructor(private cd: ChangeDetectorRef) {}

  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private demandeService = inject(DemandeService);
  private notifWs        = inject(NotificationWebSocketService);
  private notifSub?: Subscription;

  employeIdFiltre: string | null = null;
  employeNomFiltre: string = '';
  demandeSelectionnee: Demande | null = null;
  filtreStatut: StatutDemande | '' = '';

  rejectTarget: Demande | null = null;
  rejectMotif = '';

  toutesLesDemandes: Demande[] = [];
  demandesFiltrees: Demande[] = [];
  loading = true;
  loadError: string | null = null;

  private static readonly CHIP_MAP: Record<string, {cls: string; icon: string; label: string}> = {
    EN_ATTENTE   : { cls: 'sc-pending',   icon: 'ti ti-clock',        label: 'En attente' },
    VALIDEE_CHEF : { cls: 'sc-chef',      icon: 'ti ti-circle-check', label: 'Validée chef' },
    VALIDEE_RH   : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Approuvée RH' },
    VALIDEE      : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Validée' },
    REJETEE      : { cls: 'sc-rejected',  icon: 'ti ti-circle-x',     label: 'Rejetée' },
    ANNULEE      : { cls: 'sc-cancelled', icon: 'ti ti-ban',          label: 'Annulée' },
  };

  statutChip(statut: string) {
    return DemandesChefComponent.CHIP_MAP[statut]
      ?? { cls: 'sc-cancelled', icon: 'ti ti-dots', label: statut };
  }

  readonly statuts: { valeur: StatutDemande | ''; label: string }[] = [
    { valeur: '',            label: 'Toutes'       },
    { valeur: 'EN_ATTENTE',  label: 'En attente'   },
    { valeur: 'VALIDEE_CHEF',label: 'Validée chef' },
    { valeur: 'VALIDEE_RH',  label: 'Validée RH'   },
    { valeur: 'VALIDEE',     label: 'Validée'      },
    { valeur: 'REJETEE',     label: 'Rejetée'      }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.employeIdFiltre = params['employeId'] ? String(params['employeId']) : null;
      this.filtreStatut = (params['statut'] as StatutDemande) || '';
      this.appliquerFiltre();
      this.cd.markForCheck();
    });

    this.loadDemandes();

    this.notifSub = this.notifWs.nouvelleNotification$.subscribe(() => {
      this.loadDemandes();
    });
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  private loadDemandes(): void {
    this.demandeService.getDemandes().subscribe({
      next: (demandes) => {
        this.loading = false;
        this.toutesLesDemandes = demandes;
        this.appliquerFiltre();
        this.cd.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.loadError = 'Votre compte n\'est pas lié à un dossier employé. Contactez l\'administrateur RH pour associer votre compte Keycloak à votre fiche employé.';
        } else {
          this.loadError = `Erreur lors du chargement des demandes (${err.status ?? 'réseau'}).`;
        }
        this.cd.markForCheck();
      }
    });
  }

  appliquerFiltre(): void {
    let demandes = [...this.toutesLesDemandes];

    if (this.employeIdFiltre !== null) {
      demandes = demandes.filter(d => d.employeId === this.employeIdFiltre);
      const premier = demandes[0];
      this.employeNomFiltre = premier ? `${premier.employePrenom} ${premier.employeNom}` : '';
    } else {
      this.employeNomFiltre = '';
    }

    if (this.filtreStatut !== '') {
      demandes = demandes.filter(d => d.statut === this.filtreStatut);
    }

    this.demandesFiltrees = demandes.sort((a, b) =>
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }

  setFiltreStatut(statut: StatutDemande | ''): void {
    this.filtreStatut = statut;
    this.appliquerFiltre();
    this.cd.markForCheck();
  }

  countParStatut(statut: StatutDemande | ''): number {
    const base = this.employeIdFiltre
      ? this.toutesLesDemandes.filter(d => d.employeId === this.employeIdFiltre)
      : this.toutesLesDemandes;
    return statut === '' ? base.length : base.filter(d => d.statut === statut).length;
  }


  voirToutesDemandes(): void {
    this.router.navigate(['/chef/demandes']);
  }

  valider(id: number): void {
    const d = this.toutesLesDemandes.find(d => d.id === id);
    if (!d) return;
    this.demandeService.validerDemande(id, d.type).subscribe(updated => {
      const index = this.toutesLesDemandes.findIndex(d => d.id === id);
      if (index !== -1) {
        this.toutesLesDemandes[index] = updated;
        this.appliquerFiltre();
      }
    });
  }

  openReject(id: number): void {
    const d = this.toutesLesDemandes.find(d => d.id === id);
    if (!d) return;
    this.rejectTarget = d;
    this.rejectMotif  = '';
  }

  cancelReject(): void {
    this.rejectTarget = null;
    this.rejectMotif  = '';
  }

  confirmReject(): void {
    if (!this.rejectTarget || !this.rejectMotif.trim()) return;
    const { id, type } = this.rejectTarget;
    const motif = this.rejectMotif.trim();
    this.cancelReject();
    this.demandeService.refuserDemande(id, type, motif).subscribe(updated => {
      const index = this.toutesLesDemandes.findIndex(d => d.id === id);
      if (index !== -1) {
        this.toutesLesDemandes[index] = updated;
        this.appliquerFiltre();
      }
    });
  }

  voirDemande(demande: Demande): void {
    this.router.navigate(['/chef/demandes', demande.id], { state: { demande } });
  }

}