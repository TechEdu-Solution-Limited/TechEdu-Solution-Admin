"use client";

import CVBuilderMain from "@/components/builder/CVBuilderMain";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CVBuilderState } from "@/types/cv-builder";

export default function ResumeBuilder() {
  return (
    <ErrorBoundary>
      <CVBuilderMain
        autoSaveConfig={{
          enabled: true,
          interval: 10000, // 30 seconds
          debounceDelay: 500, // 2 seconds
          onSave: async (state: CVBuilderState) => {
            try {
              console.log("Auto-saving state:", state);
              // Save to localStorage for persistence
              localStorage.setItem("cv-builder-state", JSON.stringify(state));
              console.log("Auto-save successful, saved to localStorage");
            } catch (error) {
              console.error("Auto-save failed:", error);
              throw error;
            }
          },
        }}
        onStateChange={(state: CVBuilderState) => {
          // Handle state changes if needed
          console.log("State changed:", state);
        }}
        onSave={async (state: CVBuilderState) => {
          try {
            // Save to localStorage for persistence
            localStorage.setItem("cv-builder-state", JSON.stringify(state));
            console.log("Manual save successful:", state);
          } catch (error) {
            console.error("Manual save failed:", error);
            throw error;
          }
        }}
        onLoad={async (id: string) => {
          try {
            console.log("onLoad called with id:", id);
            // Load from localStorage
            const savedState = localStorage.getItem("cv-builder-state");
            console.log("Raw saved state from localStorage:", savedState);

            if (savedState) {
              const parsedState = JSON.parse(savedState);
              console.log("Parsed state from localStorage:", parsedState);
              return parsedState;
            }
            console.log("No saved state found, using defaults");
            return {};
          } catch (error) {
            console.error("Load failed:", error);
            return {};
          }
        }}
        onExport={async (state: CVBuilderState) => {
          // Handle export
          console.log("Exporting CV:", state);
        }}
      />
    </ErrorBoundary>
  );
}
