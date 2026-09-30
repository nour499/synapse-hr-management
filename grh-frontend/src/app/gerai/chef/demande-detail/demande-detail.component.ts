import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Demande } from '../../models/demande.model';
import { DemandeService } from '../../services/demande.service';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demande-detail.component.html',
  styleUrls: ['./demande-detail.component.scss']
})
export class DemandeDetailComponent implements OnInit {

  demandeId!: number;
  demande: Demande | null = null;

  private static readonly CHIP_MAP: Record<string, {cls: string; icon: string; label: string}> = {
    EN_ATTENTE   : { cls: 'sc-pending',   icon: 'ti ti-clock',        label: 'En attente'   },
    VALIDEE_CHEF : { cls: 'sc-chef',      icon: 'ti ti-circle-check', label: 'Validée chef' },
    VALIDEE_RH   : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Approuvée RH' },
    VALIDEE      : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Validée'      },
    REJETEE      : { cls: 'sc-rejected',  icon: 'ti ti-circle-x',     label: 'Rejetée'      },
    ANNULEE      : { cls: 'sc-cancelled', icon: 'ti ti-ban',          label: 'Annulée'      },
  };

  statutChip(statut: string) {
    return DemandeDetailComponent.CHIP_MAP[statut]
      ?? { cls: 'sc-cancelled', icon: 'ti ti-dots', label: statut };
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private demandeService: DemandeService,
    private cd: ChangeDetectorRef
  ) {}

  retour(): void {
    this.router.navigate(['/chef/demandes']);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) { return; }
    this.demandeId = +idParam;

    // history.state is set by Angular when navigating with { state: { demande } }
    // This avoids ID-collision across request tables (leave, training, loan, etc.)
    const state = history.state as { demande?: Demande };
    if (state?.demande) {
      this.demande = this.demandeService.enrich(state.demande);
      this.cd.markForCheck();
    } else {
      this.loadDemande();
    }
  }

  loadDemande(): void {
    this.demandeService.getDemandeById(this.demandeId).subscribe({
      next: (d) => { this.demande = d; this.cd.markForCheck(); },
      error: (err) => console.error('Erreur chargement demande', err)
    });
  }
}
