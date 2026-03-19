import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: '<router-outlet /><app-toast />',
})
export class App {
  constructor(auth: AuthService, theme: ThemeService) {
    // Re-apply the logged-in user's preferences on every page load / refresh.
    const user = auth.currentUser();
    if (user) {
      theme.init(user.appearance, user.primaryColor);
    }
  }
}
