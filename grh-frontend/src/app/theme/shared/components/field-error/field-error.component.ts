import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const DEFAULTS: Record<string, string> = {
  required  : 'Ce champ est requis',
  minlength : 'Valeur trop courte',
  maxlength : 'Valeur trop longue',
  email     : 'Adresse e-mail invalide',
  min       : 'Valeur trop faible',
  max       : 'Valeur trop élevée',
  pattern   : 'Format invalide',
  dateRange : 'La date de fin doit être postérieure à la date de début',
};

@Component({
  selector  : 'app-field-error',
  standalone: true,
  template  : `
    @if (control?.invalid && control?.touched) {
      <small class="fe-msg">
        <i class="ti ti-alert-circle"></i> {{ text }}
      </small>
    }
  `,
  styles: [`
    .fe-msg {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #EF4444;
      font-size: 11px;
      font-weight: 500;
      margin-top: 4px;
    }
  `]
})
export class FieldErrorComponent {
  @Input() control : AbstractControl | null = null;
  @Input() messages: Record<string, string> = {};

  get text(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    return this.messages[key] ?? DEFAULTS[key] ?? 'Valeur invalide';
  }
}
