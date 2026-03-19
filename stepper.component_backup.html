import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toast = signal<Toast | null>(null);
  readonly toast = this._toast.asReadonly();
  readonly visible = signal(false);

  private autoTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'success', duration = 3000): void {
    if (this.autoTimer) clearTimeout(this.autoTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);

    this._toast.set({ message, type });
    // Tick after mount so CSS transition fires
    setTimeout(() => this.visible.set(true), 10);
    this.autoTimer = setTimeout(() => this.dismiss(), duration);
  }

  dismiss(): void {
    if (this.autoTimer) clearTimeout(this.autoTimer);
    this.visible.set(false);
    // Remove from DOM after transition completes
    this.hideTimer = setTimeout(() => this._toast.set(null), 350);
  }
}
