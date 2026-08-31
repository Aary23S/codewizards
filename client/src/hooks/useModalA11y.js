// codewizards/client/src/hooks/useModalA11y.js
// Shared Escape-to-close + focus-trap behavior for the app's modal/lightbox overlays,
// so keyboard and screen-reader users aren't stuck once one opens.
import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useModalA11y = (containerRef, isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return undefined;

    const container = containerRef.current;
    const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusable[0] || container).focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const items = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, containerRef, onClose]);
};
