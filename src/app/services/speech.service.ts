import { Injectable, signal } from '@angular/core';
import { Speech } from '../models/speech';
import { AuthService } from './auth.service';

const STORAGE_PREFIX = 'tp_speeches_';
const ARCHIVE_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private readonly _version = signal(0);
  readonly version = this._version.asReadonly();

  constructor(private auth: AuthService) {}

  private key(): string {
    const uid = this.auth.currentUser()?.id ?? 'guest';
    return `${STORAGE_PREFIX}${uid}`;
  }

  private getAll(): Speech[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(this.key());
    return raw ? JSON.parse(raw) : [];
  }

  private writeAll(speeches: Speech[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.key(), JSON.stringify(speeches));
  }

  private saveAll(speeches: Speech[]): void {
    this.writeAll(speeches);
    this._version.update((v) => v + 1);
  }

  private purgeExpired(): void {
    const now = Date.now();
    const filtered = this.getAll().filter((s) => {
      if (!s.deletedAt) return true;
      return this.msElapsed(s.deletedAt, now) < ARCHIVE_DAYS * 86400_000;
    });
    this.writeAll(filtered);
  }

  private msElapsed(isoDate: string, now: number): number {
    return now - new Date(isoDate).getTime();
  }

  // ── Active speeches ────────────────────────────────────────────────────────

  list(): Speech[] {
    this.purgeExpired();
    return this.getAll().filter((s) => !s.deletedAt);
  }

  get(id: string): Speech | undefined {
    return this.getAll().find((s) => s.id === id);
  }

  save(speech: Speech): void {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === speech.id);
    if (idx >= 0) {
      all[idx] = { ...speech, updatedAt: new Date().toISOString() };
    } else {
      all.unshift(speech);
    }
    this.saveAll(all);
  }

  // ── Soft delete / archive ──────────────────────────────────────────────────

  delete(id: string): void {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx >= 0) all[idx] = { ...all[idx], deletedAt: new Date().toISOString() };
    this.saveAll(all);
  }

  listArchived(): Speech[] {
    this.purgeExpired();
    const now = Date.now();
    return this.getAll()
      .filter((s) => s.deletedAt && this.msElapsed(s.deletedAt, now) < ARCHIVE_DAYS * 86400_000)
      .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }

  restore(id: string): void {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx >= 0) {
      const { deletedAt, ...rest } = all[idx];
      all[idx] = rest as Speech;
    }
    this.saveAll(all);
  }

  daysRemaining(deletedAt: string): number {
    const elapsed = this.msElapsed(deletedAt, Date.now()) / 86400_000;
    return Math.max(1, Math.ceil(ARCHIVE_DAYS - elapsed));
  }
}
