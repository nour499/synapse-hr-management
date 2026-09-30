import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  reply: string;
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);
  private readonly API = '/api/chat/ai/message';

  send(message: string, history: AiMessage[]): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(this.API, { message, history });
  }
}
