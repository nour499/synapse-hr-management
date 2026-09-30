import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { BerryConfig } from 'src/app/app-config';

@Component({
  selector: 'app-configuration',
  imports: [CommonModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  renderer = inject(Renderer2);

  styleSelectorToggle = false;
  setFontFamily!: string;
  isDarkMode = false;

  ngOnInit(): void {
    this.setFontFamily = BerryConfig.font_family;
    this.fontFamily(this.setFontFamily);

    // Restaurer le mode sauvegardé
    const saved = localStorage.getItem('synapse-theme');
    if (saved === 'dark') {
      this.isDarkMode = true;
      this.renderer.addClass(document.body, 'dark');
    }
  }

  // ── Font ─────────────────────────────────────────
  fontFamily(font: string): void {
    this.setFontFamily = font;
    this.renderer.removeClass(document.body, 'Roboto');
    this.renderer.removeClass(document.body, 'Poppins');
    this.renderer.removeClass(document.body, 'Inter');
    this.renderer.addClass(document.body, font);
  }

  // ── Dark mode ─────────────────────────────────────
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
      localStorage.setItem('synapse-theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
      localStorage.setItem('synapse-theme', 'light');
    }
  }
}