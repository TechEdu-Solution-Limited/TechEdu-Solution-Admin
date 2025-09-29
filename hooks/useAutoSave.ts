import { useEffect, useRef, useCallback, useState } from "react";
import { CVBuilderState, AutoSaveConfig } from "@/types/cv-builder";
import { debounce } from "lodash";

interface UseAutoSaveProps {
  state: CVBuilderState;
  config: AutoSaveConfig;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
  clearLastSaved: () => void;
}

export function useAutoSave({
  state,
  config,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveProps): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef<CVBuilderState | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (currentState: CVBuilderState) => {
      if (!config.enabled) return;

      setIsSaving(true);
      try {
        await config.onSave(currentState);
        setLastSaved(new Date());
        onSaveSuccess?.();
      } catch (error) {
        console.error("Auto-save failed:", error);
        onSaveError?.(error as Error);
      } finally {
        setIsSaving(false);
      }
    }, config.debounceDelay),
    [config, onSaveSuccess, onSaveError]
  );

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!config.enabled) return;

    // Cancel any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    try {
      await config.onSave(state);
      setLastSaved(new Date());
      onSaveSuccess?.();
    } catch (error) {
      console.error("Manual save failed:", error);
      onSaveError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  }, [config, state, onSaveSuccess, onSaveError]);

  // Clear last saved timestamp
  const clearLastSaved = useCallback(() => {
    setLastSaved(null);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!config.enabled) return;

    // Skip initial render
    if (previousStateRef.current === null) {
      previousStateRef.current = state;
      return;
    }

    // Check if state has actually changed
    const hasChanged =
      JSON.stringify(previousStateRef.current) !== JSON.stringify(state);

    if (hasChanged) {
      previousStateRef.current = state;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave(state);
      }, config.interval);
    }

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, config, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveNow,
    clearLastSaved,
  };
}
