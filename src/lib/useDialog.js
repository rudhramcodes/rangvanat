import { useEffect, useRef } from 'react';

export function useDialog(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const root = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => [...root.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea,summary,[tabindex="0"]')]
      .filter(node => !node.closest('[inert]') && (node.tagName === 'SUMMARY' || !node.closest('details:not([open])')));
    // Persistent drawers need a painted visible state before they can receive focus.
    const focusTimer = setTimeout(() => focusable()[0]?.focus(), 50);
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab') {
        const nodes = focusable(), first = nodes[0], last = nodes.at(-1);
        if (!first) { e.preventDefault(); return; }
        if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', key);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}
