import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Candidate, CandidateStatut } from '../../models/candidate.model';
import { Interview } from '../../models/interview.model';

@Injectable({ providedIn: 'root' })
export class RecruitmentStateService {
  private http = inject(HttpClient);

  private _candidates = new BehaviorSubject<Candidate[]>([]);
  private _interviews  = new BehaviorSubject<Interview[]>([]);

  readonly candidates$ = this._candidates.asObservable();
  readonly interviews$  = this._interviews.asObservable();

  cLoaded = false;
  iLoaded = false;

  // ── Loaders ───────────────────────────────────────────────────────────────

  loadCandidates(force = false): Observable<Candidate[]> {
    if (this.cLoaded && !force) return of(this._candidates.getValue());
    return this.http.get<Candidate[]>('/api/admin/candidates').pipe(
      catchError(() => of([])),
      tap(data => { this._candidates.next(data); this.cLoaded = true; })
    );
  }

  loadInterviews(force = false): Observable<Interview[]> {
    if (this.iLoaded && !force) return of(this._interviews.getValue());
    return this.http.get<Interview[]>('/api/admin/interviews').pipe(
      catchError(() => of([])),
      tap(data => { this._interviews.next(data); this.iLoaded = true; })
    );
  }

  // ── Candidate mutations ───────────────────────────────────────────────────

  moveCandidat(id: number, statut: string): Observable<Candidate | null> {
    return this.http.put<Candidate>(`/api/admin/candidates/${id}/statut`, { statut }).pipe(
      catchError(() => of(null)),
      tap(c => { if (c) this.patchCandidate(c); })
    );
  }

  toggleShortlist(id: number, value: boolean): Observable<Candidate | null> {
    return this.http.put<Candidate>(`/api/admin/candidates/${id}/shortlist`, { shortliste: value }).pipe(
      catchError(() => of(null)),
      tap(c => { if (c) this.patchCandidate(c); })
    );
  }

  saveNote(id: number, note: string): Observable<Candidate | null> {
    return this.http.put<Candidate>(`/api/admin/candidates/${id}/note`, { noteRecruteur: note }).pipe(
      catchError(() => of(null)),
      tap(c => { if (c) this.patchCandidate(c); })
    );
  }

  // ── Interview mutations ───────────────────────────────────────────────────

  createInterview(data: Partial<Interview>): Observable<Interview | null> {
    return this.http.post<Interview>('/api/admin/interviews', data).pipe(
      catchError(() => of(null)),
      tap(interview => {
        if (!interview) return;
        this._interviews.next([...this._interviews.getValue(), interview]);
        this._candidates.next(
          this._candidates.getValue().map(c =>
            c.id === interview.candidatId ? { ...c, statut: 'INTERVIEWE' } : c
          )
        );
      })
    );
  }

  updateInterviewStatut(id: number, statut: string): Observable<Interview | null> {
    return this.http.put<Interview>(`/api/admin/interviews/${id}/statut`, { statut }).pipe(
      catchError(() => of(null)),
      tap(interview => { if (interview) this._patchInterview(interview); })
    );
  }

  saveInterviewDecision(
    id: number,
    payload: { decision: string; noteGlobale: number; commentaire: string; dateDebut?: string }
  ): Observable<Interview | null> {
    return this.http.put<Interview>(`/api/admin/interviews/${id}/decision`, payload).pipe(
      catchError(() => of(null)),
      tap(interview => {
        if (!interview) return;
        this._patchInterview(interview);
        // Automatically advance candidate in pipeline
        if (interview.decision === 'RETENU' || interview.decision === 'REJETE') {
          const next: CandidateStatut = interview.decision === 'RETENU' ? 'OFFRE_ENVOYEE' : 'REJETE';
          this._candidates.next(
            this._candidates.getValue().map(c =>
              c.id === interview.candidatId ? { ...c, statut: next } : c
            )
          );
        }
      })
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  patchCandidate(updated: Candidate): void {
    this._candidates.next(
      this._candidates.getValue().map(c => c.id === updated.id ? updated : c)
    );
  }

  removeCandidate(id: number): void {
    this._candidates.next(this._candidates.getValue().filter(c => c.id !== id));
  }

  private _patchInterview(updated: Interview): void {
    this._interviews.next(
      this._interviews.getValue().map(i => i.id === updated.id ? updated : i)
    );
  }
}
