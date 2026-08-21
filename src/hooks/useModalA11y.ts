// src/hooks/useModalA11y.ts
//
// The keyboard and focus behaviour every dialog needs, for the hand-rolled
// modals across the app that each render their own markup. `components/common/
// Modal.tsx` already does all of this internally — use that for new dialogs.
// This hook exists so existing modals can get the same behaviour without
// having their layout rewritten:
//
//   const panelRef = useModalA11y(isOpen, onClose);
//   ...
//   <div ref={panelRef} className="...">   // the dialog panel
//
// Covers: Escape to close, Tab/Shift+Tab focus trap, body scroll lock, and
// restoring focus to whatever was focused before the dialog opened.

import { useCallback, useEffect, useRef } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalA11y(
  isOpen: boolean,
  onClose: () => void,
  options: { closeOnEscape?: boolean } = {}
) {
  const { closeOnEscape = true } = options;
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Remember the trigger, move focus into the dialog, and put it back on close.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      if (first) first.focus();
      else panel.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [isOpen, onClose, closeOnEscape]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Stop the page behind the dialog from scrolling.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return panelRef;
}

export default useModalA11y;
