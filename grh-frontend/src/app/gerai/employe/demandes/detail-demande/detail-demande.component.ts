import { Component, inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { DemandeService } from 'src/app/gerai/services/demande.service';
import { Demande, TYPES_DEMANDE_CONFIG } from 'src/app/gerai/models/demande.model';

interface TimelineStep {
  label   : string;
  icon    : string;
  active  : boolean;
  rejected: boolean;
  date?   : string | null;
}

@Component({
  selector: 'app-detail-demande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-demande.component.html',
  styleUrls: ['./detail-demande.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailDemandeComponent implements OnInit {

  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);
  private demandeService = inject(DemandeService);

  demande  !: Demande;
  timeline  : TimelineStep[] = [];
  loading   = true;
  error     = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.demandeService.getDemandeById(id).subscribe({
      next: demande => {
        this.demande  = demande;
        this.timeline = this.buildTimeline(demande);
        this.loading  = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Computed ───────────────────────────────────────
  get isLeave(): boolean     { return ['CONGE','MALADIE','ANNUEL','RTT','SANS_SOLDE'].includes(this.demande?.type); }
  get isFormation(): boolean { return this.demande?.type === 'FORMATION'; }
  get isCredit(): boolean    { return ['CREDIT','PRET'].includes(this.demande?.type); }

  // ── Helpers ────────────────────────────────────────
  typeLabel(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.label ?? type;
  }

  typeIcon(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.icon ?? 'ti ti-file';
  }

  typeColor(type: string): string {
    return TYPES_DEMANDE_CONFIG.find(c => c.type === type)?.color ?? '#64748B';
  }

  typeColorLight(type: string): string {
    const map: Record<string, string> = {
      CONGE: '#EFF6FF', MALADIE: '#FEF2F2', FORMATION: '#F0FDF4',
      CREDIT: '#FFFBEB', PRET: '#FFFBEB', DOCUMENT_ADMINISTRATIF: '#F5F3FF', AUTRE: '#F8FAFC'
    };
    return map[type] ?? '#F8FAFC';
  }

  private static readonly CHIP_MAP: Record<string, {cls: string; icon: string; label: string}> = {
    'EN_ATTENTE'          : { cls: 'sc-pending',    icon: 'ti ti-clock',        label: 'En attente'                },
    'VALIDEE_CHEF'        : { cls: 'sc-chef',       icon: 'ti ti-circle-check', label: 'Avis hiérarchie favorable' },
    'EN_ETUDE_DG'         : { cls: 'sc-study',      icon: 'ti ti-users-group',  label: 'En étude — Commission'    },
    'EN_ETUDE_COMMISSION' : { cls: 'sc-study',      icon: 'ti ti-users-group',  label: 'En étude — Commission'    },
    'VALIDEE_DG'          : { cls: 'sc-commission', icon: 'ti ti-thumb-up',     label: 'Avis commission favorable' },
    'VALIDEE_COMMISSION'  : { cls: 'sc-commission', icon: 'ti ti-thumb-up',     label: 'Avis commission favorable' },
    'APPROUVE'            : { cls: 'sc-approved',   icon: 'ti ti-checks',       label: 'Approuvé — Direction RH'  },
    'VALIDEE_RH'          : { cls: 'sc-approved',   icon: 'ti ti-checks',       label: 'Approuvé — Direction RH'  },
    'VALIDEE'             : { cls: 'sc-approved',   icon: 'ti ti-checks',       label: 'Validée'                   },
    'REJETEE'             : { cls: 'sc-rejected',   icon: 'ti ti-circle-x',     label: 'Rejetée'                   },
    'REFUSE'              : { cls: 'sc-rejected',   icon: 'ti ti-circle-x',     label: 'Refusée'                   },
    'ANNULEE'             : { cls: 'sc-cancelled',  icon: 'ti ti-ban',          label: 'Annulée'                   },
  };

  statutChip(statut: string) {
    return DetailDemandeComponent.CHIP_MAP[statut]
      ?? { cls: 'sc-cancelled', icon: 'ti ti-dots', label: statut };
  }

  private buildTimeline(d: Demande): TimelineStep[] {
    const s = d.statut as string;

    if (this.isCredit) {
      return [
        { label: 'Soumise',      icon: 'ti ti-send',         active: true,                                                              rejected: false, date: d.dateCreation  },
        { label: 'Chef validé',  icon: 'ti ti-user-check',   active: ['VALIDEE_CHEF','EN_ETUDE_DG','VALIDEE_RH','VALIDEE','REJETEE'].includes(s), rejected: false, date: d.dateValidation },
        { label: 'Décision DG',  icon: 'ti ti-crown',        active: ['EN_ETUDE_DG','VALIDEE_RH','VALIDEE','REJETEE'].includes(s),      rejected: false, date: null },
        { label: s === 'REJETEE' ? 'Rejetée' : ['VALIDEE','VALIDEE_RH'].includes(s) ? 'Approuvée' : 'En attente',
          icon:  s === 'REJETEE' ? 'ti ti-x-circle' : ['VALIDEE','VALIDEE_RH'].includes(s) ? 'ti ti-check-circle' : 'ti ti-dots',
          active: ['VALIDEE','VALIDEE_RH','REJETEE'].includes(s), rejected: s === 'REJETEE', date: d.dateValidationRh }
      ];
    }

    if (this.isFormation) {
      return [
        { label: 'Soumise',      icon: 'ti ti-send',         active: true,                                                         rejected: false, date: d.dateCreation  },
        { label: 'Avis chef',    icon: 'ti ti-user-check',   active: ['VALIDEE_CHEF','VALIDEE_RH','VALIDEE','REJETEE'].includes(s), rejected: false, date: d.dateValidation },
        { label: s === 'REJETEE' ? 'Rejetée' : ['VALIDEE_RH','VALIDEE'].includes(s) ? 'Approuvée RH' : 'Décision RH',
          icon:  s === 'REJETEE' ? 'ti ti-x-circle' : ['VALIDEE_RH','VALIDEE'].includes(s) ? 'ti ti-check-circle' : 'ti ti-dots',
          active: ['VALIDEE_RH','VALIDEE','REJETEE'].includes(s), rejected: s === 'REJETEE', date: d.dateValidationRh }
      ];
    }

    return [
      { label: 'Soumise',   icon: 'ti ti-send',         active: true,                                                         rejected: false, date: d.dateCreation  },
      { label: 'En cours',  icon: 'ti ti-clock',         active: ['VALIDEE_CHEF','VALIDEE_RH','VALIDEE','REJETEE'].includes(s), rejected: false, date: d.dateValidation },
      { label: s === 'REJETEE' ? 'Rejetée' : ['VALIDEE','VALIDEE_RH'].includes(s) ? 'Validée' : 'Décision',
        icon:  s === 'REJETEE' ? 'ti ti-x-circle' : ['VALIDEE','VALIDEE_RH'].includes(s) ? 'ti ti-check-circle' : 'ti ti-dots',
        active: ['VALIDEE','VALIDEE_RH','REJETEE'].includes(s), rejected: s === 'REJETEE', date: d.dateValidationRh }
    ];
  }

  goBack(): void { this.router.navigate(['/employe/demandes']); }
}
