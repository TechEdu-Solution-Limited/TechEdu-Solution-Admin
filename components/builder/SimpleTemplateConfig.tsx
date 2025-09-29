"use client";

import React, { useState, useCallback, useRef } from "react";
import { Palette, Type, Layout, Save, RotateCcw } from "lucide-react";
import { TemplateLayout } from "@/types/template";
import { getConsistentFontOptions } from "@/utils/wysiwygConsistency";

interface SimpleTemplateConfigProps {
  template: TemplateLayout;
  onSave: (template: TemplateLayout) => void;
  onReset: () => void;
}

const SimpleTemplateConfig = React.memo(function SimpleTemplateConfig({
  template,
  onSave,
  onReset,
}: SimpleTemplateConfigProps) {
  const [localTemplate, setLocalTemplate] = useState<TemplateLayout>(template);
  const [activeTab, setActiveTab] = useState<"colors" | "fonts" | "layout">(
    "colors"
  );

  // Use ref to track if template has actually changed
  const templateRef = useRef(template);
  const isInitialMount = useRef(true);

  // Update local template only when the prop template actually changes
  React.useEffect(() => {
    // Skip the first render to prevent initial loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update if template ID or name has changed
    if (
      templateRef.current.id !== template.id ||
      templateRef.current.name !== template.name
    ) {
      templateRef.current = template;
      setLocalTemplate(template);
    }
  }, [template.id, template.name]);

  const handleSave = useCallback(() => {
    onSave(localTemplate);
  }, [localTemplate, onSave]);

  const handleReset = useCallback(() => {
    setLocalTemplate(template);
    onReset();
  }, [template, onReset]);

  const updateTemplate = useCallback((updates: Partial<TemplateLayout>) => {
    setLocalTemplate((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateStyles = useCallback((styleUpdates: any) => {
    setLocalTemplate((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        ...styleUpdates,
      },
    }));
  }, []);

  const fontOptions = getConsistentFontOptions();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Template Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize your resume template with simple controls
        </p>
      </div>

      {/* Simple Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "colors", label: "Colors", icon: Palette },
          { id: "fonts", label: "Fonts", icon: Type },
          { id: "layout", label: "Layout", icon: Layout },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "colors" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Color Scheme
            </h3>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localTemplate.styles.colors.primary}
                  onChange={(e) =>
                    updateStyles({
                      colors: {
                        ...localTemplate.styles.colors,
                        primary: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTemplate.styles.colors.primary}
                  onChange={(e) =>
                    updateStyles({
                      colors: {
                        ...localTemplate.styles.colors,
                        primary: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localTemplate.styles.colors.secondary}
                  onChange={(e) =>
                    updateStyles({
                      colors: {
                        ...localTemplate.styles.colors,
                        secondary: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTemplate.styles.colors.secondary}
                  onChange={(e) =>
                    updateStyles({
                      colors: {
                        ...localTemplate.styles.colors,
                        secondary: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#6b7280"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localTemplate.styles.colors.background}
                  onChange={(e) =>
                    updateStyles({
                      colors: {
                        ...localTemplate.styles.colors,
                        background: e.target.value,
                      },
                    })
                  }
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={localTemplate.styles.colors.background}
                  onChange={(e) =>
                    updateStyles({
                      colors: {
                        ...localTemplate.styles.colors,
                        background: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Typography</h3>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={localTemplate.styles.typography.fontFamily}
                onChange={(e) =>
                  updateStyles({
                    typography: {
                      ...localTemplate.styles.typography,
                      fontFamily: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label} - {font.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {localTemplate.styles.typography.bodySize}px
              </label>
              <input
                type="range"
                min="10"
                max="16"
                value={localTemplate.styles.typography.bodySize}
                onChange={(e) =>
                  updateStyles({
                    typography: {
                      ...localTemplate.styles.typography,
                      bodySize: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10px</span>
                <span>16px</span>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Height: {localTemplate.styles.typography.lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={localTemplate.styles.typography.lineHeight}
                onChange={(e) =>
                  updateStyles({
                    typography: {
                      ...localTemplate.styles.typography,
                      lineHeight: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.2</span>
                <span>2.0</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Layout Settings
            </h3>

            {/* Page Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Width: {localTemplate.styles.layout.pageWidth}
              </label>
              <select
                value={localTemplate.styles.layout.pageWidth}
                onChange={(e) =>
                  updateStyles({
                    layout: {
                      ...localTemplate.styles.layout,
                      pageWidth: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="210mm">A4 (210mm)</option>
                <option value="216mm">Letter (216mm)</option>
                <option value="200mm">Custom (200mm)</option>
                <option value="220mm">Custom (220mm)</option>
              </select>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius: {localTemplate.styles.layout.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={localTemplate.styles.layout.borderRadius}
                onChange={(e) =>
                  updateStyles({
                    layout: {
                      ...localTemplate.styles.layout,
                      borderRadius: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0px</span>
                <span>20px</span>
              </div>
            </div>

            {/* Section Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Spacing: {localTemplate.styles.spacing.sectionGap}px
              </label>
              <input
                type="range"
                min="16"
                max="48"
                value={localTemplate.styles.spacing.sectionGap}
                onChange={(e) =>
                  updateStyles({
                    spacing: {
                      ...localTemplate.styles.spacing,
                      sectionGap: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>16px</span>
                <span>48px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
});

export default SimpleTemplateConfig;
