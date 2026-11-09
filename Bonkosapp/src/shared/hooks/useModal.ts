import { type RefObject, useEffect } from "react";

const FOCUSABLE = "a[href], button, select, input, [tabindex='0']";

/** Modal behaviour of a panel: focus enters and stays inside, Escape closes, the page behind holds still. */
export function useModal(panel: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const opener = document.activeElement;
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    document.documentElement.dataset.locked = "";
    return () => {
      delete document.documentElement.dataset.locked;
      if (opener instanceof HTMLElement) {
        opener.focus();
      }
    };
  }, [panel]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      const items = [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
      const [first, last] = [items[0], items.at(-1)];
      if (event.key !== "Tab" || !first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [panel, onClose]);
}
