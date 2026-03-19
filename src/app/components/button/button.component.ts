import { Component, Input } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'ghost'
  | 'link'
  | 'text'
  | 'outline'
  | 'inline'
  | 'circle'
  | 'small'
  | 'small-plain';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() title = '';
  @Input() disabled = false;
  /** Stretch the button to fill its container width */
  @Input() block = false;
}
