import {
  Component,
  computed,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../services/speech.service';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { Speech } from '../models/speech';
import { ButtonComponent } from '../components/button/button.component';
import { ModalComponent } from '../components/modal/modal.component';
import { SpeechToolbarComponent } from '../components/speech-toolbar/speech-toolbar.component';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { DropdownItemComponent } from '../components/dropdown/dropdown-item.component';
import { ToastService } from '../services/toast.service';

interface Token {
  text: string;
  isWord: boolean;
  isBreak?: boolean;
  wordIndex?: number;
}

type SpeechRecognitionAny = any;

@Component({
  selector: 'app-speech-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, SpeechToolbarComponent, DropdownComponent, DropdownItemComponent],
  templateUrl: './speech-edit.component.html',
  styleUrls: ['./speech-edit.component.scss'],
})
export class SpeechEditComponent implements OnInit, OnDestroy {
  @ViewChild('teleprompterScroll') teleprompterScrollRef!: ElementRef<HTMLDivElement>;

  speechId = signal<string | null>(null);
  speechName = signal('Untitled Speech');
  text = signal('');

  isArchived = signal(false);
  isDictating = signal(false);
  showUpgradeModal = signal(false);
  showUnsavedModal = false;
  pendingAction: 'back' | 'duplicate' | null = null;

  private savedText = signal('');
  private savedName = signal('Untitled Speech');

  hasUnsavedChanges = computed(
    () => this.text() !== this.savedText() || this.speechName() !== this.savedName(),
  );

  private readonly FREE_LIMIT = 3;
  isSpeechMode = signal(false);
  spokenIndex = signal(0);
  micActive = signal(false);
  saved = signal(false);

  tokens = computed<Token[]>(() => {
    const raw = this.text();
    if (!raw) return [];
    const parts = raw.split(/(\S+)/);
    let wordIndex = 0;
    const result: Token[] = [];
    for (const part of parts) {
      if (!part) continue;
      if (/\S/.test(part)) {
        result.push({ text: part, isWord: true, wordIndex: wordIndex++ });
      } else if (part.includes('\n')) {
        const segments = part.split('\n');
        for (let i = 0; i < segments.length; i++) {
          if (segments[i]) result.push({ text: segments[i], isWord: false });
          if (i < segments.length - 1) result.push({ text: '\n', isWord: false, isBreak: true });
        }
      } else {
        result.push({ text: part, isWord: false });
      }
    }
    return result;
  });

  wordTokens = computed<string[]>(() =>
    this.tokens()
      .filter((t) => t.isWord)
      .map((t) => this.normalize(t.text)),
  );

  progress = computed(() => {
    const total = this.wordTokens().length;
    if (total === 0) return 0;
    return Math.round((this.spokenIndex() / total) * 100);
  });

  private recognition: SpeechRecognitionAny = null;
  private dictationRecognition: SpeechRecognitionAny = null;
  private dictBaseText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private speechService: SpeechService,
    private auth: AuthService,
    public theme: ThemeService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const speech = this.speechService.get(id);
      if (speech) {
        this.speechId.set(speech.id);
        this.speechName.set(speech.name);
        this.text.set(speech.text);
        this.isArchived.set(!!speech.deletedAt);
        this.savedText.set(speech.text);
        this.savedName.set(speech.name);
      }
    }
  }

  ngOnDestroy(): void {
    this.stopSpeechMode();
    this.stopDictation();
  }

  goBack(): void {
    if (!this.isArchived() && this.hasUnsavedChanges()) {
      this.pendingAction = 'back';
      this.showUnsavedModal = true;
      return;
    }
    this.navigateBack();
  }

  private navigateBack(): void {
    if (this.isArchived()) {
      this.router.navigate(['/settings'], { queryParams: { view: 'archive' } });
    } else {
      this.router.navigate(['/']);
    }
  }

  goSettings(): void {
    this.router.navigate(['/settings']);
  }

  duplicate(): void {
    const user = this.auth.currentUser();
    if (user?.subscriptionLevel === 'free' && this.speechService.list().length >= this.FREE_LIMIT) {
      this.showUpgradeModal.set(true);
      return;
    }
    if (this.hasUnsavedChanges()) {
      this.pendingAction = 'duplicate';
      this.showUnsavedModal = true;
      return;
    }
    this.executeDuplicate();
  }

  private executeDuplicate(): void {
    const copy: Speech = {
      id: crypto.randomUUID(),
      name: `${this.speechName() || 'Untitled Speech'} copy`,
      text: this.text(),
      createdAt: new Date().toISOString(),
    };
    this.speechService.save(copy);
    this.router.navigate(['/speech', copy.id]);
  }

  unsavedSaveAndContinue(): void {
    this.save();
    this.showUnsavedModal = false;
    this.executePendingAction();
  }

  unsavedDiscard(): void {
    this.showUnsavedModal = false;
    this.executePendingAction();
  }

  unsavedCancel(): void {
    this.pendingAction = null;
    this.showUnsavedModal = false;
  }

  private executePendingAction(): void {
    const action = this.pendingAction;
    this.pendingAction = null;
    if (action === 'back') this.navigateBack();
    else if (action === 'duplicate') this.executeDuplicate();
  }

  archive(): void {
    const id = this.speechId();
    if (!id) return;
    this.speechService.delete(id);
    this.toast.show('Speech archived');
    this.router.navigate(['/']);
  }

  save(): void {
    const id = this.speechId() || crypto.randomUUID();
    const existing = this.speechId() ? this.speechService.get(this.speechId()!) : undefined;

    const speech: Speech = {
      id,
      name: this.speechName() || 'Untitled Speech',
      text: this.text(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    this.speechService.save(speech);
    this.speechId.set(id);
    this.router.navigate(['/speech', id], { replaceUrl: true });
    this.savedText.set(speech.text);
    this.savedName.set(speech.name);

    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
    this.toast.show('Speech saved');
  }

  restoreSpeech(): void {
    const id = this.speechId();
    if (!id) return;
    const user = this.auth.currentUser();
    if (user?.subscriptionLevel === 'free' && this.speechService.list().length >= this.FREE_LIMIT) {
      this.showUpgradeModal.set(true);
      return;
    }
    this.speechService.restore(id);
    this.isArchived.set(false);
    this.toast.show('Speech restored');
  }

  // ── Teleprompter / Speech Mode ──────────────────────────────────────────

  toggleSpeechMode(): void {
    this.isSpeechMode() ? this.stopSpeechMode() : this.startSpeechMode();
  }

  startSpeechMode(): void {
    this.spokenIndex.set(0);
    this.isSpeechMode.set(true);
    setTimeout(() => {
      this.scrollToWord(0);
      this.startTeleprompterRecognition();
    }, 100);
  }

  stopSpeechMode(): void {
    this.isSpeechMode.set(false);
    this.micActive.set(false);
    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.onerror = null;
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }

  private startTeleprompterRecognition(): void {
    const SR = this.getSR();
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionAny) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        this.advanceByTranscript(event.results[i][0].transcript, event.results[i].isFinal);
      }
    };

    this.recognition.onerror = (e: SpeechRecognitionAny) => {
      if (e.error === 'not-allowed') {
        this.micActive.set(false);
      }
    };

    this.recognition.onend = () => {
      if (this.isSpeechMode()) {
        try {
          this.recognition.start();
        } catch {}
      }
    };

    try {
      this.recognition.start();
      this.micActive.set(true);
    } catch {}
  }

  private advanceByTranscript(transcript: string, isFinal: boolean): void {
    const words = this.normalize(transcript).split(/\s+/).filter(Boolean);
    if (!words.length) return;

    const speech = this.wordTokens();
    let cursor = this.spokenIndex();
    // Use a large lookahead on final results so a few missed words don't stall the teleprompter
    const lookahead = isFinal ? 60 : 20;

    for (const word of words) {
      const limit = Math.min(cursor + lookahead, speech.length);
      for (let i = cursor; i < limit; i++) {
        if (speech[i] === word) {
          cursor = i + 1;
          break;
        }
      }
    }

    if (cursor > this.spokenIndex()) {
      this.spokenIndex.set(cursor);
      this.scrollToWord(cursor);
    }
  }

  private scrollToWord(index: number): void {
    setTimeout(() => {
      const container = this.teleprompterScrollRef?.nativeElement;
      if (!container) return;
      const selector = `.teleprompter__word[data-index="${index}"]`;
      const el = container.querySelector(selector) as HTMLElement;
      if (el) {
        const offset = el.offsetTop - container.clientHeight * 0.3;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, 50);
  }

  // ── Voice-to-Text Dictation ─────────────────────────────────────────────

  toggleDictation(): void {
    this.isDictating() ? this.stopDictation() : this.startDictation();
  }

  private startDictation(): void {
    const SR = this.getSR();
    if (!SR) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    this.dictBaseText = this.text().trimEnd();
    this.isDictating.set(true);
    this.startDictationSession(SR);
  }

  private startDictationSession(SR: SpeechRecognitionAny): void {
    if (!this.isDictating()) return;

    let sessionFinals = '';
    let phraseEndAt = 0; // when the last final was committed
    let pauseMs = 0;     // measured pause before current phrase

    const COMMA_PAUSE = 400;  // ms of silence → comma
    const PERIOD_PAUSE = 1200; // ms of silence → period

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true; // Must be true or the browser drops phrases
    rec.lang = 'en-US';

    rec.onresult = (event: SpeechRecognitionAny) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          // First interim of a new phrase — measure the gap since last final
          if (phraseEndAt > 0 && pauseMs === 0) {
            pauseMs = Date.now() - phraseEndAt;
          }
          continue;
        }

        const t = event.results[i][0].transcript.trim();
        if (!t) continue;

        if (sessionFinals) {
          if (pauseMs >= PERIOD_PAUSE) {
            sessionFinals = sessionFinals.trimEnd().replace(/[,.]?$/, '') + '. ' + this.capitalize(t);
          } else if (pauseMs >= COMMA_PAUSE) {
            sessionFinals = sessionFinals.trimEnd().replace(/[,.]?$/, '') + ', ' + t;
          } else {
            sessionFinals += ' ' + t;
          }
        } else {
          const startsNewSentence = !this.dictBaseText || /[.!?]\s*$/.test(this.dictBaseText);
          sessionFinals = startsNewSentence ? this.capitalize(t) : t;
        }

        phraseEndAt = Date.now();
        pauseMs = 0;

        const full = [this.dictBaseText, sessionFinals].filter(Boolean).join(
          this.dictBaseText && sessionFinals ? ' ' : '',
        );
        this.text.set(full);
      }
    };

    rec.onend = () => {
      this.dictationRecognition = null;
      if (this.isDictating()) {
        // Commit whatever is currently displayed as the new base before restarting
        this.dictBaseText = this.text().trimEnd();
        setTimeout(() => this.startDictationSession(SR), 100);
      }
    };

    rec.onerror = (e: SpeechRecognitionAny) => {
      if (e.error === 'not-allowed') {
        this.isDictating.set(false);
      }
    };

    this.dictationRecognition = rec;
    try {
      rec.start();
    } catch {}
  }

  stopDictation(): void {
    this.isDictating.set(false);
    if (this.dictationRecognition) {
      this.dictationRecognition.onend = null;
      try {
        this.dictationRecognition.stop();
      } catch {}
      this.dictationRecognition = null;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  isSpoken(wordIndex: number): boolean {
    return wordIndex < this.spokenIndex();
  }

  isCurrent(wordIndex: number): boolean {
    return wordIndex === this.spokenIndex();
  }

  private capitalize(text: string): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  private normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9'\s]/g, '');
  }

  private getSR(): SpeechRecognitionAny {
    if (typeof window === 'undefined') return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }
}
