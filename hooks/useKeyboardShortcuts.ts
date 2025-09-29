import { useEffect, useCallback } from "react";
import { KeyboardShortcut } from "@/types/cv-builder";

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrlKey;
        const shiftMatches = !!event.shiftKey === !!shortcut.shiftKey;
        const altMatches = !!event.altKey === !!shortcut.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
        }
      });
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// Predefined shortcuts for CV builder
export const CVBuilderShortcuts = {
  save: (action: () => void): KeyboardShortcut => ({
    key: "s",
    ctrlKey: true,
    action,
    description: "Save CV",
  }),

  saveDraft: (action: () => void): KeyboardShortcut => ({
    key: "s",
    ctrlKey: true,
    shiftKey: true,
    action,
    description: "Save as Draft",
  }),

  export: (action: () => void): KeyboardShortcut => ({
    key: "e",
    ctrlKey: true,
    action,
    description: "Export PDF",
  }),

  preview: (action: () => void): KeyboardShortcut => ({
    key: "p",
    ctrlKey: true,
    action,
    description: "Toggle Preview",
  }),

  undo: (action: () => void): KeyboardShortcut => ({
    key: "z",
    ctrlKey: true,
    action,
    description: "Undo",
  }),

  redo: (action: () => void): KeyboardShortcut => ({
    key: "y",
    ctrlKey: true,
    action,
    description: "Redo",
  }),

  nextSection: (action: () => void): KeyboardShortcut => ({
    key: "ArrowRight",
    ctrlKey: true,
    action,
    description: "Next Section",
  }),

  prevSection: (action: () => void): KeyboardShortcut => ({
    key: "ArrowLeft",
    ctrlKey: true,
    action,
    description: "Previous Section",
  }),

  addSection: (action: () => void): KeyboardShortcut => ({
    key: "n",
    ctrlKey: true,
    action,
    description: "Add New Section",
  }),

  toggleMode: (action: () => void): KeyboardShortcut => ({
    key: "m",
    ctrlKey: true,
    action,
    description: "Toggle Builder Mode",
  }),
};
