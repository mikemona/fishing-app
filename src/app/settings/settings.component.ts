import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { SpeechService } from '../services/speech.service';
import { ThemeService } from '../services/theme.service';
import { SearchHighlightService } from '../services/search-highlight.service';
import { Speech } from '../models/speech';
import { Appearance } from '../models/user';
import { ButtonComponent } from '../components/button/button.component';
import { BadgeComponent, BadgeVariant } from '../components/badge/badge.component';
import { ModalComponent } from '../components/modal/modal.component';
import { ToastService } from '../services/toast.service';

type View = 'main' | 'color' | 'appearance' | 'archive' | 'email';

export interface ColorOption {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent, ModalComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  view = signal<View>('main');
  archivedSpeeches = signal<Speech[]>([]);
  archiveQuery = signal('');
  filteredArchivedSpeeches = computed(() => {
    const q = this.archiveQuery().trim().toLowerCase();
    if (!q) return this.archivedSpeeches();
    return this.archivedSpeeches().filter(
      (s) => s.name.toLowerCase().includes(q) || s.text.toLowerCase().includes(q),
    );
  });

  readonly colors: ColorOption[] = [
    { name: 'Blue', hex: '#0f5cf5' },
    { name: 'Indigo', hex: '#4338ca' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Pink', hex: '#db2777' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Orange', hex: '#ea580c' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Teal', hex: '#0d9488' },
    { name: 'Slate', hex: '#475569' },
  ];

  readonly appearanceOptions: { label: string; value: Appearance; icon: string }[] = [
    { label: 'Light', value: 'light', icon: 'fa-sun' },
    { label: 'Dark', value: 'dark', icon: 'fa-moon' },
    { label: 'System', value: 'system', icon: 'fa-circle-half-stroke' },
  ];

  user = computed(() => this.auth.currentUser());
  initials = computed(() => this.auth.initials());
  currentColor = computed(() => this.theme.primaryColor());
  currentAppearance = computed(() => this.theme.appearance());
  archiveCount = computed(() => this.archivedSpeeches().length);
  userPhoto = computed(() => this.user()?.photo ?? null);

  showRestoreUpgradeModal = signal(false);
  restoringId = signal<string | null>(null);
  private readonly FREE_LIMIT = 3;

  emailInput = signal('');
  emailError = signal<string | null>(null);

  editModalOpen = signal(false);
  editFirstName = signal('');
  editLastName = signal('');
  editUsername = signal('');
  editPhoto = signal<string | null>(null);
  editError = signal<string | null>(null);

  subscriptionLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private speechService: SpeechService,
    private router: Router,
    private route: ActivatedRoute,
    private searchHighlight: SearchHighlightService,
    private toast: ToastService,
  ) {}

  private directArchiveEntry = false;

  ngOnInit(): void {
    this.loadArchive();
    if (this.route.snapshot.queryParams['view'] === 'archive') {
      this.view.set('archive');
      this.directArchiveEntry = true;
    }
  }

  loadArchive(): void {
    this.archivedSpeeches.set(this.speechService.listArchived());
    this.archiveQuery.set('');
  }

  goBack(): void {
    if (this.view() === 'archive' && this.directArchiveEntry) {
      this.router.navigate(['/']);
    } else if (this.view() !== 'main') {
      this.view.set('main');
    } else {
      this.router.navigate(['/']);
    }
  }

  viewTitle(): string {
    const titles: Record<View, string> = {
      main: 'Settings',
      color: 'Primary Color',
      appearance: 'Appearance',
      archive: 'Archived Speeches',
      email: 'Email Address',
    };
    return titles[this.view()];
  }

  selectColor(hex: string): void {
    this.theme.setPrimaryColor(hex);
    this.auth.updateUser({ primaryColor: hex });
    this.toast.show('Color updated');
  }

  setAppearance(mode: Appearance): void {
    this.theme.setAppearance(mode);
    this.auth.updateUser({ appearance: mode });
    this.toast.show('Appearance updated');
  }

  confirmRestore(speech: Speech): void {
    this.restoringId.set(speech.id);
  }

  cancelRestore(): void {
    this.restoringId.set(null);
  }

  restore(speech: Speech): void {
    this.restoringId.set(null);
    const user = this.auth.currentUser();
    if (user?.subscriptionLevel === 'free' && this.speechService.list().length >= this.FREE_LIMIT) {
      this.showRestoreUpgradeModal.set(true);
      return;
    }
    this.speechService.restore(speech.id);
    this.loadArchive();
    this.toast.show('Speech restored');
  }

  openArchivedSpeech(speech: Speech): void {
    this.router.navigate(['/speech', speech.id]);
  }

  daysRemaining(deletedAt: string): number {
    return this.speechService.daysRemaining(deletedAt);
  }

  daysVariant(days: number): BadgeVariant {
    if (days <= 7) return 'danger';
    if (days <= 14) return 'warning';
    return 'neutral';
  }

  openEmailView(): void {
    this.emailInput.set(this.user()?.email ?? '');
    this.emailError.set(null);
    this.view.set('email');
  }

  saveEmail(): void {
    const email = this.emailInput().trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.emailError.set('Please enter a valid email address');
      return;
    }
    this.auth.updateUser({ email: email || undefined });
    this.view.set('main');
    this.toast.show('Email saved');
  }

  openEditModal(): void {
    const u = this.user();
    if (!u) return;
    this.editFirstName.set(u.firstName);
    this.editLastName.set(u.lastName);
    this.editUsername.set(u.username);
    this.editPhoto.set(u.photo ?? null);
    this.editError.set(null);
    this.editModalOpen.set(true);
  }

  closeEditModal(): void {
    this.editModalOpen.set(false);
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.editPhoto.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    const result = this.auth.updateProfile({
      firstName: this.editFirstName().trim(),
      lastName: this.editLastName().trim(),
      username: this.editUsername().trim(),
      photo: this.editPhoto() ?? undefined,
    });
    if (!result.success) {
      this.editError.set(result.error ?? 'Something went wrong');
      return;
    }
    this.editModalOpen.set(false);
    this.toast.show('Profile saved');
  }

  signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }

  currentColorName(): string {
    return this.colors.find((c) => c.hex === this.currentColor())?.name ?? 'Custom';
  }

  appearanceLabel(): string {
    return this.appearanceOptions.find((o) => o.value === this.currentAppearance())?.label ?? '';
  }

  smartPreview(text: string): string {
    return this.searchHighlight.smartPreview(text, this.archiveQuery());
  }

  highlight(text: string): SafeHtml {
    return this.searchHighlight.highlight(text, this.archiveQuery());
  }
}
