"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Import shared components
import BuilderLayout from "@/components/builder/BuilderLayout";
import TemplateRenderer from "@/components/dynamic/TemplateRenderer";
import DynamicPdfRenderer from "@/components/dynamic/DynamicPdfRenderer";
import SimplePreviewModal from "@/components/builder/modals/SimplePreviewModal";
import AddSectionModal from "@/components/builder/modals/AddSectionModal";
import TemplateSelectorModal from "@/components/TemplateSelectorModal";
import AIConsentModal from "@/components/builder/modals/AIConsentModal";
import { StatusBar } from "@/components/builder/StatusBar";

// Import custom hooks
import { useTemplateBuilder } from "@/hooks/useTemplateBuilder";
import { useCVOperations } from "@/hooks/useCVOperations";
import { useAIFeatures } from "@/hooks/useAIFeatures";

// Import utilities
import { templateManager } from "@/lib/templates/templateManager";
import { pdf } from "@react-pdf/renderer";

// Initialize dynamic sections
import "@/lib/sections/initializeSections";

interface TemplateBuilderPageProps {
  params: Promise<{
    template: string;
  }>;
}

export default function TemplateBuilderPage({
  params,
}: TemplateBuilderPageProps) {
  const router = useRouter();
  const { template: templateId } = use(params);

  // Validate template exists
  const template = templateManager.getTemplate(templateId);
  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Template Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The template "{templateId}" does not exist.
          </p>
          <Link
            href="/dashboard/cv-builder/template-selection"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Template Selection
          </Link>
        </div>
      </div>
    );
  }

  // State management
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cvId, setCvId] = useState<string | undefined>(undefined);
  const [showAIConsentModal, setShowAIConsentModal] = useState(false);
  const [aiConsent, setAiConsent] = useState<{
    aiProcessing: boolean;
    aiTraining: boolean;
  } | null>(null);

  // Handle AI consent
  const handleAIConsent = (consent: {
    aiProcessing: boolean;
    aiTraining: boolean;
  }) => {
    setAiConsent(consent);
    setShowAIConsentModal(false);
    // Store consent in localStorage for persistence
    localStorage.setItem("cv-builder-ai-consent", JSON.stringify(consent));
  };

  // Handle template selection with consent check
  const handleTemplateSelectWithConsent = (templateId: string) => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem("cv-builder-ai-consent");
    if (savedConsent) {
      setAiConsent(JSON.parse(savedConsent));
      templateBuilder.handleTemplateSelect(templateId);
    } else {
      // Show consent modal first
      setShowAIConsentModal(true);
      // Store the template ID to select after consent
      localStorage.setItem("pending-template-selection", templateId);
    }
  };

  // Handle consent acceptance and template selection
  const handleConsentAccept = (consent: {
    aiProcessing: boolean;
    aiTraining: boolean;
  }) => {
    handleAIConsent(consent);
    const pendingTemplate = localStorage.getItem("pending-template-selection");
    if (pendingTemplate) {
      templateBuilder.handleTemplateSelect(pendingTemplate);
      localStorage.removeItem("pending-template-selection");
    }
  };

  // Custom hooks
  const templateBuilder = useTemplateBuilder(templateId);
  const cvOperations = useCVOperations(cvId, templateBuilder.resumeData);
  const aiFeatures = useAIFeatures(cvId);

  // Generate preview data
  const previewData = useMemo(() => {
    return (
      <TemplateRenderer
        data={templateBuilder.resumeData}
        templateId={templateId}
        mode="preview"
        templateConfig={templateBuilder.templateConfig}
        leftColumnSections={templateBuilder.leftColumnSections}
      />
    );
  }, [
    templateBuilder.resumeData,
    templateId,
    templateBuilder.templateConfig,
    templateBuilder.leftColumnSections,
  ]);

  // CV Management handlers
  const handleCreateCV = async (): Promise<string | null> => {
    const newCvId = await cvOperations.handleCreateCV(
      templateBuilder.personalInfo
    );
    if (newCvId) {
      setCvId(newCvId);
    }
    return newCvId;
  };

  const handleUpdateCV = async () => {
    await cvOperations.handleUpdateCV();
  };

  const handleSaveDraft = async () => {
    await cvOperations.handleSaveDraft();
  };

  const handlePublishDraft = async () => {
    await cvOperations.handlePublishDraft(templateBuilder.personalInfo);
  };

  // AI suggestion handler
  const handleAISuggestion = (sectionType: string, suggestion: any) => {
    console.log(`AI suggestion for ${sectionType}:`, suggestion);

    // Apply AI suggestions based on section type
    switch (sectionType) {
      case "professional-summary":
        if (suggestion.content) {
          templateBuilder.setProfessionalSummary((prev) => ({
            ...prev,
            summary: suggestion.content,
          }));
        }
        break;
      case "work-experience":
        if (suggestion.enhanced) {
          console.log("Enhanced work experience:", suggestion.enhanced);
        }
        break;
      case "skills":
        if (suggestion.skills) {
          console.log("Prioritized skills:", suggestion.skills);
        }
        break;
      default:
        console.log("AI suggestion received:", suggestion);
    }
  };

  // Export handlers
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Register fonts before PDF generation
      const { registerPDFFonts } = await import("@/utils/fontRegistration");
      registerPDFFonts();

      const blob = await pdf(
        <DynamicPdfRenderer
          data={templateBuilder.resumeData}
          templateId={templateId}
          templateConfig={templateBuilder.templateConfig}
          leftColumnSections={templateBuilder.leftColumnSections}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${templateBuilder.personalInfo.firstName}-${templateBuilder.personalInfo.lastName}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Export failed:", error);
      alert(`PDF export failed: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main builder content */}
      <BuilderLayout
        onTogglePreview={() => {}}
        onExportPDF={handleExportPDF}
        onChangeTemplate={templateBuilder.handleTemplateChange}
        showPreview={true}
        isExporting={isExporting}
        previewData={previewData}
        onPreviewClick={() => setShowPreviewModal(true)}
        builderMode={templateBuilder.builderMode}
        onToggleBuilderMode={() =>
          templateBuilder.setBuilderMode(
            templateBuilder.builderMode === "content" ? "customize" : "content"
          )
        }
        selectedTemplate={templateId}
        onTemplateConfigSave={templateBuilder.handleTemplateConfigSave}
        onAddSection={() => setShowAddSectionModal(true)}
        sections={templateBuilder.allSections}
        // Section data
        personalInfo={templateBuilder.personalInfo}
        professionalSummary={templateBuilder.professionalSummary}
        experiences={templateBuilder.experiences}
        educations={templateBuilder.educations}
        skills={templateBuilder.skills}
        languages={templateBuilder.languages}
        certifications={templateBuilder.certifications}
        awards={templateBuilder.awards}
        projects={templateBuilder.projects}
        interests={templateBuilder.interests}
        customSections={templateBuilder.customSections}
        // Section handlers
        onUpdatePersonalInfo={(updates) =>
          templateBuilder.setPersonalInfo({
            ...templateBuilder.personalInfo,
            ...updates,
          })
        }
        onUpdateProfessionalSummary={(updates) =>
          templateBuilder.setProfessionalSummary({
            ...templateBuilder.professionalSummary,
            ...updates,
          })
        }
        onAddExperience={() => {
          const newExperience = {
            id: Date.now().toString(),
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            location: "",
          };
          templateBuilder.setExperiences([
            ...templateBuilder.experiences,
            newExperience,
          ]);
        }}
        onRemoveExperience={(id) => {
          templateBuilder.setExperiences(
            templateBuilder.experiences.filter((exp) => exp.id !== id)
          );
        }}
        onUpdateExperience={(id, field, value) => {
          templateBuilder.setExperiences(
            templateBuilder.experiences.map((exp) =>
              exp.id === id ? { ...exp, [field]: value } : exp
            )
          );
        }}
        onAddEducation={() => {
          const newEducation = {
            id: Date.now().toString(),
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            gpa: "",
            location: "",
            description: "",
          };
          templateBuilder.setEducations([
            ...templateBuilder.educations,
            newEducation,
          ]);
        }}
        onRemoveEducation={(id) => {
          templateBuilder.setEducations(
            templateBuilder.educations.filter((edu) => edu.id !== id)
          );
        }}
        onUpdateEducation={(id, field, value) => {
          templateBuilder.setEducations(
            templateBuilder.educations.map((edu) =>
              edu.id === id ? { ...edu, [field]: value } : edu
            )
          );
        }}
        onAddSkill={() => {
          const newSkill = {
            id: Date.now().toString(),
            name: "",
            level: "Intermediate" as const,
          };
          templateBuilder.setSkills([...templateBuilder.skills, newSkill]);
        }}
        onRemoveSkill={(id) => {
          templateBuilder.setSkills(
            templateBuilder.skills.filter((skill) => skill.id !== id)
          );
        }}
        onUpdateSkill={(id, field, value) => {
          templateBuilder.setSkills(
            templateBuilder.skills.map((skill) =>
              skill.id === id ? { ...skill, [field]: value } : skill
            )
          );
        }}
        onAddLanguage={() => {
          const newLanguage = {
            id: Date.now().toString(),
            name: "",
            level: "Conversational" as const,
          };
          templateBuilder.setLanguages([
            ...templateBuilder.languages,
            newLanguage,
          ]);
        }}
        onRemoveLanguage={(id) => {
          templateBuilder.setLanguages(
            templateBuilder.languages.filter((lang) => lang.id !== id)
          );
        }}
        onUpdateLanguage={(id, field, value) => {
          templateBuilder.setLanguages(
            templateBuilder.languages.map((lang) =>
              lang.id === id ? { ...lang, [field]: value } : lang
            )
          );
        }}
        onAddCertification={() => {
          const newCertification = {
            id: Date.now().toString(),
            name: "",
            issuer: "",
            date: "",
            credentialId: "",
            credentialUrl: "",
          };
          templateBuilder.setCertifications([
            ...templateBuilder.certifications,
            newCertification,
          ]);
        }}
        onRemoveCertification={(id) => {
          templateBuilder.setCertifications(
            templateBuilder.certifications.filter((cert) => cert.id !== id)
          );
        }}
        onUpdateCertification={(id, field, value) => {
          templateBuilder.setCertifications(
            templateBuilder.certifications.map((cert) =>
              cert.id === id ? { ...cert, [field]: value } : cert
            )
          );
        }}
        onAddAward={() => {
          const newAward = {
            id: Date.now().toString(),
            title: "",
            issuer: "",
            date: "",
            description: "",
          };
          templateBuilder.setAwards([...templateBuilder.awards, newAward]);
        }}
        onRemoveAward={(id) => {
          templateBuilder.setAwards(
            templateBuilder.awards.filter((award) => award.id !== id)
          );
        }}
        onUpdateAward={(id, field, value) => {
          templateBuilder.setAwards(
            templateBuilder.awards.map((award) =>
              award.id === id ? { ...award, [field]: value } : award
            )
          );
        }}
        onAddProject={() => {
          const newProject = {
            id: Date.now().toString(),
            name: "",
            description: "",
            technologies: [],
            url: "",
            startDate: "",
            endDate: "",
          };
          templateBuilder.setProjects([
            ...templateBuilder.projects,
            newProject,
          ]);
        }}
        onRemoveProject={(id) => {
          templateBuilder.setProjects(
            templateBuilder.projects.filter((project) => project.id !== id)
          );
        }}
        onUpdateProject={(id, field, value) => {
          templateBuilder.setProjects(
            templateBuilder.projects.map((project) =>
              project.id === id ? { ...project, [field]: value } : project
            )
          );
        }}
        onAddInterest={() => {
          const newInterest = {
            id: Date.now().toString(),
            name: "",
          };
          templateBuilder.setInterests([
            ...templateBuilder.interests,
            newInterest,
          ]);
        }}
        onRemoveInterest={(id) => {
          templateBuilder.setInterests(
            templateBuilder.interests.filter((interest) => interest.id !== id)
          );
        }}
        onUpdateInterest={(id, field, value) => {
          templateBuilder.setInterests(
            templateBuilder.interests.map((interest) =>
              interest.id === id ? { ...interest, [field]: value } : interest
            )
          );
        }}
        onImageUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              templateBuilder.setPersonalInfo({
                ...templateBuilder.personalInfo,
                image: result,
              });
            };
            reader.readAsDataURL(file);
          }
        }}
        onRemoveImage={() => {
          templateBuilder.setPersonalInfo({
            ...templateBuilder.personalInfo,
            image: "",
          });
        }}
        onShowAIConsent={() => setShowAIConsentModal(true)}
        onUpdateSection={(sectionId, updates) => {
          // Update the custom section heading
          if (updates.heading) {
            templateBuilder.setCustomSectionHeadings({
              ...templateBuilder.customSectionHeadings,
              [sectionId]: updates.heading,
            });
          }
        }}
        // CV Management buttons
        onCreateCV={handleCreateCV}
        onUpdateCV={handleUpdateCV}
        onSaveDraft={handleSaveDraft}
        onPublishDraft={handlePublishDraft}
        isCreating={cvOperations.isCreating}
        cvId={cvId}
        loading={cvOperations.cvLoading}
        error={cvOperations.cvError}
      >
        {/* Status Bar */}
        <StatusBar
          isSaving={cvOperations.cvLoading}
          lastSaved={cvOperations.lastSaved}
          error={cvOperations.cvError}
          isCreating={cvOperations.isCreating}
          cvId={cvId}
        />
      </BuilderLayout>

      {/* Modals */}
      <SimplePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewData={previewData}
      />

      <AddSectionModal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        onAddSection={(sectionType) => {
          // Add data to the appropriate array based on section type
          switch (sectionType) {
            case "work-experience":
              const newExperience = {
                id: Date.now().toString(),
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                current: false,
                description: "",
                location: "",
              };
              templateBuilder.setExperiences([
                ...templateBuilder.experiences,
                newExperience,
              ]);
              break;
            case "education":
              const newEducation = {
                id: Date.now().toString(),
                institution: "",
                degree: "",
                field: "",
                startDate: "",
                endDate: "",
                gpa: "",
                location: "",
                description: "",
              };
              templateBuilder.setEducations([
                ...templateBuilder.educations,
                newEducation,
              ]);
              break;
            case "skills":
              const newSkill = {
                id: Date.now().toString(),
                name: "",
                level: "Intermediate" as const,
              };
              templateBuilder.setSkills([...templateBuilder.skills, newSkill]);
              break;
            case "languages":
              const newLanguage = {
                id: Date.now().toString(),
                name: "",
                level: "Conversational" as const,
              };
              templateBuilder.setLanguages([
                ...templateBuilder.languages,
                newLanguage,
              ]);
              break;
            case "certifications":
              const newCertification = {
                id: Date.now().toString(),
                name: "",
                issuer: "",
                date: "",
                credentialId: "",
                credentialUrl: "",
              };
              templateBuilder.setCertifications([
                ...templateBuilder.certifications,
                newCertification,
              ]);
              break;
            case "awards":
              const newAward = {
                id: Date.now().toString(),
                title: "",
                issuer: "",
                date: "",
                description: "",
              };
              templateBuilder.setAwards([...templateBuilder.awards, newAward]);
              break;
            case "projects":
              const newProject = {
                id: Date.now().toString(),
                name: "",
                description: "",
                technologies: [],
                url: "",
                startDate: "",
                endDate: "",
              };
              templateBuilder.setProjects([
                ...templateBuilder.projects,
                newProject,
              ]);
              break;
            case "interests":
              const newInterest = {
                id: Date.now().toString(),
                name: "",
              };
              templateBuilder.setInterests([
                ...templateBuilder.interests,
                newInterest,
              ]);
              break;
            case "professional-summary":
              // Professional summary is already handled by the data
              break;
            default:
              console.log("Unknown section type:", sectionType);
          }
          setShowAddSectionModal(false);
        }}
        availableSections={templateBuilder.allSections.map(
          (section) => section.type
        )}
      />

      <TemplateSelectorModal
        isOpen={templateBuilder.showTemplateSelector}
        onClose={() => templateBuilder.setShowTemplateSelector(false)}
        onTemplateSelect={handleTemplateSelectWithConsent}
      />

      <AIConsentModal
        isOpen={showAIConsentModal}
        onClose={() => setShowAIConsentModal(false)}
        onAccept={handleConsentAccept}
      />
    </div>
  );
}
