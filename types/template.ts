// Template configuration types for dynamic rendering
import { ResumeSection } from "./index";
import { ReactElement } from "react";

export interface TemplateLayout {
  id: string;
  name: string;
  description: string;
  columns: TemplateColumn[];
  styles: TemplateStyles;
  metadata: TemplateMetadata;
  sectionHeadings?: Record<string, string>; // Custom section headings
}

export interface TemplateColumn {
  id: string;
  width: number; // Percentage (0-100)
  sections: string[]; // Section types that can go in this column
  styles: ColumnStyles;
  order: number;
}

// Enhanced TemplateStyles interface with additional customization options
export interface TemplateStyles {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    headerBackground?: string;
    sectionHeadingBackground?: string;
  };
  typography: {
    fontFamily: string;
    headingSize: number;
    bodySize: number;
    lineHeight: number;
    headingStyle?: "normal" | "bold" | "italic";
    headingCase?: "capitalize" | "uppercase" | "lowercase";
    sectionHeadingStyle?: "normal" | "bold" | "italic";
    sectionHeadingCase?: "capitalize" | "uppercase" | "lowercase";
  };
  spacing: {
    padding: number;
    margin: number;
    sectionGap: number;
    horizontalMargin?: number;
    verticalMargin?: number;
    entrySpacing?: number;
    headerPadding?: number;
  };
  layout: {
    pageWidth: string;
    pageHeight: string;
    borderRadius: number;
    shadow: string;
    headerBorder?: string;
  };
  sectionHeadings?: {
    backgroundColor?: string;
    padding?: string;
    marginBottom?: string;
    borderRadius?: string;
    fontWeight?: string;
    textTransform?: string;
    fontSize?: string;
    letterSpacing?: string;
  };
  personalDetails?: {
    nameSize?: "xs" | "s" | "m" | "l" | "xl";
    nameBold?: boolean;
    titleSize?: "s" | "m" | "l";
    titlePosition?: "same-line" | "below";
    showPhoto?: boolean;
    grayscale?: boolean;
  };
  colorMode?: "basic" | "advanced";
}

export interface ColumnStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  borderRadius?: number;
  borderBottom?: string;
}

export interface TemplateMetadata {
  category: "professional" | "creative" | "minimal" | "modern" | "classic";
  industry: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionConfig {
  type: string;
  displayName: string;
  icon: string;
  category: "personal" | "professional" | "education" | "skills" | "additional";
  required: boolean;
  order: number;
  defaultVisibility: boolean;
  styling: SectionStyling;
}

export interface SectionStyling {
  showHeader: boolean;
  headerStyle: "uppercase" | "title-case" | "lowercase";
  showDividers: boolean;
  compact: boolean;
  icon: boolean;
}

export interface TemplateRenderer {
  render: (data: ResumeSection[], layout: TemplateLayout) => ReactElement;
  renderPDF: (data: ResumeSection[], layout: TemplateLayout) => ReactElement;
}

export interface TemplateManager {
  getTemplate: (id: string) => TemplateLayout | null;
  getTemplates: () => TemplateLayout[];
  createTemplate: (template: Omit<TemplateLayout, "id">) => TemplateLayout;
  updateTemplate: (
    id: string,
    updates: Partial<TemplateLayout>
  ) => TemplateLayout;
  deleteTemplate: (id: string) => boolean;
}
