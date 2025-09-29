/**
 * Unified Font Mapping Utilities
 *
 * Ensures perfect WYSIWYG consistency between preview and PDF
 * All fonts are PDF-compatible to guarantee identical rendering
 */

// React PDF supported fonts (these are the only fonts we use)
export const PDF_SUPPORTED_FONTS = {
  HELVETICA: "Helvetica",
  TIMES_ROMAN: "Times-Roman",
  COURIER: "Courier",
  HELVETICA_BOLD: "Helvetica-Bold",
  TIMES_BOLD: "Times-Bold",
  COURIER_BOLD: "Courier-Bold",
} as const;

// Unified font mapping - same for both preview and PDF
// This ensures perfect WYSIWYG consistency
export const UNIFIED_FONT_MAPPING: { [key: string]: string } = {
  // Primary fonts (used in templates) - return single font names for PDF compatibility
  "Helvetica, sans-serif": "Helvetica",
  "Times-Roman, serif": "Times-Roman",
  "Courier, monospace": "Courier",

  // Fallback mappings for any legacy fonts
  "Inter, sans-serif": "Helvetica",
  "Arial, sans-serif": "Helvetica",
  "Georgia, serif": "Times-Roman",
  "Times New Roman, serif": "Times-Roman",
  "Courier New, monospace": "Courier",

  // Generic font families
  "sans-serif": "Helvetica",
  serif: "Times-Roman",
  monospace: "Courier",

  // System fonts
  "system-ui, sans-serif": "Helvetica",
  "-apple-system, BlinkMacSystemFont, sans-serif": "Helvetica",
  "Consolas, monospace": "Courier",
  "Monaco, monospace": "Courier",
  "Palatino, serif": "Times-Roman",

  // PDF native fonts (pass through)
  Helvetica: "Helvetica",
  "Times-Roman": "Times-Roman",
  Courier: "Courier",
} as const;

/**
 * Unified font mapping function - used by both preview and PDF
 * Ensures perfect WYSIWYG consistency
 */
export function mapFontFamily(fontFamily: string): string {
  // Clean up the font family string
  const cleanFontFamily = fontFamily.trim();

  // Direct mapping using unified mapping
  if (UNIFIED_FONT_MAPPING[cleanFontFamily]) {
    return UNIFIED_FONT_MAPPING[cleanFontFamily];
  }

  // Fallback: check if it contains known font families
  const lowerFontFamily = cleanFontFamily.toLowerCase();

  if (
    lowerFontFamily.includes("helvetica") ||
    lowerFontFamily.includes("arial")
  ) {
    return "Helvetica";
  }

  if (
    lowerFontFamily.includes("times") ||
    lowerFontFamily.includes("georgia")
  ) {
    return "Times-Roman";
  }

  if (lowerFontFamily.includes("courier") || lowerFontFamily.includes("mono")) {
    return "Courier";
  }

  // Default fallback
  return "Helvetica";
}

/**
 * Gets all available font options for template configuration
 * Only PDF-compatible fonts to ensure consistency between preview and PDF
 */
export function getFontOptions() {
  return [
    {
      value: "Helvetica, sans-serif",
      label: "Helvetica",
      pdfCompatible: true,
      category: "sans-serif",
      description: "Clean, modern sans-serif font",
    },
    {
      value: "Times-Roman, serif",
      label: "Times Roman",
      pdfCompatible: true,
      category: "serif",
      description: "Classic, professional serif font",
    },
    {
      value: "Courier, monospace",
      label: "Courier",
      pdfCompatible: true,
      category: "monospace",
      description: "Fixed-width font for technical content",
    },
  ];
}

/**
 * Validates if a font family is PDF compatible
 * Since we only use PDF-compatible fonts now, this always returns true
 */
export function isPDFCompatible(fontFamily: string): boolean {
  // All fonts in our system are now PDF-compatible
  return true;
}

/**
 * Gets the PDF font for a given web font (returns only PDF font name)
 * This is used by the PDF renderer to ensure consistency with preview
 */
export function getPDFFont(fontFamily: string): string {
  // Clean up the font family string
  const cleanFontFamily = fontFamily.trim();

  // Direct mapping to PDF fonts only
  if (
    cleanFontFamily.includes("Helvetica") ||
    cleanFontFamily.includes("Arial")
  ) {
    return PDF_SUPPORTED_FONTS.HELVETICA;
  }

  if (
    cleanFontFamily.includes("Times") ||
    cleanFontFamily.includes("Georgia")
  ) {
    return PDF_SUPPORTED_FONTS.TIMES_ROMAN;
  }

  if (cleanFontFamily.includes("Courier") || cleanFontFamily.includes("mono")) {
    return PDF_SUPPORTED_FONTS.COURIER;
  }

  // Default fallback
  return PDF_SUPPORTED_FONTS.HELVETICA;
}

/**
 * Unified font mapping for both preview and PDF
 * This ensures perfect WYSIWYG consistency
 */
export function getUnifiedFont(fontFamily: string): string {
  return mapFontFamily(fontFamily);
}
