import { Injectable, signal } from '@angular/core';
import { Appearance } from '../models/user';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  appearance = signal<Appearance>('system');
  primaryColor = signal('#0f5cf5');
  isDark = signal(false);

  private mediaQuery: MediaQueryList | null = null;
  private mediaListener = () => this.applyCurrentMode();

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.mediaListener);
    }
    this.applyCurrentMode();
  }

  /** Called after login/signup to apply the user's stored preferences. */
  init(appearance: Appearance, color: string): void {
    this.primaryColor.set(color);
    this.setAppearance(appearance);
  }

  setAppearance(mode: Appearance): void {
    this.appearance.set(mode);
    this.mediaQuery?.removeEventListener('change', this.mediaListener);
    if (mode === 'system') {
      this.mediaQuery?.addEventListener('change', this.mediaListener);
    }
    this.applyCurrentMode();
  }

  setPrimaryColor(hex: string): void {
    this.primaryColor.set(hex);
    this.applyColors(hex, this.isDark());
  }

  private applyCurrentMode(): void {
    let dark: boolean;
    const mode = this.appearance();
    if (mode === 'dark') dark = true;
    else if (mode === 'light') dark = false;
    else dark = this.mediaQuery?.matches ?? false;

    this.isDark.set(dark);
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
    }
    this.applyColors(this.primaryColor(), dark);
  }

  /**
   * Compute and inline-set the three primary color tokens on <body>.
   * Inline styles beat any SCSS rule so these always win.
   *
   * Light: primary = chosen, ghost = 6% tint, info = 20% tint
   * Dark:  primary = 55% toward original (vibrant but readable), ghost = chosen, info = 30% tint
   */
  private applyColors(hex: string, dark: boolean): void {
    if (typeof document === 'undefined') return;
    const s = document.body.style;
    if (dark) {
      s.setProperty('--primary', this.mix(hex, '#ffffff', 0.8));
      s.setProperty('--primary-ghost', this.mix(hex, '#000000', 0.2));
      s.setProperty('--primary-info', this.mix(hex, '#000000', 0.3));
      s.setProperty('--primary-hover', this.mix(hex, '#ffffff', 0.6));
    } else {
      s.setProperty('--primary', hex);
      s.setProperty('--primary-ghost', this.mix(hex, '#ffffff', 0.06));
      s.setProperty('--primary-info', this.mix(hex, '#ffffff', 0.2));
      s.setProperty('--primary-hover', this.mix(hex, '#ffffff', 0.65));
    }
    s.setProperty('--primary-trans', this.toRgba(hex, 0.2));
  }

  /** Linearly blend hex toward bg by ratio (0 = bg, 1 = hex). */
  private mix(hex: string, bg: string, ratio: number): string {
    const p = (h: string, o: number) => parseInt(h.slice(o, o + 2), 16);
    const [r1, g1, b1] = [p(hex, 1), p(hex, 3), p(hex, 5)];
    const [r2, g2, b2] = [p(bg, 1), p(bg, 3), p(bg, 5)];
    const r = Math.round(r2 + (r1 - r2) * ratio);
    const g = Math.round(g2 + (g1 - g2) * ratio);
    const b = Math.round(b2 + (b1 - b2) * ratio);
    return `rgb(${r},${g},${b})`;
  }

  /** Convert hex to rgba with the given alpha (0–1). */
  private toRgba(hex: string, alpha: number): string {
    const p = (o: number) => parseInt(hex.slice(o, o + 2), 16);
    return `rgba(${p(1)},${p(3)},${p(5)},${alpha})`;
  }

  /** Legacy toggle kept for any leftover references. */
  toggle(): void {
    this.setAppearance(this.isDark() ? 'light' : 'dark');
  }
}
