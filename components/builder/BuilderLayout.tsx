"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Download,
  Save,
  Upload,
  Send,
  Palette,
  List,
  PlusIcon,
  Layout,
  Type,
} from "lucide-react";
import { IoFileTrayStacked } from "react-icons/io5";
import MobileActionMenu from "./MobileActionMenu";
import { TemplateLayout, TemplateColumn } from "@/types/template";
import { templateManager } from "@/lib/templates/templateManager";
import SimpleTemplateConfig from "./SimpleTemplateConfig";

interface BuilderLayoutProps {
  children: ReactNode;
  onTogglePreview: () => void;
  onExportPDF: () => void;
  onExportHTML2PDF?: () => void;
  onChangeTemplate: () => void;
  showPreview: boolean;
  isExporting: boolean;
  // API functionality
  onSaveCV?: () => void;
  onSaveDraft?: () => void;
  onLoadCV?: () => void;
  onPublishCV?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  apiError?: string | null;
  onClearError?: () => void;
  // Success feedback
  showSuccessMessage?: boolean;
  successMessage?: string;
  onClearSuccess?: () => void;
  // Enhanced layout props
  previewData?: any; // Data for preview
  onPreviewClick?: () => void; // Callback when preview is clicked
  // New mode props
  builderMode: "content" | "customize";
  onToggleBuilderMode: () => void;
  sections?: any[]; // Sections for content mode
  enabledSections?: string[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  // Template configuration
  selectedTemplate?: string;
  onTemplateConfigSave?: (template: any) => void;
  // Add section functionality
  onAddSection?: () => void;
  // Dummy data functionality
  onLoadDummyData?: () => void;
}

export default function BuilderLayout({
  children,
  onTogglePreview,
  onExportPDF,
  onExportHTML2PDF,
  onChangeTemplate,
  showPreview,
  isExporting,
  onSaveCV,
  onSaveDraft,
  onLoadCV,
  onPublishCV,
  isSaving = false,
  isLoading = false,
  apiError = null,
  onClearError,
  showSuccessMessage = false,
  successMessage = "",
  onClearSuccess,
  previewData,
  onPreviewClick,
  builderMode,
  onToggleBuilderMode,
  sections = [],
  enabledSections = [],
  activeSection,
  onSectionChange,
  selectedTemplate = "modern",
  onTemplateConfigSave,
  onAddSection,
  onLoadDummyData,
}: BuilderLayoutProps) {
  const [template, setTemplate] = useState<TemplateLayout | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "layout"
    | "styling"
    | "typography"
    | "sections"
    | "personal"
    | "colors"
    | "spacing"
  >("layout");

  useEffect(() => {
    if (selectedTemplate) {
      // Load template from template manager
      const templateData = templateManager.getTemplate(selectedTemplate);
      if (templateData) {
        setTemplate(templateData);
      }
    }
  }, [selectedTemplate]);

  // Simplified template configuration functions
  const handleSaveTemplate = useCallback(
    (updatedTemplate: TemplateLayout) => {
      setTemplate(updatedTemplate);
      if (onTemplateConfigSave) {
        onTemplateConfigSave(updatedTemplate);
      }
    },
    [onTemplateConfigSave]
  );

  const handleResetTemplate = useCallback(() => {
    if (selectedTemplate) {
      const defaultTemplate = templateManager.getTemplate(selectedTemplate);
      if (defaultTemplate) {
        setTemplate(defaultTemplate);
      }
    }
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            {/* Template Button */}
            <button
              onClick={onChangeTemplate}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
            >
              <IoFileTrayStacked className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">Change Template</span>
            </button>

            {/* Builder Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={onToggleBuilderMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 group ${
                  builderMode === "content"
                    ? "bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <List className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline text-sm">Content</span>
              </button>
              <button
                onClick={onToggleBuilderMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 group ${
                  builderMode === "customize"
                    ? "bg-white dark:bg-gray-600 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                <Palette className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline text-sm">Customize</span>
              </button>
            </div>

            {/* API Functionality - Grouped with visual separator */}
            <div className="hidden lg:flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-gray-700">
              {onLoadDummyData && (
                <button
                  onClick={onLoadDummyData}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg transition-all duration-200 group"
                >
                  <FileText className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">Dummy Data</span>
                </button>
              )}

              {onSaveDraft && (
                <button
                  onClick={onSaveDraft}
                  disabled={isSaving || isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 group"
                >
                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">
                    {isSaving ? "Saving..." : "Draft"}
                  </span>
                </button>
              )}

              {onSaveCV && (
                <button
                  onClick={onSaveCV}
                  disabled={isSaving || isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:bg-purple-50 dark:disabled:bg-purple-900/10 text-purple-700 dark:text-purple-300 rounded-lg transition-all duration-200 group"
                >
                  <Save className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">
                    {isSaving ? "Saving..." : "Save"}
                  </span>
                </button>
              )}

              {onLoadCV && (
                <button
                  onClick={onLoadCV}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:bg-indigo-50 dark:disabled:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all duration-200 group"
                >
                  <Upload className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">
                    {isLoading ? "Loading..." : "Load"}
                  </span>
                </button>
              )}

              {onPublishCV && (
                <button
                  onClick={onPublishCV}
                  disabled={isSaving || isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:bg-green-50 dark:disabled:bg-green-900/10 text-green-700 dark:text-green-300 rounded-lg transition-all duration-200 group"
                >
                  <Send className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">
                    {isSaving ? "Publishing..." : "Publish"}
                  </span>
                </button>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={onExportPDF}
              disabled={isExporting}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <Download className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
            </button>

            {onExportHTML2PDF && (
              <button
                onClick={onExportHTML2PDF}
                disabled={isExporting}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg group"
              >
                <Download className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span>{isExporting ? "Exporting..." : "HTML2PDF"}</span>
              </button>
            )}

            {/* Mobile Action Menu */}
            <MobileActionMenu
              onSaveCV={onSaveCV}
              onSaveDraft={onSaveDraft}
              onLoadCV={onLoadCV}
              onPublishCV={onPublishCV}
              onExportPDF={onExportPDF}
              isSaving={isSaving}
              isLoading={isLoading}
              isExporting={isExporting}
            />
          </div>
        </div>
      </nav>

      {/* Success Notification */}
      {showSuccessMessage && onClearSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl shadow-lg max-w-md animate-slide-in-right">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <strong className="font-semibold">Success!</strong>
                <span className="block text-sm mt-1">{successMessage}</span>
              </div>
            </div>
            <button
              onClick={onClearSuccess}
              className="ml-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {apiError && onClearError && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-lg max-w-md animate-slide-in-right">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <strong className="font-semibold">Error:</strong>
                <span className="block text-sm mt-1">{apiError}</span>
              </div>
            </div>
            <button
              onClick={onClearError}
              className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Left Column - Content/Customize (Scrollable) */}
            <div className="overflow-y-auto lg:col-span-1 max-h-full">
              {builderMode === "content" ? (
                // Content Mode - Accordion Sections
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Resume Sections
                    </h2>
                    <button
                      onClick={onAddSection}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    >
                      <PlusIcon className="h-4 w-4" /> Add Section
                    </button>
                  </div>
                  {children}
                </div>
              ) : (
                // Customize Mode - Simple Template Configuration
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {template ? (
                    <SimpleTemplateConfig
                      key={template.id}
                      template={template}
                      onSave={handleSaveTemplate}
                      onReset={handleResetTemplate}
                    />
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layout className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Template Selected
                      </h3>
                      <p className="text-sm text-gray-600">
                        Select a template to start customizing
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Sticky Preview (Desktop Only) */}
            <div className="sticky top-20 hidden lg:block lg:col-span-1 h-full">
              <div
                className="overflow-hidden cursor-zoom-in hover:shadow-xl transition-all duration-300 h-full"
                onClick={onPreviewClick}
              >
                <div className="p-4 h-full overflow-hidden">
                  {previewData ? (
                    <div className="transform scale-[0.5] origin-top-left w-[200%] h-full overflow-hidden">
                      {previewData}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading preview...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
