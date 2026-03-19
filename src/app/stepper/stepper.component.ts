import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import { StepperItemComponent } from '../stepper-item/stepper-item.component';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, StepperItemComponent],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss', '../../styles.scss'],
})
export class StepperComponent implements AfterContentInit {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() baseRoute = '';

  constructor(
    private router: Router,
    private elRef: ElementRef<HTMLElement>,
  ) {}

  @ContentChildren(StepperItemComponent, { descendants: false })
  items!: QueryList<StepperItemComponent>;

  activeIndex = 0;
  activeChildIndex = 0;

  isMobile = false;
  mobileAccordionOpen = false;

  itemsArray: StepperItemComponent[] = [];

  ngAfterContentInit() {
    this.syncItems();

    this.items.changes.subscribe(() => {
      this.syncItems();
    });

    if (typeof window !== 'undefined') {
      this.checkScreen();
    }
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncFromUrl());

    // initial sync
    this.syncFromUrl();
  }

  /* ---------- Step selection ---------- */

  selectStep(index: number) {
    const item = this.itemsArray[index];

    if (!item || item.disabled) return;

    // Group step toggles expansion instead of navigating
    if (item.hasChildren) {
      item.expanded = !item.expanded;

      // this.activeChildIndex = 0;
      // this.updateItems();
      return;
    }

    // Leaf step shows its own content
    this.activeIndex = index;
    this.activeChildIndex = 0;
    this.updateItems();

    if (item.route) {
      this.router.navigate(['/', this.baseRoute, item.route]);
    }

    // Optional: close mobile accordion when selecting leaf
    if (this.isMobile) {
      this.mobileAccordionOpen = false;
    }
  }

  selectChild(stepIndex: number, childIndex: number) {
    const parent = this.itemsArray[stepIndex];
    if (!parent) return;

    // optional: block if parent disabled
    if (parent.status === 'disabled') return;

    // ✅ define child before using it
    const child = parent.childrenArray[childIndex];
    if (!child) return;

    // optional: block if child disabled
    if (child.status === 'disabled') return;

    this.activeIndex = stepIndex;
    this.activeChildIndex = childIndex;

    parent.expanded = true;

    this.updateItems();
    if (child.route) {
      this.router.navigate(['/', this.baseRoute, child.route]);
    }

    if (this.isMobile) {
      this.mobileAccordionOpen = false;
    }
  }

  /* ---------- Internal sync ---------- */

  private syncItems() {
    this.itemsArray = this.items.toArray();

    // Clamp activeIndex
    const maxIndex = this.itemsArray.length - 1;
    this.activeIndex = Math.max(0, Math.min(this.activeIndex, maxIndex));

    const current = this.itemsArray[this.activeIndex];
    if (current?.hasChildren) {
      const maxChild = current.childrenArray.length - 1;
      this.activeChildIndex = Math.max(0, Math.min(this.activeChildIndex, maxChild));
      current.expanded = true;
    } else {
      this.activeChildIndex = 0;
    }

    // ✅ NEW: derive parent statuses from children
    this.updateParentStatuses();

    this.updateItems();
  }

  private updateItems() {
    this.itemsArray.forEach((item, i) => {
      item.active = i === this.activeIndex;
      item.activeChildIndex = i === this.activeIndex ? this.activeChildIndex : 0;
    });
  }

  private updateParentStatuses() {
    this.itemsArray.forEach((item) => {
      if (!item.hasChildren) return;

      const children = item.childrenArray;

      if (!children.length) return;

      const allSuccess = children.every((child) => child.status === 'success');

      // Only promote to success automatically
      if (allSuccess) {
        item.status = 'success';
      }
    });
  }

  /* ---------- Screen detection ---------- */

  private checkScreen() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 720;
    } else {
      this.isMobile = false;
    }

    if (!this.isMobile) {
      this.mobileAccordionOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.checkScreen();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isMobile || !this.mobileAccordionOpen) return;

    const target = event.target as Node | null;
    if (!target) return;

    // If click happened outside this stepper, close
    if (!this.elRef.nativeElement.contains(target)) {
      this.mobileAccordionOpen = false;
    }
  }

  /* ---------- Active helpers ---------- */

  get activeItem() {
    return this.itemsArray[this.activeIndex];
  }

  get activeContent() {
    const item = this.itemsArray[this.activeIndex];
    if (!item) return null;

    // Group: show active child page
    if (item.hasChildren) {
      return item.activeChild?.content ?? null;
    }

    // Leaf: show its page
    return item.content ?? null;
  }

  /* ---------- Mobile accordion ---------- */

  toggleMobileAccordion(force?: boolean) {
    if (force !== undefined) {
      this.mobileAccordionOpen = force;
    } else {
      this.mobileAccordionOpen = !this.mobileAccordionOpen;
    }
  }

  get headerTitle(): string {
    const parent = this.activeItem;
    if (!parent) return '';

    // If parent has children, title should be the active child's label
    if (parent.hasChildren) {
      return parent.activeChild?.label ?? parent.label;
    }

    // Leaf step
    return parent.label;
  }

  get headerSubtitle(): string | null {
    const parent = this.activeItem;
    if (!parent) return null;

    // Only show subtitle when a sub item is selected
    if (parent.hasChildren && parent.activeChild) {
      return parent.label; // parent label
    }

    return null;
  }

  /* ---------- Route helpers ---------- */

  private getCurrentRouteKey(): string {
    if (typeof window === 'undefined') return '';

    // /onboarding/welcome -> "welcome"
    // /onboarding/i9/document-verification -> "i9/document-verification"
    const path = window.location.pathname.replace(/^\/+/, '');
    const parts = path.split('/');

    // remove baseRoute if present
    if (parts[0] === this.baseRoute) parts.shift();

    return parts.join('/');
  }

  private syncFromUrl() {
    const key = this.getCurrentRouteKey();
    if (!key) return;

    // Try match top-level item route
    const parentIndex = this.itemsArray.findIndex((it) => it.route === key);
    if (parentIndex >= 0) {
      this.activeIndex = parentIndex;
      this.activeChildIndex = 0;
      this.updateItems();
      return;
    }

    // Try match child route
    for (let i = 0; i < this.itemsArray.length; i++) {
      const parent = this.itemsArray[i];
      const childIndex = parent.childrenArray.findIndex((c) => c.route === key);
      if (childIndex >= 0) {
        this.activeIndex = i;
        this.activeChildIndex = childIndex;
        parent.expanded = true;
        this.updateItems();
        return;
      }
    }
  }
}
