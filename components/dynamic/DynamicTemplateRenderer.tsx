"use client";

/**
 * DynamicTemplateRenderer
 *
 * A clean, simplified component that routes to dedicated template renderers.
 * This provides a consistent interface while delegating actual rendering
 * to specialized components for better maintainability and performance.
 */

import React from "react";
import { ResumeSection } from "@/types";
import { TemplateLayout } from "@/types/template";
import { templateManager } from "@/lib/templates/templateManager";
import { ClassicTemplateHtmlRenderer } from "@/components/renderers/ClassicTemplateHtmlRenderer";
import { MinimalTemplateHtmlRenderer } from "@/components/renderers/MinimalTemplateHtmlRenderer";
import { ModernTemplateHtmlRenderer } from "@/components/renderers/ModernTemplateHtmlRenderer";
import { TwoColumnTemplateHtmlRenderer } from "@/components/renderers/TwoColumnTemplateHtmlRenderer";
import { ClassicTemplatePlaceholder } from "@/components/renderers/ClassicTemplatePlaceholder";
import { MinimalTemplatePlaceholder } from "@/components/renderers/MinimalTemplatePlaceholder";
import { ModernTemplatePlaceholder } from "@/components/renderers/ModernTemplatePlaceholder";
import { TwoColumnTemplatePlaceholder } from "@/components/renderers/TwoColumnTemplatePlaceholder";

interface DynamicTemplateRendererProps {
  data: ResumeSection[];
  templateId: string;
  className?: string;
  templateConfig?: TemplateLayout; // Live template configuration
  leftColumnSections?: string[];
}

export default function DynamicTemplateRenderer({
  data,
  templateId,
  className = "",
  templateConfig,
  leftColumnSections,
}: DynamicTemplateRendererProps) {
  // Use live template configuration if available, otherwise fall back to template manager
  const template = templateConfig || templateManager.getTemplate(templateId);

  if (!template) {
    return (
      <div className="bg-gray-100 flex justify-center items-center h-96">
        <p className="text-gray-500">Template not found: {templateId}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    // Show placeholder when no data is available
    switch (templateId) {
      case "modern":
        return <ModernTemplatePlaceholder template={template} />;

      case "classic":
        return <ClassicTemplatePlaceholder template={template} />;

      case "minimal":
        return <MinimalTemplatePlaceholder template={template} />;

      case "two-column":
        return <TwoColumnTemplatePlaceholder template={template} />;

      default:
        return (
          <div className="bg-gray-100 flex justify-center items-center h-96">
            <p className="text-gray-500">No data available for preview</p>
          </div>
        );
    }
  }

  // Use dedicated template renderers for consistent styling and functionality
  switch (templateId) {
    case "modern":
      return (
        <ModernTemplateHtmlRenderer
          data={data}
          template={template}
          leftColumnSections={
            leftColumnSections || [
              "professional-summary",
              "skills",
              "languages",
              "certifications",
              "awards",
            ]
          }
        />
      );

    case "classic":
      return <ClassicTemplateHtmlRenderer data={data} template={template} />;

    case "minimal":
      return <MinimalTemplateHtmlRenderer data={data} template={template} />;

    case "two-column":
      return <TwoColumnTemplateHtmlRenderer data={data} template={template} />;

    default:
      return (
        <div className="bg-gray-100 flex justify-center items-center h-96">
          <p className="text-gray-500">Unsupported template: {templateId}</p>
        </div>
      );
  }
}
