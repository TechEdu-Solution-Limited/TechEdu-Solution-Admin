/**
 * Font Registration Utilities for React PDF
 *
 * Uses built-in React PDF fonts to prevent "Font family not registered" errors
 */

// Font registration status
let fontsRegistered = false;

/**
 * Register all required fonts with React PDF
 * This should be called before any PDF generation
 */
export function registerPDFFonts() {
  if (fontsRegistered) {
    return;
  }

  // React PDF has built-in fonts that don't need registration:
  // - Helvetica (default)
  // - Times-Roman
  // - Courier
  // - Helvetica-Bold
  // - Times-Bold
  // - Courier-Bold

  fontsRegistered = true;
  console.log("✅ Using built-in React PDF fonts");
}

/**
 * Get a safe font family for React PDF
 * Uses only built-in React PDF fonts
 */
export function getSafePDFFont(fontFamily: string): string {
  // Register fonts first
  registerPDFFonts();

  // Map to built-in React PDF fonts only
  const fontMap: { [key: string]: string } = {
    // Sans-serif fonts -> Helvetica
    "Helvetica, Arial, sans-serif": "Helvetica",
    Helvetica: "Helvetica",
    Arial: "Helvetica",
    "sans-serif": "Helvetica",

    // Serif fonts -> Times-Roman
    "Times-Roman, Times New Roman, serif": "Times-Roman",
    "Times-Roman": "Times-Roman",
    "Times New Roman": "Times-Roman",
    serif: "Times-Roman",

    // Monospace fonts -> Courier
    "Courier, Courier New, monospace": "Courier",
    Courier: "Courier",
    "Courier New": "Courier",
    monospace: "Courier",
  };

  // Return mapped font or default to Helvetica
  return fontMap[fontFamily] || "Helvetica";
}

/**
 * Check if fonts are registered
 */
export function areFontsRegistered(): boolean {
  return fontsRegistered;
}
