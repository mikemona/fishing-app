@if (toastService.toast(); as t) {
  <div
    class="toast"
    [class.toast--visible]="toastService.visible()"
    [class.toast--success]="t.type === 'success'"
    [class.toast--warning]="t.type === 'warning'"
    [class.toast--error]="t.type === 'error'"
    (click)="toastService.dismiss()"
  >
    <i
      class="fas"
      [class.fa-circle-check]="t.type === 'success'"
      [class.fa-triangle-exclamation]="t.type === 'warning'"
      [class.fa-circle-xmark]="t.type === 'error'"
    ></i>
    {{ t.message }}
  </div>
}
