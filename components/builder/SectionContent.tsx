"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ProfessionalSummarySection from "./sections/SummarySection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import LanguagesSection from "./sections/LanguagesSection";
import CertificationsSection from "./sections/CertificationsSection";
import AwardsSection from "./sections/AwardsSection";
import ProjectsSection from "./sections/ProjectsSection";
import InterestsSection from "./sections/InterestsSection";
import CustomSectionsSection from "./sections/CustomSectionsSection";
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
  CustomSection,
  ProfessionalSummary,
} from "@/types";

interface SectionContentProps {
  activeSection: string;
  personalInfo: PersonalInfo;
  professionalSummary: ProfessionalSummary;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  awards: AwardType[];
  projects: Project[];
  interests: Interest[];
  customSections: CustomSection[];
  enabledSections: string[];
  onUpdatePersonalInfo: (updates: Partial<PersonalInfo>) => void;
  onUpdateProfessionalSummary: (updates: Partial<ProfessionalSummary>) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onAddExperience: () => void;
  onRemoveExperience: (id: string) => void;
  onUpdateExperience: (
    id: string,
    field: keyof Experience,
    value: string | boolean
  ) => void;
  onAddEducation: () => void;
  onRemoveEducation: (id: string) => void;
  onUpdateEducation: (
    id: string,
    field: keyof Education,
    value: string | boolean
  ) => void;
  onAddSkill: () => void;
  onRemoveSkill: (id: string) => void;
  onUpdateSkill: (id: string, field: keyof Skill, value: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (id: string) => void;
  onUpdateLanguage: (id: string, field: keyof Language, value: string) => void;
  onAddCertification: () => void;
  onRemoveCertification: (id: string) => void;
  onUpdateCertification: (
    id: string,
    field: keyof Certification,
    value: string
  ) => void;
  onAddAward: () => void;
  onRemoveAward: (id: string) => void;
  onUpdateAward: (id: string, field: keyof AwardType, value: string) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
  onUpdateProject: (
    id: string,
    field: keyof Project,
    value: string | string[]
  ) => void;
  onAddInterest: () => void;
  onRemoveInterest: (id: string) => void;
  onUpdateInterest: (id: string, field: keyof Interest, value: string) => void;
  onAddCustomSection: () => void;
  onRemoveCustomSection: (id: string) => void;
  onUpdateCustomSection: (
    id: string,
    field: keyof CustomSection,
    value: string
  ) => void;
  onShowAIConsent?: () => void;
}

export default function SectionContent({
  activeSection,
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
  customSections,
  enabledSections,
  onUpdatePersonalInfo,
  onUpdateProfessionalSummary,
  onImageUpload,
  onRemoveImage,
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
  onAddCustomSection,
  onRemoveCustomSection,
  onUpdateCustomSection,
  onShowAIConsent,
}: SectionContentProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    activeSection,
  ]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "personal":
        return (
          <PersonalInfoSection
            personalInfo={personalInfo}
            onUpdatePersonalInfo={onUpdatePersonalInfo}
            onImageUpload={onImageUpload}
            onRemoveImage={onRemoveImage}
          />
        );
      case "professional-summary":
        return (
          <ProfessionalSummarySection
            professionalSummary={professionalSummary}
            personalInfo={personalInfo}
            onUpdateProfessionalSummary={onUpdateProfessionalSummary}
            onShowAIConsent={onShowAIConsent}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            experiences={experiences}
            personalInfo={personalInfo}
            onAdd={onAddExperience}
            onRemove={onRemoveExperience}
            onUpdate={onUpdateExperience}
            onShowAIConsent={onShowAIConsent}
          />
        );
      case "education":
        return (
          <EducationSection
            educations={educations}
            onAdd={onAddEducation}
            onRemove={onRemoveEducation}
            onUpdate={onUpdateEducation}
          />
        );
      case "skills":
        return (
          <SkillsSection
            skills={skills}
            onAdd={onAddSkill}
            onRemove={onRemoveSkill}
            onUpdate={onUpdateSkill}
          />
        );
      case "languages":
        return (
          <LanguagesSection
            languages={languages}
            onAdd={onAddLanguage}
            onRemove={onRemoveLanguage}
            onUpdate={onUpdateLanguage}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            certifications={certifications}
            onAdd={onAddCertification}
            onRemove={onRemoveCertification}
            onUpdate={onUpdateCertification}
          />
        );
      case "awards":
        return (
          <AwardsSection
            awards={awards}
            onAdd={onAddAward}
            onRemove={onRemoveAward}
            onUpdate={onUpdateAward}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            projects={projects}
            onAdd={onAddProject}
            onRemove={onRemoveProject}
            onUpdate={onUpdateProject}
          />
        );
      case "interests":
        return (
          <InterestsSection
            interests={interests}
            onAdd={onAddInterest}
            onRemove={onRemoveInterest}
            onUpdate={onUpdateInterest}
          />
        );
      case "custom":
        return (
          <CustomSectionsSection
            customSections={customSections}
            onAdd={onAddCustomSection}
            onRemove={onRemoveCustomSection}
            onUpdate={onUpdateCustomSection}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Section not implemented yet
            </p>
          </div>
        );
    }
  };

  const sectionLabels: Record<string, string> = {
    personal: "Personal Information",
    "professional-summary": "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    certifications: "Certifications",
    awards: "Awards",
    projects: "Projects",
    interests: "Interests",
    custom: "Custom Sections",
  };

  return (
    <div className="space-y-2">
      {enabledSections.map((sectionId) => {
        const isExpanded = expandedSections.includes(sectionId);
        const isActive = activeSection === sectionId;

        return (
          <div
            key={sectionId}
            className={`border rounded-lg overflow-hidden transition-all duration-200 ${
              isActive
                ? "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            <button
              onClick={() => toggleSection(sectionId)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <span
                className={`font-medium ${
                  isActive
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {sectionLabels[sectionId] || sectionId}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">{renderSectionContent(sectionId)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
