import {
  Component, OnInit, inject,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import {
  DepartEmploye,
  TYPE_DEPART_LABELS, TYPE_DEPART_ICONS, TYPE_DEPART_COLORS
} from 'src/app/gerai/models/depart.model';

@Component({
  selector   : 'app-detail-depart-admin',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './detail-depart-admin.component.html',
  styleUrls  : ['./detail-depart-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailDepartAdminComponent implements OnInit {

  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);
  private cdr    = inject(ChangeDetectorRef);

  depart  : DepartEmploye | null = null;
  loading = true;
  notFound = false;

  readonly typeLabels = TYPE_DEPART_LABELS;
  readonly typeIcons  = TYPE_DEPART_ICONS;
  readonly typeColors = TYPE_DEPART_COLORS;

  readonly statutLabels: Record<string, string> = {
    EN_COURS: 'En cours', VALIDE: 'Validé', ANNULE: 'Annulé'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound = true; this.loading = false; return; }

    this.http.get<DepartEmploye>(`/api/departs/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe(d => {
        this.depart  = d;
        this.loading = false;
        this.notFound = !d;
        this.cdr.detectChanges();
      });
  }

  goBack(): void { this.router.navigate(['/admin/departs']); }

  goEdit(): void {
    this.router.navigate(['/admin/departs'], { queryParams: { edit: this.depart?.id } });
  }

  initiales(nom: string): string {
    const p = nom.split(' ');
    return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
  }
}
