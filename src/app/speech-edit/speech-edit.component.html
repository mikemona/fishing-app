<div class="speech-view">
  <!-- ── Edit Screen ───────────────────────────────────────────────────── -->
  @if (!isSpeechMode()) {
    <div class="speech-edit">
      <header class="speech-edit__header">
        <app-button variant="circle" (click)="goBack()" title="Back">
          <i class="fas fa-arrow-left"></i>
        </app-button>
        <input
          class="speech-edit__name-input"
          [ngModel]="speechName()"
          (ngModelChange)="speechName.set($event)"
          placeholder="Speech name..."
          maxlength="80"
          [attr.readonly]="isArchived() || null"
        />
        @if (isArchived()) {
          <app-button variant="text" (click)="restoreSpeech()" title="Restore">
            <i class="fas fa-rotate-left"></i>
          </app-button>
        } @else {
          <app-dropdown>
            <app-dropdown-item (click)="duplicate()">
              <i class="fas fa-copy"></i> Duplicate
            </app-dropdown-item>
            <app-dropdown-item [danger]="true" (click)="archive()">
              <i class="fas fa-trash"></i> Delete
            </app-dropdown-item>
          </app-dropdown>
          <app-button variant="primary" (click)="save()">
            @if (saved()) {
              <i class="fas fa-check"></i>
            } @else {
              Save
            }
          </app-button>
        }
      </header>

      @if (isArchived()) {
        <div class="speech-edit__archived-banner">
          <i class="fas fa-box-archive"></i> This speech is archived and read-only.
        </div>
      }

      <div class="speech-edit__content">
        <textarea
          class="speech-edit__textarea"
          [ngModel]="text()"
          (ngModelChange)="text.set($event)"
          placeholder="Type your speech here, or use the mic button below to speak it..."
          spellcheck="true"
          [attr.readonly]="isArchived() || null"
        ></textarea>
        @if (isDictating() && !isArchived()) {
          <div class="speech-edit__dictation-indicator">
            <span class="speech-edit__pulse-dot"></span> Listening...
          </div>
        }
      </div>
    </div>
  }

  <!-- ── Teleprompter / Speech Mode ───────────────────────────────────── -->
  @if (isSpeechMode()) {
    <div class="teleprompter">
      <div class="teleprompter__header">
        <div class="teleprompter__mic" [class.teleprompter__mic--active]="micActive()">
          <i class="fas fa-microphone"></i>
        </div>
        <div class="teleprompter__progress">
          <div class="teleprompter__progress-fill" [style.width.%]="progress()"></div>
        </div>
      </div>

      <div class="teleprompter__scroll" #teleprompterScroll>
        <div class="teleprompter__text">
          @for (token of tokens(); track $index) {
            @if (token.isBreak) {
              <br />
            } @else if (token.isWord) {
              <span
                class="teleprompter__word"
                [attr.data-index]="token.wordIndex"
                [class.teleprompter__word--spoken]="isSpoken(token.wordIndex!)"
                [class.teleprompter__word--current]="isCurrent(token.wordIndex!)"
                >{{ token.text }}</span
              >
            } @else {
              {{ token.text }}
            }
          }
        </div>
      </div>
    </div>
  }

  <!-- ── Toolbar — always mounted so toggle transition plays ──────────── -->
  @if (!isArchived()) {
    <app-speech-toolbar
      [isDictating]="isDictating()"
      [isSpeechMode]="isSpeechMode()"
      (dictateToggle)="toggleDictation()"
      (speechModeToggle)="toggleSpeechMode()"
    ></app-speech-toolbar>
  }

  @if (showUnsavedModal) {
    <div class="unsaved-overlay" (click)="unsavedCancel()">
      <div class="unsaved-dialog" (click)="$event.stopPropagation()">
        <div class="unsaved-dialog__icon"><i class="fas fa-pen"></i></div>
        <h2 class="unsaved-dialog__title">Unsaved Changes</h2>
        <p class="unsaved-dialog__body">
          You have unsaved changes.
          @if (pendingAction === 'duplicate') {
            Save before duplicating?
          } @else {
            Save before leaving?
          }
        </p>
        <div class="unsaved-dialog__actions">
          <app-button variant="primary" [block]="true" (click)="unsavedSaveAndContinue()"
            >Save &amp; Continue</app-button
          >
          <app-button variant="ghost" [block]="true" (click)="unsavedDiscard()"
            >Discard Changes</app-button
          >
          <app-button variant="small-plain" [block]="true" (click)="unsavedCancel()"
            >Cancel</app-button
          >
        </div>
      </div>
    </div>
  }

  @if (showUpgradeModal()) {
    <app-modal title="Speech Limit Reached" [hasIcon]="true" (close)="showUpgradeModal.set(false)">
      <i modal-icon class="fas fa-star"></i>
      <p modal-body>
        Free plans are limited to <strong>3 speeches</strong>. Upgrade to Pro for unlimited speeches
        and more.
      </p>
      <app-button
        modal-actions
        variant="primary"
        [block]="true"
        (click)="showUpgradeModal.set(false)"
      >
        Upgrade to Pro
      </app-button>
      <app-button
        modal-actions
        variant="small-plain"
        [block]="true"
        (click)="showUpgradeModal.set(false)"
      >
        Maybe Later
      </app-button>
    </app-modal>
  }
</div>
