import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttritionPrediction, AttritionSummary } from '../models/attrition.model';

@Injectable({ providedIn: 'root' })
export class AttritionService {
  private http = inject(HttpClient);
  private readonly BASE = '/api/admin/attrition';

  getSummary(): Observable<AttritionSummary> {
    return this.http.get<AttritionSummary>(`${this.BASE}/summary`);
  }

  getPredictions(): Observable<AttritionPrediction[]> {
    return this.http.get<AttritionPrediction[]>(`${this.BASE}/predictions`);
  }

  getPrediction(employeId: number): Observable<AttritionPrediction> {
    return this.http.get<AttritionPrediction>(`${this.BASE}/predictions/${employeId}`);
  }

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.BASE}/refresh`, {});
  }
}
