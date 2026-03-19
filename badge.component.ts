import { inject } from '@angular/core';
import { CanActivateFn, Routes, Router } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './login/login.component';
import { SpeechListComponent } from './speech-list/speech-list.component';
import { SpeechEditComponent } from './speech-edit/speech-edit.component';
import { SettingsComponent } from './settings/settings.component';

/** Redirect already-authenticated users away from /login. */
const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser() ? router.createUrlTree(['/']) : true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: '', component: SpeechListComponent, canActivate: [authGuard], pathMatch: 'full' },
  { path: 'speech/:id', component: SpeechEditComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
