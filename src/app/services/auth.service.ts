import { Injectable, signal } from '@angular/core';
import { User, Appearance } from '../models/user';

const USERS_KEY = 'tp_users';
const SESSION_KEY = 'tp_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (typeof localStorage === 'undefined') return;
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return;
    const user = this.getUsers().find((u) => u.id === id);
    if (user) this._currentUser.set(user);
  }

  private getUsers(): User[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  signUp(
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    email: string,
  ): { success: boolean; error?: string } {
    const users = this.getUsers();
    if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already taken' };
    }
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with that email already exists' };
    }
    const user: User = {
      id: crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      password,
      email: email.trim(),
      subscriptionLevel: 'free',
      primaryColor: '#0f5cf5',
      appearance: 'system',
    };
    users.push(user);
    this.saveUsers(users);
    this.setSession(user);
    return { success: true };
  }

  signIn(username: string, password: string): { success: boolean; error?: string } {
    const user = this.getUsers().find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password,
    );
    if (!user) return { success: false, error: 'Invalid username or password' };
    this.setSession(user);
    return { success: true };
  }

  signOut(): void {
    this._currentUser.set(null);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(SESSION_KEY);
  }

  updateUser(updates: Partial<Pick<User, 'primaryColor' | 'appearance' | 'firstName' | 'lastName' | 'username' | 'photo' | 'email'>>): void {
    const current = this._currentUser();
    if (!current) return;
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    const updated = { ...current, ...updates };
    if (idx >= 0) users[idx] = updated;
    this.saveUsers(users);
    this._currentUser.set(updated);
  }

  updateProfile(updates: { firstName: string; lastName: string; username: string; photo?: string }): { success: boolean; error?: string } {
    const current = this._currentUser();
    if (!current) return { success: false, error: 'Not signed in' };
    if (updates.username.toLowerCase() !== current.username.toLowerCase()) {
      const users = this.getUsers();
      if (users.find((u) => u.id !== current.id && u.username.toLowerCase() === updates.username.toLowerCase())) {
        return { success: false, error: 'Username already taken' };
      }
    }
    this.updateUser(updates);
    return { success: true };
  }

  initials(): string {
    const u = this._currentUser();
    if (!u) return '';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  preferredAppearance(): Appearance {
    return this._currentUser()?.appearance ?? 'system';
  }

  preferredColor(): string {
    return this._currentUser()?.primaryColor ?? '#0f5cf5';
  }

  private setSession(user: User): void {
    this._currentUser.set(user);
    if (typeof localStorage !== 'undefined') localStorage.setItem(SESSION_KEY, user.id);
  }
}
