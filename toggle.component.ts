:host {
  display: contents;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--popup-overlay);
    backdrop-filter: blur(3px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 480px) {
    align-items: center;
    padding: 24px;
  }
}

.modal {
  width: 100%;
  max-width: 400px;
  background: var(--popup-bg);
  border-radius: 24px 24px 0 0;
  padding: 32px 24px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (min-width: 480px) {
    border-radius: 20px;
    padding: 36px 28px;
  }

  &__icon {
    font-size: 24px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--primary-ghost);
    color: var(--primary) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    i {
      font-size: 28px;
    }
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 12px;
  }

  &__body {
    margin: 0 0 24px;
    width: 100%;

    ::ng-deep p {
      font-size: 14px;
      color: var(--gray500);
      line-height: 1.6;
      margin: 0;
    }

    ::ng-deep strong {
      color: var(--text-color);
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
}
