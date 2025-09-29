"use client";

import { Palette, Plus, CheckCircle, Circle } from "lucide-react";
import { Section, Template } from "@/types";

interface SidebarProps {
  selectedTemplate: Template;
  onTemplateChange: (template: Template) => void;
  sections: Section[];
  enabledSections: string[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onAddSection: () => void;
  onNavigateSection: (direction: "next" | "prev") => void;
}

export default function Sidebar({
  selectedTemplate,
  onTemplateChange,
  sections,
  enabledSections,
  activeSection,
  onSectionChange,
  onRemoveSection,
  onAddSection,
  onNavigateSection,
}: SidebarProps) {
  const enabledSectionsList = sections.filter((section) =>
    enabledSections.includes(section.id)
  );
  const currentIndex = enabledSectionsList.findIndex(
    (section) => section.id === activeSection
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Progress Bar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resume Builder
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {enabledSectionsList.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentIndex + 1) / enabledSectionsList.length) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Vertical Progress Steps */}
      <div className="space-y-3 mb-6">
        {enabledSectionsList.map((section, index) => {
          const isActive = section.id === activeSection;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div
              key={section.id}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                  : isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                  : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => onSectionChange(section.id)}
            >
              {/* Progress Indicator */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : isActive ? (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Section Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-blue-900 dark:text-blue-100"
                      : isCompleted
                      ? "text-green-900 dark:text-green-100"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {section.label}
                </p>
                <p
                  className={`text-xs ${
                    isActive
                      ? "text-blue-600 dark:text-blue-300"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {isActive
                    ? "Current step"
                    : isCompleted
                    ? "Completed"
                    : "Upcoming"}
                </p>
              </div>

              {/* Section Icon */}
              <div className="flex-shrink-0">
                <section.icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div className="mb-6">
        <button
          onClick={onAddSection}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors group"
        >
          <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="flex space-x-2">
        <button
          onClick={() => onNavigateSection("prev")}
          disabled={currentIndex === 0}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <span>Previous</span>
        </button>
        <button
          onClick={() => onNavigateSection("next")}
          disabled={currentIndex === enabledSectionsList.length - 1}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  );
}
