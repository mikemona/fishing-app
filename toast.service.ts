<div class="toggle" (click)="toggle()">
  @if (label) {
    <span class="toggle__label">{{ label }}</span>
  }
  <button class="toggle__track" [class.toggle__track--on]="checked" type="button">
    <span class="toggle__thumb"></span>
  </button>
</div>
