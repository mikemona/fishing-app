import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  TemplateRef,
  ViewChild,
  AfterContentInit,
} from '@angular/core';

export type StepStatus = 'default' | 'success' | 'warning' | 'error' | 'disabled';

@Component({
  selector: 'app-stepper-item',
  standalone: true,

  // ✅ IMPORTANT: this component captures content ONLY.
  // The Stepper renders labels in the sidebar.
  template: `
    <ng-template #contentTpl>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class StepperItemComponent implements AfterContentInit {
  @Input() label = '';
  @Input() status: StepStatus = 'default';
  @Input() route?: string;

  // ✅ only direct children (substeps)
  @ContentChildren(StepperItemComponent, { descendants: false })
  children!: QueryList<StepperItemComponent>;

  // ✅ captured content for THIS item
  @ViewChild('contentTpl', { static: true })
  content!: TemplateRef<any>;

  active = false;
  expanded = false;
  activeChildIndex = 0;

  childrenArray: StepperItemComponent[] = [];

  ngAfterContentInit() {
    this.childrenArray = this.children?.toArray() ?? [];

    // keep childrenArray updated if content changes
    this.children.changes.subscribe(() => {
      this.childrenArray = this.children.toArray();
    });
  }

  get hasChildren() {
    return this.childrenArray.length > 0;
  }

  get activeChild() {
    return this.childrenArray[this.activeChildIndex];
  }

  get disabled() {
    return this.status === 'disabled';
  }
}
