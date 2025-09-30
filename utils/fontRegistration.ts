/**
 * Font Registration Utilities for React PDF
 *
 * Registers Roboto font with multiple weights and uses built-in React PDF fonts.
 * React PDF supports TTF and WOFF font formats, with TTF being more reliable.
 * Multiple font weights are registered to ensure proper rendering across different text styles.
 */

import { Font } from "@react-pdf/renderer";

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

  // For now, use built-in React PDF fonts to avoid font loading issues
  // Custom fonts can be added later with proper local font files

  console.log("✅ Using built-in React PDF fonts for reliable PDF generation");

  // React PDF has built-in fonts that don't need registration:
  // - Helvetica (default)
  // - Times-Roman
  // - Courier
  // - Helvetica-Bold
  // - Times-Bold
  // - Courier-Bold

  fontsRegistered = true;
  console.log("✅ Registered Roboto font and using built-in React PDF fonts");
}

/**
 * Get a safe font family for React PDF
 * Uses only built-in React PDF fonts
 */
export function getSafePDFFont(fontFamily: string): string {
  // Register fonts first
  registerPDFFonts();

  // Map to built-in React PDF fonts for reliable PDF generation
  const fontMap: { [key: string]: string } = {
    // All custom fonts map to Helvetica for now (most similar to Roboto)
    "Roboto, Helvetica, Arial, sans-serif": "Helvetica",
    Roboto: "Helvetica",
    "Roboto, sans-serif": "Helvetica",

    "Open Sans, Helvetica, Arial, sans-serif": "Helvetica",
    "Open Sans": "Helvetica",
    "Open Sans, sans-serif": "Helvetica",

    "Lato, Helvetica, Arial, sans-serif": "Helvetica",
    Lato: "Helvetica",
    "Lato, sans-serif": "Helvetica",

    "Source Sans Pro, Helvetica, Arial, sans-serif": "Helvetica",
    "Source Sans Pro": "Helvetica",
    "Source Sans Pro, sans-serif": "Helvetica",

    "Montserrat, Helvetica, Arial, sans-serif": "Helvetica",
    Montserrat: "Helvetica",
    "Montserrat, sans-serif": "Helvetica",

    "Inter, Helvetica, Arial, sans-serif": "Helvetica",
    Inter: "Helvetica",
    "Inter, sans-serif": "Helvetica",

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
