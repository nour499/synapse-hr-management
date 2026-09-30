import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { CongesService } from 'src/app/gerai/services/conge.service';
import { ToastService } from 'src/app/gerai/services/toast.service';
import {
    SoldeConge,
    DemandeConge,
    StatistiquesConges
} from 'src/app/gerai/models/conge.model';

@Component({
    selector: 'app-mes-conges',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        CardComponent
    ],
    templateUrl: './mes-conges.component.html',
    styleUrls: ['./mes-conges.component.scss']
})
export class MesCongesComponent implements OnInit {
    /* ──────────────────────────────────────────────────────────
       💉 SERVICES INJECTÉS
       ────────────────────────────────────────────────────────── */
    private congesService = inject(CongesService);
    private toast         = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    /* ──────────────────────────────────────────────────────────
       📊 ÉTAT DU COMPOSANT
       ────────────────────────────────────────────────────────── */
    isLoading = false;

    solde!: SoldeConge;
    demandes: DemandeConge[] = [];
    statistiques!: StatistiquesConges;

    cancelTarget: DemandeConge | null = null;
    cancelError = '';

    /* ══════════════════════════════════════════════════════════════
       🔄 LIFECYCLE
       ══════════════════════════════════════════════════════════════ */

    ngOnInit(): void {
        this.loadData();
    }

    /* ══════════════════════════════════════════════════════════════
       📡 CHARGEMENT DES DONNÉES
       ══════════════════════════════════════════════════════════════ */

    /**
     * ✨ OPTIMISATION: Charge toutes les données en une seule requête
     */
    loadData(): void {
        this.isLoading = true;

        // ✅ Une seule requête pour tout charger
        this.congesService.getCongesComplet().subscribe({
            next: (data) => {

                this.solde = data.solde;
                this.demandes = data.demandes;
                this.statistiques = data.statistiques;

                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    /* ══════════════════════════════════════════════════════════════
       🎨 HELPERS UI
       ══════════════════════════════════════════════════════════════ */

    /**
     * Retourne l'icône selon le type de congé
     */
    getTypeIcon(type: DemandeConge['type']): string {
        const icons = {
            'ANNUEL': 'ti ti-sun',
            'MALADIE': 'ti ti-stethoscope',
            'RTT': 'ti ti-clock',
            'SANS_SOLDE': 'ti ti-ban'
        };
        return icons[type] || 'ti ti-calendar';
    }

    private static readonly CHIP_MAP: Record<string, {cls: string; icon: string; label: string}> = {
        'EN_ATTENTE': { cls: 'sc-pending',   icon: 'ti ti-clock',        label: 'En attente' },
        'APPROUVE'  : { cls: 'sc-approved',  icon: 'ti ti-checks',       label: 'Approuvé'   },
        'REJETE'    : { cls: 'sc-rejected',  icon: 'ti ti-circle-x',     label: 'Rejeté'     },
    };

    statutChip(statut: DemandeConge['statut']) {
        return MesCongesComponent.CHIP_MAP[statut]
            ?? { cls: 'sc-cancelled', icon: 'ti ti-dots', label: statut };
    }

    /**
     * Retourne le label du type de congé
     */
    getTypeLabel(type: DemandeConge['type']): string {
        const labels = {
            'ANNUEL': 'Congé annuel',
            'MALADIE': 'Maladie',
            'RTT': 'RTT',
            'SANS_SOLDE': 'Sans solde'
        };
        return labels[type] || type;
    }

    /**
     * Vérifie si une demande peut être annulée
     */
    canAnnuler(demande: DemandeConge): boolean {
        return demande.statut === 'EN_ATTENTE' &&
            new Date(demande.dateDebut) > new Date();
    }

    /**
     * Annule une demande
     */
    openCancelModal(demande: DemandeConge): void {
        this.cancelTarget = demande;
        this.cancelError  = '';
    }

    closeCancelModal(): void {
        this.cancelTarget = null;
        this.cancelError  = '';
    }

    confirmAnnuler(): void {
        if (!this.cancelTarget) return;
        const target = this.cancelTarget;
        this.closeCancelModal();
        this.congesService.annulerDemande(target.id).subscribe({
            next: () => {
                this.demandes = this.demandes.filter(d => d.id !== target.id);
                this.toast.success('Demande annulée avec succès.');
                this.cdr.detectChanges();
            },
            error: () => {
                this.cancelError = 'Impossible d\'annuler cette demande. Veuillez réessayer.';
                this.cdr.detectChanges();
            }
        });
    }

    annulerDemande(demande: DemandeConge): void {
        this.openCancelModal(demande);
    }

    /**
     * Formatte une date ISO en format lisible
     */
    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Calcule le pourcentage de progression
     */
    getProgression(utilise: number, total: number): number {
        return Math.round((utilise / total) * 100);
    }
}