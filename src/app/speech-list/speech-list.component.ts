import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { SpeechService } from '../services/speech.service';
import { AuthService } from '../services/auth.service';
import { SearchHighlightService } from '../services/search-highlight.service';
import { Speech } from '../models/speech';
import { ButtonComponent } from '../components/button/button.component';
import { BadgeComponent } from '../components/badge/badge.component';
import { ModalComponent } from '../components/modal/modal.component';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { DropdownItemComponent } from '../components/dropdown/dropdown-item.component';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-speech-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent, ModalComponent, DropdownComponent, DropdownItemComponent],
  templateUrl: './speech-list.component.html',
  styleUrls: ['./speech-list.component.scss'],
})
export class SpeechListComponent implements OnInit {
  speeches = signal<Speech[]>([]);
  archivedCount = computed(() => {
    this.speechService.version(); // reactive dependency
    return this.speechService.listArchived().length;
  });
  searchQuery = signal('');
  filteredSpeeches = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.speeches();
    return this.speeches().filter(
      (s) => s.name.toLowerCase().includes(q) || s.text.toLowerCase().includes(q),
    );
  });
  initials = computed(() => this.auth.initials());
  userPhoto = computed(() => this.auth.currentUser()?.photo ?? null);
  currentColor = computed(() => this.auth.preferredColor());

  deletingId = signal<string | null>(null);
  showUpgradeModal = signal(false);

  private readonly FREE_LIMIT = 3;

  constructor(
    private speechService: SpeechService,
    private auth: AuthService,
    private router: Router,
    private searchHighlight: SearchHighlightService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.speeches.set(this.speechService.list());
  }

  goSettings(): void {
    this.router.navigate(['/settings']);
  }

  goArchive(): void {
    this.router.navigate(['/settings'], { queryParams: { view: 'archive' } });
  }

  private isAtLimit(): boolean {
    const user = this.auth.currentUser();
    if (user?.subscriptionLevel !== 'free') return false;
    return this.speeches().length >= this.FREE_LIMIT;
  }

  createNew(): void {
    if (this.isAtLimit()) {
      this.showUpgradeModal.set(true);
      return;
    }
    this.router.navigate(['/speech', 'new']);
  }

  open(speech: Speech): void {
    if (this.deletingId()) return;
    this.router.navigate(['/speech', speech.id]);
  }

  duplicate(speech: Speech): void {
    if (this.isAtLimit()) {
      this.showUpgradeModal.set(true);
      return;
    }
    const copy: Speech = {
      ...speech,
      id: crypto.randomUUID(),
      name: `${speech.name} copy`,
      createdAt: new Date().toISOString(),
    };
    this.speechService.save(copy);
    this.load();
  }

  confirmDelete(speech: Speech): void {
    this.deletingId.set(speech.id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  deleteConfirmed(speech: Speech): void {
    this.speechService.delete(speech.id);
    this.deletingId.set(null);
    this.load();
    this.toast.show('Speech archived');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  smartPreview(text: string): string {
    return this.searchHighlight.smartPreview(text, this.searchQuery());
  }

  highlight(text: string): SafeHtml {
    return this.searchHighlight.highlight(text, this.searchQuery());
  }
}
