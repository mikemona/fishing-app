import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ButtonComponent } from '../components/button/button.component';

type Mode = 'signin' | 'signup';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  mode = signal<Mode>('signin');
  error = signal('');
  loading = signal(false);

  // Sign in fields
  siUsername = '';
  siPassword = '';

  // Sign up fields
  suFirstName = '';
  suLastName = '';
  suEmail = '';
  suUsername = '';
  suPassword = '';
  suConfirm = '';

  constructor(
    private auth: AuthService,
    private theme: ThemeService,
    private router: Router,
  ) {}

  setMode(mode: Mode): void {
    this.mode.set(mode);
    this.error.set('');
  }

  signIn(): void {
    if (!this.siUsername || !this.siPassword) {
      this.error.set('Please enter your username and password.');
      return;
    }
    const result = this.auth.signIn(this.siUsername, this.siPassword);
    if (!result.success) {
      this.error.set(result.error ?? 'Sign in failed.');
      return;
    }
    this.applyUserPreferences();
    this.router.navigate(['/']);
  }

  signUp(): void {
    if (!this.suFirstName || !this.suLastName || !this.suEmail || !this.suUsername || !this.suPassword) {
      this.error.set('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.suEmail)) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    if (this.suPassword !== this.suConfirm) {
      this.error.set('Passwords do not match.');
      return;
    }
    if (this.suPassword.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    const result = this.auth.signUp(
      this.suFirstName,
      this.suLastName,
      this.suUsername,
      this.suPassword,
      this.suEmail,
    );
    if (!result.success) {
      this.error.set(result.error ?? 'Sign up failed.');
      return;
    }
    this.applyUserPreferences();
    this.router.navigate(['/']);
  }

  private applyUserPreferences(): void {
    this.theme.init(this.auth.preferredAppearance(), this.auth.preferredColor());
  }
}
