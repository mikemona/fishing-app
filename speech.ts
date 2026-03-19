import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ToggleComponent } from '../toggle/toggle.component';

@Component({
  selector: 'app-speech-toolbar',
  standalone: true,
  imports: [ButtonComponent, ToggleComponent],
  templateUrl: './speech-toolbar.component.html',
  styleUrls: ['./speech-toolbar.component.scss'],
})
export class SpeechToolbarComponent {
  @Input() isDictating = false;
  @Input() isSpeechMode = false;

  @Output() dictateToggle = new EventEmitter<void>();
  @Output() speechModeToggle = new EventEmitter<void>();
}
