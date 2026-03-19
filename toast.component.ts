import { Component, HostListener, signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <app-button variant="text" (click)="toggle()" title="Options">
      <i class="fas fa-ellipsis"></i>
    </app-button>
    @if (open()) {
      <div class="dropdown__panel" (click)="open.set(false)">
        <ng-content></ng-content>
      </div>
    }
  `,
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  @HostListener('click', ['$event'])
  stopProp(e: Event): void {
    e.stopPropagation();
  }

  @HostListener('document:click')
  closeOnOutside(): void {
    if (this.open()) this.open.set(false);
  }
}
