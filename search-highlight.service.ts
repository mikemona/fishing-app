:host {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  opacity: 0;
  transform: translateY(-8px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;

  &--visible {
    opacity: 1;
    transform: translateY(0);
  }

  &--success {
    background: var(--success);
    color: var(--success-text);
  }

  &--warning {
    background: var(--warning);
    color: var(--warning-text);
  }

  &--error {
    background: var(--error);
    color: var(--error-text);
  }
}
