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
import ResumeNav from "./ResumeNav";
import { TemplateLayout, TemplateColumn } from "@/types/template";
import { templateManager } from "@/lib/templates/templateManager";
import SimpleTemplateConfig from "./SimpleTemplateConfig";
import { SectionList } from "./SectionList";
import { SectionModal } from "./modals/SectionModal";
import { SectionContentRenderer } from "./SectionContentRenderer";
import { ResumeSection } from "@/types";

interface BuilderLayoutProps {
  children: ReactNode;
  onTogglePreview: () => void;
  onExportPDF: () => void;
  onExportHTML2PDF?: () => void;
  onChangeTemplate: () => void;
  showPreview: boolean;
  isExporting: boolean;
  // API functionality
  onSaveDraft?: () => void;
  onLoadCV?: () => void;
  onPublishCV?: () => void;
  onCreateCV?: () => void;
  onUpdateCV?: () => void;
  onPublishDraft?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  error?: string | null;
  apiError?: string | null;
  onClearError?: () => void;
  cvId?: string; // CV ID for AI operations
  isCreating?: boolean;
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
  onRemoveSection?: (sectionId: string) => void;
  // Section data for modal editing
  personalInfo?: any;
  professionalSummary?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  languages?: any[];
  certifications?: any[];
  awards?: any[];
  projects?: any[];
  interests?: any[];
  customSections?: any[];
  // Section update handlers
  onUpdatePersonalInfo?: (updates: any) => void;
  onUpdateProfessionalSummary?: (updates: any) => void;
  onAddExperience?: () => void;
  onRemoveExperience?: (id: string) => void;
  onUpdateExperience?: (id: string, field: string, value: any) => void;
  onAddEducation?: () => void;
  onRemoveEducation?: (id: string) => void;
  onUpdateEducation?: (id: string, field: string, value: any) => void;
  onAddSkill?: () => void;
  onRemoveSkill?: (id: string) => void;
  onUpdateSkill?: (id: string, field: string, value: any) => void;
  onAddLanguage?: () => void;
  onRemoveLanguage?: (id: string) => void;
  onUpdateLanguage?: (id: string, field: string, value: any) => void;
  onAddCertification?: () => void;
  onRemoveCertification?: (id: string) => void;
  onUpdateCertification?: (id: string, field: string, value: any) => void;
  onAddAward?: () => void;
  onRemoveAward?: (id: string) => void;
  onUpdateAward?: (id: string, field: string, value: any) => void;
  onAddProject?: () => void;
  onRemoveProject?: (id: string) => void;
  onUpdateProject?: (id: string, field: string, value: any) => void;
  onAddInterest?: () => void;
  onRemoveInterest?: (id: string) => void;
  onUpdateInterest?: (id: string, field: string, value: any) => void;
  onImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  onShowAIConsent?: () => void;
  aiConsent?: { aiProcessing: boolean; aiTraining: boolean } | null;
  onCheckExistingConsent?: (
    cvId: string
  ) => Promise<{ aiProcessing: boolean; aiTraining: boolean } | null>;
  onUpdateSection?: (
    sectionId: string,
    updates: Partial<ResumeSection>
  ) => void;
}

export default function BuilderLayout({
  children,
  onTogglePreview,
  onExportPDF,
  onExportHTML2PDF,
  onChangeTemplate,
  showPreview,
  isExporting,
  onSaveDraft,
  onLoadCV,
  onPublishCV,
  onCreateCV,
  onUpdateCV,
  onPublishDraft,
  isSaving = false,
  isLoading = false,
  loading = false,
  error = null,
  apiError = null,
  onClearError,
  cvId,
  isCreating = false,
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
  onRemoveSection,
  // Section data
  personalInfo,
  professionalSummary,
  experiences = [],
  educations = [],
  skills = [],
  languages = [],
  certifications = [],
  awards = [],
  projects = [],
  interests = [],
  customSections = [],
  // Section handlers
  onUpdatePersonalInfo,
  onUpdateProfessionalSummary,
  onAddExperience,
  onRemoveExperience,
  onUpdateExperience,
  onAddEducation,
  onRemoveEducation,
  onUpdateEducation,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkill,
  onAddLanguage,
  onRemoveLanguage,
  onUpdateLanguage,
  onAddCertification,
  onRemoveCertification,
  onUpdateCertification,
  onAddAward,
  onRemoveAward,
  onUpdateAward,
  onAddProject,
  onRemoveProject,
  onUpdateProject,
  onAddInterest,
  onRemoveInterest,
  onUpdateInterest,
  onImageUpload,
  onRemoveImage,
  onShowAIConsent,
  aiConsent,
  onCheckExistingConsent,
  onUpdateSection,
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

  // Modal state for section editing
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ResumeSection | null>(
    null
  );

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

  // Update selected section when sections change (to reflect updated headings)
  useEffect(() => {
    if (selectedSection && sections.length > 0) {
      const updatedSection = sections.find((s) => s.id === selectedSection.id);
      if (updatedSection) {
        setSelectedSection(updatedSection);
      }
    }
  }, [sections, selectedSection]);

  // Section modal handlers
  const handleSectionClick = useCallback((section: ResumeSection) => {
    setSelectedSection(section);
    setIsSectionModalOpen(true);
  }, []);

  const handleCloseSectionModal = useCallback(() => {
    setIsSectionModalOpen(false);
    setSelectedSection(null);
  }, []);

  const handleSaveSection = useCallback(
    (section: ResumeSection) => {
      // Here you would typically save the section data
      // For now, we'll just close the modal
      console.log("Saving section:", section);
      handleCloseSectionModal();
    },
    [handleCloseSectionModal]
  );

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <ResumeNav
        onChangeTemplate={onChangeTemplate}
        builderMode={builderMode}
        onToggleBuilderMode={onToggleBuilderMode}
        onCreateCV={onCreateCV}
        onUpdateCV={onUpdateCV}
        onSaveDraft={onSaveDraft}
        onPublishDraft={onPublishDraft}
        onLoadCV={onLoadCV}
        onPublishCV={onPublishCV}
        onExportPDF={onExportPDF}
        onExportHTML2PDF={onExportHTML2PDF}
        isSaving={isSaving}
        isLoading={isLoading}
        isExporting={isExporting}
        isCreating={isCreating}
        loading={loading}
        cvId={cvId}
        error={error}
      />

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
      {(apiError || error) && onClearError && (
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
                <span className="block text-sm mt-1">{apiError || error}</span>
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

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - Content/Customize (Scrollable) */}
            <div className="overflow-y-auto lg:col-span-1 h-full relative">
              {builderMode === "content" ? (
                // Content Mode - Clean Section List
                <div className="bg-white dark:bg-gray-800 rounded-[10px] shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Resume Sections
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click on any section to edit its content
                    </p>
                  </div>
                  <SectionList
                    sections={sections}
                    onSectionClick={handleSectionClick}
                    onAddSection={onAddSection || (() => {})}
                    onRemoveSection={onRemoveSection}
                  />
                </div>
              ) : (
                // Customize Mode - Simple Template Configuration
                <div className="bg-white rounded-[10px] shadow-sm border border-gray-200">
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

              {/* Section Modal */}
              <SectionModal
                isOpen={isSectionModalOpen}
                onClose={handleCloseSectionModal}
                section={selectedSection}
                onSave={handleSaveSection}
                onUpdateSection={onUpdateSection}
              >
                {selectedSection && (
                  <>
                    {console.log(
                      "BuilderLayout - cvId being passed to SectionContentRenderer:",
                      cvId
                    )}
                    <SectionContentRenderer
                      section={selectedSection}
                      onUpdate={(updates) => {
                        // Handle section updates based on section type
                        switch (selectedSection.type) {
                          case "personal-info":
                            onUpdatePersonalInfo?.(updates);
                            break;
                          case "professional-summary":
                            onUpdateProfessionalSummary?.(updates);
                            break;
                          default:
                            console.log(
                              "Section update:",
                              selectedSection.type,
                              updates
                            );
                        }
                      }}
                      onShowAIConsent={onShowAIConsent}
                      aiConsent={aiConsent}
                      cvId={cvId}
                      onCheckExistingConsent={onCheckExistingConsent}
                      personalInfo={personalInfo}
                      professionalSummary={professionalSummary}
                      experiences={experiences}
                      educations={educations}
                      skills={skills}
                      languages={languages}
                      certifications={certifications}
                      awards={awards}
                      projects={projects}
                      interests={interests}
                      customSections={customSections}
                      onAddExperience={onAddExperience}
                      onRemoveExperience={onRemoveExperience}
                      onUpdateExperience={onUpdateExperience}
                      onAddEducation={onAddEducation}
                      onRemoveEducation={onRemoveEducation}
                      onUpdateEducation={onUpdateEducation}
                      onAddSkill={onAddSkill}
                      onRemoveSkill={onRemoveSkill}
                      onUpdateSkill={onUpdateSkill}
                      onAddLanguage={onAddLanguage}
                      onRemoveLanguage={onRemoveLanguage}
                      onUpdateLanguage={onUpdateLanguage}
                      onAddCertification={onAddCertification}
                      onRemoveCertification={onRemoveCertification}
                      onUpdateCertification={onUpdateCertification}
                      onAddAward={onAddAward}
                      onRemoveAward={onRemoveAward}
                      onUpdateAward={onUpdateAward}
                      onAddProject={onAddProject}
                      onRemoveProject={onRemoveProject}
                      onUpdateProject={onUpdateProject}
                      onAddInterest={onAddInterest}
                      onRemoveInterest={onRemoveInterest}
                      onUpdateInterest={onUpdateInterest}
                      onImageUpload={onImageUpload}
                      onRemoveImage={onRemoveImage}
                    />
                  </>
                )}
              </SectionModal>
            </div>

            {/* Right Column - Sticky Preview (Desktop Only) */}
            <div className="sticky top-20 hidden lg:block lg:col-span-1 h-[70vh]">
              <div
                className="overflow-hidden border border-gray-200 rounded-[10px] bg-white shadow-sm h-full cursor-zoom-in"
                onClick={onPreviewClick}
              >
                <div className="max-w-6xl mx-auto h-full p-4">
                  {previewData ? (
                    <div className="transform scale-[0.75] origin-top-left w-[133%] h-full overflow-hidden max-w-full mx-auto">
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
