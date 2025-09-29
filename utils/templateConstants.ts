/**
 * Template Constants
 *
 * Standardized spacing, sizing, and styling constants for all template renderers
 */

// Spacing Constants (in pixels)
export const SPACING = {
  // Margins
  xs: 4, // 1 unit
  sm: 8, // 2 units
  md: 12, // 3 units
  lg: 16, // 4 units
  xl: 20, // 5 units
  xxl: 24, // 6 units
  xxxl: 32, // 8 units

  // Padding
  paddingXs: 4,
  paddingSm: 8,
  paddingMd: 12,
  paddingLg: 16,
  paddingXl: 20,
  paddingXxl: 24,
  paddingXxxl: 32,
} as const;

// Font Sizes (in pixels)
export const FONT_SIZES = {
  // PDF Font Sizes (smaller for A4)
  pdf: {
    page: 10,
    name: 24,
    title: 16,
    heading: 12,
    body: 10,
    small: 8,
    contact: 9,
    skill: 7,
  },

  // HTML Font Sizes (larger for web)
  html: {
    name: 48, // text-5xl
    title: 24, // text-2xl
    heading: 18, // text-lg
    body: 14, // text-sm
    small: 12, // text-xs
    contact: 12, // text-xs
    skill: 12, // text-xs
  },
} as const;

// Color Constants
export const COLORS = {
  primary: "#1e3a8a",
  secondary: "#64748b",
  text: "#000000",
  textLight: "#666666",
  background: "#ffffff",
  backgroundLight: "#f8fafc",
  border: "#e5e7eb",
  accent: "#3b82f6",
} as const;

// Layout Constants
export const LAYOUT = {
  a4Width: "210mm",
  a4Height: "297mm",
  maxWidth: "210mm",
  scale: 0.8,
  borderRadius: 4,
  borderWidth: 1,
} as const;

// Section Order
export const SECTION_ORDER = [
  "professional-summary",
  "education",
  "work-experience",
  "skills",
  "certifications",
  "languages",
  "awards",
  "projects",
  "interests",
] as string[];

// Skill/Language Level Mapping
export const SKILL_LEVELS = {
  Beginner: 1,
  Amateur: 2,
  Intermediate: 3,
  Advanced: 4,
  Expert: 5,
} as const;

export const LANGUAGE_LEVELS = {
  Basic: 1,
  Amateur: 2,
  Conversational: 3,
  Professional: 4,
  Native: 5,
} as const;
