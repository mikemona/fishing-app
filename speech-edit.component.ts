<div class="login">
  <div class="login__card">
    <div class="login__logo">
      <svg width="162" height="152" viewBox="0 0 162 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SpeechFlo">
        <rect x="66" width="44" height="8" rx="4" fill="white" fill-opacity="0.4"/>
        <rect x="44" y="16" width="44" height="8" rx="4" fill="white" fill-opacity="0.4"/>
        <rect x="22" y="32" width="44" height="8" rx="4" fill="white" fill-opacity="0.4"/>
        <rect x="22" y="64" width="44" height="8" rx="4" fill="white" fill-opacity="0.4"/>
        <rect y="48" width="44" height="8" rx="4" fill="white" fill-opacity="0.4"/>
        <rect x="96" y="56" width="44" height="8" rx="4" transform="rotate(-180 96 56)" fill="white" fill-opacity="0.4"/>
        <rect x="66" y="96" width="44" height="8" rx="4" fill="white"/>
        <rect x="44" y="80" width="44" height="8" rx="4" fill="white"/>
        <rect x="96" y="152" width="44" height="8" rx="4" transform="rotate(-180 96 152)" fill="white"/>
        <rect x="118" y="136" width="44" height="8" rx="4" transform="rotate(-180 118 136)" fill="white"/>
        <rect x="118" y="72" width="44" height="8" rx="4" transform="rotate(-180 118 72)" fill="white"/>
        <rect x="140" y="120" width="44" height="8" rx="4" transform="rotate(-180 140 120)" fill="white"/>
        <rect x="140" y="88" width="44" height="8" rx="4" transform="rotate(-180 140 88)" fill="white"/>
        <rect x="162" y="104" width="44" height="8" rx="4" transform="rotate(-180 162 104)" fill="white"/>
      </svg>
    </div>
    <h1 class="login__title">Speechflo</h1>
    <p class="login__subtitle">Your personal teleprompter</p>

    <div class="login__tabs">
      <button
        class="login__tab"
        [class.login__tab--active]="mode() === 'signin'"
        (click)="setMode('signin')"
      >
        Sign In
      </button>
      <button
        class="login__tab"
        [class.login__tab--active]="mode() === 'signup'"
        (click)="setMode('signup')"
      >
        Create Account
      </button>
    </div>

    @if (error()) {
      <div class="login__error"><i class="fas fa-circle-exclamation"></i> {{ error() }}</div>
    }

    @if (mode() === 'signin') {
      <div class="login__form">
        <div class="login__field">
          <label class="login__label">Username</label>
          <input
            class="login__input"
            type="text"
            [(ngModel)]="siUsername"
            placeholder="Enter your username"
            autocomplete="username"
            autocapitalize="none"
            (keyup.enter)="signIn()"
          />
        </div>
        <div class="login__field">
          <label class="login__label">Password</label>
          <input
            class="login__input"
            type="password"
            [(ngModel)]="siPassword"
            placeholder="Enter your password"
            autocomplete="current-password"
            (keyup.enter)="signIn()"
          />
        </div>
        <app-button variant="primary" [block]="true" (click)="signIn()">Sign In</app-button>
      </div>
    }

    @if (mode() === 'signup') {
      <div class="login__form">
        <div class="login__field-row">
          <div class="login__field">
            <label class="login__label">First Name</label>
            <input
              class="login__input"
              type="text"
              [(ngModel)]="suFirstName"
              placeholder="First"
              autocomplete="given-name"
            />
          </div>
          <div class="login__field">
            <label class="login__label">Last Name</label>
            <input
              class="login__input"
              type="text"
              [(ngModel)]="suLastName"
              placeholder="Last"
              autocomplete="family-name"
            />
          </div>
        </div>
        <div class="login__field">
          <label class="login__label">Email</label>
          <input
            class="login__input"
            type="email"
            [(ngModel)]="suEmail"
            placeholder="you@example.com"
            autocomplete="email"
            autocapitalize="none"
          />
        </div>
        <div class="login__field">
          <label class="login__label">Username</label>
          <input
            class="login__input"
            type="text"
            [(ngModel)]="suUsername"
            placeholder="Choose a username"
            autocomplete="username"
            autocapitalize="none"
          />
        </div>
        <div class="login__field">
          <label class="login__label">Password</label>
          <input
            class="login__input"
            type="password"
            [(ngModel)]="suPassword"
            placeholder="At least 6 characters"
            autocomplete="new-password"
          />
        </div>
        <div class="login__field">
          <label class="login__label">Confirm Password</label>
          <input
            class="login__input"
            type="password"
            [(ngModel)]="suConfirm"
            placeholder="Repeat password"
            autocomplete="new-password"
            (keyup.enter)="signUp()"
          />
        </div>
        <app-button variant="primary" [block]="true" (click)="signUp()">Create Account</app-button>
      </div>
    }
  </div>
</div>
