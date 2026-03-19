import { Component, Input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'pro' | 'danger' | 'warning';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrls: ['./badge.component.scss'],
  host: { '[class]': '"badge badge--" + variant' },
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
}
