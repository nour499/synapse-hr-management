import {
  Component, OnInit, AfterViewChecked, ElementRef, ViewChild,
  inject, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService, AiMessage } from 'src/app/gerai/services/ai-chat.service';
import { AuthService } from 'src/app/gerai/services/auth.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  private aiChatService = inject(AiChatService);
  private auth          = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);

  isOpen    = false;
  inputText = '';
  isLoading = false;
  messages: ChatMessage[] = [];

  readonly quickReplies = [
    { label: 'Solde congés',    text: 'Quel est mon solde de congés ?' },
    { label: 'Mes demandes',    text: 'Montre-moi mes dernières demandes.' },
    { label: 'Congé annuel',    text: 'Je veux poser un congé annuel.' },
    { label: 'Autorisation',    text: 'Je veux une autorisation d\'absence.' },
  ];

  private shouldScrollToBottom = false;

  ngOnInit(): void {
    this.messages = [{
      role: 'assistant',
      content: `Bonjour ${this.auth.fullName || ''} ! 👋\nJe suis votre assistant RH SYNAPSE.\nComment puis-je vous aider ?`
    }];
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScrollToBottom = true;
    }
    this.cdr.markForCheck();
  }

  send(text?: string): void {
    const message = (text ?? this.inputText).trim();
    if (!message || this.isLoading) return;

    this.inputText = '';
    this.messages.push({ role: 'user', content: message });
    this.messages.push({ role: 'assistant', content: '', loading: true });
    this.isLoading = true;
    this.shouldScrollToBottom = true;
    this.cdr.markForCheck();

    const history: AiMessage[] = this.messages
      .slice(0, -2)
      .filter(m => !m.loading)
      .map(m => ({ role: m.role, content: m.content }));

    this.aiChatService.send(message, history).subscribe({
      next: response => {
        this.messages[this.messages.length - 1] = {
          role: 'assistant',
          content: response.reply || 'Désolé, je n\'ai pas pu répondre.'
        };
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messages[this.messages.length - 1] = {
          role: 'assistant',
          content: 'Une erreur est survenue. Veuillez réessayer.'
        };
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.cdr.markForCheck();
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  formatMessage(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
