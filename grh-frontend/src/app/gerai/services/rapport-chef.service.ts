import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RapportData } from 'src/app/theme/shared/interfaces/rapport';
import { PerformanceChef } from 'src/app/gerai/models/chef.model';

@Injectable({ providedIn: 'root' })
export class RapportService {
  private http = inject(HttpClient);

  getRapport(type: string): Observable<RapportData> {
    return this.http.get<RapportData>(`/api/rapports/${type.toLowerCase()}`);
  }

  getPerformanceChef(): Observable<PerformanceChef> {
    return this.http.get<PerformanceChef>('/api/chef/performance');
  }
}
