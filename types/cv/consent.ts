// types/cv/consent.ts
export type ShowAIConsent = {
  (): void;
  (onAccepted: () => void): void;
};
