:host {
  display: contents;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  white-space: nowrap;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  // ── Primary ───────────────────────────────────────────────────────────────
  // Solid primary-color background, white text. Use for main CTAs.

  &--primary {
    min-height: 36px;
    padding: 8px 16px;
    background: var(--primary);
    color: #fff;
    border-radius: var(--btn-border-radius);
    font-size: 15px;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--primary-hover);
    }

    &:active:not(:disabled) {
      opacity: 0.85;
    }
  }

  // ── Ghost ─────────────────────────────────────────────────────────────────
  // Translucent primary background, primary-color text. Use for secondary CTAs
  // alongside a primary button (e.g. the upgrade icon circle).

  &--ghost {
    min-height: 36px;
    padding: 8px 16px;
    background: var(--primary-ghost);
    color: var(--primary);
    border-radius: var(--btn-border-radius);
    font-size: 15px;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--primary-info);
    }

    &:active:not(:disabled) {
      opacity: 0.8;
    }
  }

  :host-context([data-theme='dark']) &--ghost {
    background: var(--gray150);

    &:hover {
      background-color: var(--gray200);
    }
  }

  // ── Link ──────────────────────────────────────────────────────────────────
  // Transparent background, primary-color text. Use for low-emphasis actions.

  &--link {
    min-height: 36px;
    padding: 8px 16px;
    background: transparent;
    color: var(--primary);
    border-radius: var(--btn-border-radius);
    font-size: inherit;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--primary-ghost);
    }

    &:active:not(:disabled) {
      opacity: 0.7;
    }
  }

  // ── Text ──────────────────────────────────────────────────────────────────
  // Transparent background, text-color text. Use for low-emphasis actions.

  &--text {
    min-height: 36px;
    padding: 8px 16px;
    background: transparent;
    color: var(--text-color);
    border-radius: var(--btn-border-radius);
    font-size: inherit;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--gray100);
      color: var(--primary);
    }

    &:active:not(:disabled) {
      opacity: 0.7;
    }
  }

  // ── Outline ───────────────────────────────────────────────────────────────
  // Light gray background, text-color text, border. Use for special CTAs.

  &--outline {
    min-height: 36px;
    padding: 8px 16px;
    background: var(--gray100);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: var(--btn-border-radius);
    font-size: 15px;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--gray200);
    }

    &:active:not(:disabled) {
      opacity: 0.85;
    }
  }

  // ── Inline ──────────────────────────────────────────────────────────────────
  // Transparent background, primary-color text. Use for inline links.

  &--inline {
    padding: 0;
    background: transparent;
    color: var(--primary);
    border-radius: var(--btn-border-radius);
    font-size: inherit;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: var(--primary-hover);
    }

    &:active:not(:disabled) {
      opacity: 0.7;
    }
  }

  // ── Circle ────────────────────────────────────────────────────────────────
  // 36 × 36 round button. Matches the back button and settings icon button.

  &--circle {
    width: 36px;
    height: 36px;
    padding: 0;
    background: var(--gray100);
    color: var(--text-color);
    border-radius: 50%;
    font-size: 14px;
    flex-shrink: 0;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: var(--primary);
    }

    &:active:not(:disabled) {
      background: var(--gray200);
    }
  }

  // ── Small ─────────────────────────────────────────────────────────────────
  // Pill-shaped button with a border. Matches the "Edit" profile button.

  &--small {
    padding: 6px 20px;
    background: var(--gray100);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--gray200);
    }

    &:active:not(:disabled) {
      background: var(--gray300);
    }
  }

  // ── Small Plain ───────────────────────────────────────────────────────────
  // Same pill shape but no border or background. Matches "Maybe Later"-style
  // dismiss buttons.

  &--small-plain {
    padding: 6px 20px;
    background: transparent;
    color: var(--gray500);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: var(--primary);
    }

    &:active:not(:disabled) {
      opacity: 0.7;
    }
  }

  // ── Block modifier ────────────────────────────────────────────────────────
  // Makes the button fill its container. Combine with any variant.

  &--block {
    width: 100%;
  }
}
