import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// 🔹 Interface pour typer les employés
interface Employe {
  id: number;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  statut: 'ACTIF' | 'CONGE' | string;
}

@Component({
  selector: 'app-equipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipe-detail.component.html',
  styleUrls: ['./equipe-detail.component.scss']
})
export class EquipeDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);

  employeId!: number;
  employe?: Employe; // 🔹 Typage correct et optionnel pour le contrôle de flux

  ngOnInit(): void {
    this.employeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEmploye();
  }

  loadEmploye() {
    // 🔹 Simulation des données
    this.employe = {
      id: this.employeId,
      nom: 'Ben Ali',
      prenom: 'Sami',
      poste: 'Développeur Backend',
      email: 'sami.benali@gerai.tn',
      statut: 'ACTIF'
    };
  }
}