"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Import shared components
import BuilderLayout from "@/components/builder/BuilderLayout";
import DynamicSectionContent from "@/components/builder/DynamicSectionContent";
import TemplateRenderer from "@/components/dynamic/TemplateRenderer";
import DynamicPdfRenderer from "@/components/dynamic/DynamicPdfRenderer";
import SimplePreviewModal from "@/components/builder/modals/SimplePreviewModal";
import AddSectionModal from "@/components/builder/modals/AddSectionModal";

// Import hooks and utilities
import { useCV } from "@/hooks/useCV";
import { useAIFeatures } from "@/hooks/useAIFeatures";
import { mapResumePropsToSectionsWithTemplate } from "@/utils/resumeSectionMapper";
import { templateManager } from "@/lib/templates/templateManager";
import { TemplatePersistence } from "@/utils/templatePersistence";
import { pdf, Document, Page, Text, View } from "@react-pdf/renderer";

// Import types
import {
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Award as AwardType,
  Project,
  Interest,
  Course,
  Organization,
  Publication as PublicationType,
  Reference,
  Declaration,
  CustomSection,
  ProfessionalSummary,
  ResumeSection,
} from "@/types";

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
  const [builderMode, setBuilderMode] = useState<"content" | "customize">(
    "content"
  );
  const [templateConfig, setTemplateConfig] = useState(template);
  const [resumeData, setResumeData] = useState<ResumeSection[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Resume data state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    image: undefined,
    targetedJobTitle: "",
  });

  const [professionalSummary, setProfessionalSummary] =
    useState<ProfessionalSummary>({
      id: "professional-summary",
      summary: "",
    });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [publications, setPublications] = useState<PublicationType[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  // Generate preview data
  const previewData = useMemo(() => {
    console.log("Template Builder - Generating preview data:", {
      resumeDataLength: resumeData.length,
      templateId,
      templateConfig: templateConfig?.id,
      resumeData: resumeData,
    });

    return (
      <TemplateRenderer
        data={resumeData}
        templateId={templateId}
        mode="preview"
        templateConfig={templateConfig}
      />
    );
  }, [resumeData, templateId, templateConfig]);

  // Update resume data when props or template config changes
  useEffect(() => {
    const updateResumeData = async () => {
      const data = await mapResumePropsToSectionsWithTemplate(
        {
          personalInfo,
          professionalSummary,
          experiences,
          educations,
          skills,
          languages,
          certifications,
          awards,
          projects,
          interests,
          courses,
          organizations,
          publications,
          references,
          declarations,
          customSections,
        },
        templateConfig
      );
      setResumeData(data);
    };

    updateResumeData();
  }, [
    personalInfo,
    professionalSummary,
    experiences,
    educations,
    skills,
    languages,
    certifications,
    awards,
    projects,
    interests,
    courses,
    organizations,
    publications,
    references,
    declarations,
    customSections,
    templateConfig,
  ]);

  // Load saved template configuration
  useEffect(() => {
    const savedConfig = TemplatePersistence.loadTemplateConfig(templateId);
    if (savedConfig) {
      setTemplateConfig(savedConfig);
    }
  }, [templateId]);

  // Template configuration handlers
  const handleTemplateConfigSave = (template: any) => {
    setTemplateConfig(template);
    TemplatePersistence.saveTemplateConfig(templateId, template);
  };

  const handleAddSection = () => {
    setShowAddSectionModal(true);
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
          data={resumeData}
          templateId={templateId}
          templateConfig={templateConfig}
          leftColumnSections={[
            "professional-summary",
            "skills",
            "languages",
            "awards",
            "certifications",
          ]}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.name}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Template-specific header */}
      {/* <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/cv-builder/template-selection"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Templates
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  setBuilderMode(
                    builderMode === "content" ? "customize" : "content"
                  )
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {builderMode === "content" ? "Customize" : "Content"}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isExporting ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main builder content */}
      <BuilderLayout
        onTogglePreview={() => {}}
        onExportPDF={handleExportPDF}
        onChangeTemplate={() =>
          router.push("/dashboard/cv-builder/template-selection")
        }
        showPreview={true}
        isExporting={isExporting}
        previewData={previewData}
        onPreviewClick={() => setShowPreviewModal(true)}
        builderMode={builderMode}
        onToggleBuilderMode={() =>
          setBuilderMode(builderMode === "content" ? "customize" : "content")
        }
        selectedTemplate={templateId}
        onTemplateConfigSave={handleTemplateConfigSave}
        onAddSection={handleAddSection}
      >
        <DynamicSectionContent
          activeSection="personal-info"
          templateConfig={templateConfig}
          onUpdateTemplateConfig={(updates) =>
            setTemplateConfig({ ...templateConfig, ...updates })
          }
          onRemoveSection={(sectionType) => {
            if (templateConfig) {
              const updatedTemplate = { ...templateConfig };
              updatedTemplate.columns.forEach((column: any) => {
                column.sections = column.sections.filter(
                  (s: string) => s !== sectionType
                );
              });
              setTemplateConfig(updatedTemplate);
            }
          }}
          onAddSection={handleAddSection}
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
          onUpdatePersonalInfo={(updates) =>
            setPersonalInfo({ ...personalInfo, ...updates })
          }
          onUpdateProfessionalSummary={(updates) =>
            setProfessionalSummary({ ...professionalSummary, ...updates })
          }
          onImageUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
              if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB");
                return;
              }

              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                setPersonalInfo({ ...personalInfo, image: result });
              };
              reader.readAsDataURL(file);
            }
          }}
          onRemoveImage={() => {
            setPersonalInfo({ ...personalInfo, image: "" });
          }}
          onAddExperience={() => {
            const newExp: Experience = {
              id: `exp-${Date.now()}`,
              position: "",
              company: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            };
            setExperiences([...experiences, newExp]);
          }}
          onRemoveExperience={(id) =>
            setExperiences(experiences.filter((exp) => exp.id !== id))
          }
          onUpdateExperience={(id, field, value) =>
            setExperiences(
              experiences.map((exp) =>
                exp.id === id ? { ...exp, [field]: value } : exp
              )
            )
          }
          onAddEducation={() => {
            const newEdu: Education = {
              id: `edu-${Date.now()}`,
              degree: "",
              institution: "",
              startDate: "",
              endDate: "",
              current: false,
            };
            setEducations([...educations, newEdu]);
          }}
          onRemoveEducation={(id) =>
            setEducations(educations.filter((edu) => edu.id !== id))
          }
          onUpdateEducation={(id, field, value) =>
            setEducations(
              educations.map((edu) =>
                edu.id === id ? { ...edu, [field]: value } : edu
              )
            )
          }
          onAddSkill={() => {
            const newSkill: Skill = {
              id: `skill-${Date.now()}`,
              name: "",
              level: "Beginner",
            };
            setSkills([...skills, newSkill]);
          }}
          onRemoveSkill={(id) =>
            setSkills(skills.filter((skill) => skill.id !== id))
          }
          onUpdateSkill={(id, field, value) =>
            setSkills(
              skills.map((skill) =>
                skill.id === id ? { ...skill, [field]: value } : skill
              )
            )
          }
          onAddLanguage={() => {
            const newLang: Language = {
              id: `lang-${Date.now()}`,
              name: "",
              level: "Basic",
            };
            setLanguages([...languages, newLang]);
          }}
          onRemoveLanguage={(id) =>
            setLanguages(languages.filter((lang) => lang.id !== id))
          }
          onUpdateLanguage={(id, field, value) =>
            setLanguages(
              languages.map((lang) =>
                lang.id === id ? { ...lang, [field]: value } : lang
              )
            )
          }
          onAddCertification={() => {
            const newCert: Certification = {
              id: `cert-${Date.now()}`,
              name: "",
              issuer: "",
              date: "",
              credentialId: "",
            };
            setCertifications([...certifications, newCert]);
          }}
          onRemoveCertification={(id) =>
            setCertifications(certifications.filter((cert) => cert.id !== id))
          }
          onUpdateCertification={(id, field, value) =>
            setCertifications(
              certifications.map((cert) =>
                cert.id === id ? { ...cert, [field]: value } : cert
              )
            )
          }
          onAddAward={() => {
            const newAward: AwardType = {
              id: `award-${Date.now()}`,
              title: "",
              issuer: "",
              date: "",
              description: "",
            };
            setAwards([...awards, newAward]);
          }}
          onRemoveAward={(id) =>
            setAwards(awards.filter((award) => award.id !== id))
          }
          onUpdateAward={(id, field, value) =>
            setAwards(
              awards.map((award) =>
                award.id === id ? { ...award, [field]: value } : award
              )
            )
          }
          onAddProject={() => {
            const newProject: Project = {
              id: `project-${Date.now()}`,
              name: "",
              description: "",
              technologies: [],
              url: "",
            };
            setProjects([...projects, newProject]);
          }}
          onRemoveProject={(id) =>
            setProjects(projects.filter((project) => project.id !== id))
          }
          onUpdateProject={(id, field, value) =>
            setProjects(
              projects.map((project) =>
                project.id === id ? { ...project, [field]: value } : project
              )
            )
          }
          onAddInterest={() => {
            const newInterest: Interest = {
              id: `interest-${Date.now()}`,
              name: "",
            };
            setInterests([...interests, newInterest]);
          }}
          onRemoveInterest={(id) =>
            setInterests(interests.filter((interest) => interest.id !== id))
          }
          onUpdateInterest={(id, field, value) =>
            setInterests(
              interests.map((interest) =>
                interest.id === id ? { ...interest, [field]: value } : interest
              )
            )
          }
          onAddCustomSection={() => {
            const newSection: CustomSection = {
              id: `custom-${Date.now()}`,
              title: "",
              content: "",
            };
            setCustomSections([...customSections, newSection]);
          }}
          onRemoveCustomSection={(id) =>
            setCustomSections(
              customSections.filter((section) => section.id !== id)
            )
          }
          onUpdateCustomSection={(id, field, value) =>
            setCustomSections(
              customSections.map((section) =>
                section.id === id ? { ...section, [field]: value } : section
              )
            )
          }
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
          if (templateConfig) {
            const updatedTemplate = { ...templateConfig };
            if (updatedTemplate.columns.length > 0) {
              updatedTemplate.columns[0].sections.push(sectionType);
            }
            setTemplateConfig(updatedTemplate);
          }
          setShowAddSectionModal(false);
        }}
        availableSections={
          templateConfig
            ? templateConfig.columns.flatMap((column: any) => column.sections)
            : []
        }
      />
    </div>
  );
}
