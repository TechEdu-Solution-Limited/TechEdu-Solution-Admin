// components/cv/builder/SectionContentRenderer.tsx
"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ResumeSection, Skill } from "@/types/cv";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import SummarySection from "./sections/SummarySection";
import LanguagesSection from "./sections/LanguagesSection";
import AwardsSection from "./sections/AwardsSection";
import ProjectsSection from "./sections/ProjectsSection";
import InterestsSection from "./sections/InterestsSection";
import CertificationsSection from "./sections/CertificationsSection";

interface SectionContentRendererProps {
  section: ResumeSection;
  onUpdate: (updates: any) => void;

  // NEW: allow the renderer to push section-level updates up immediately
  onUpdateSection?: (
    sectionId: string,
    updates: Partial<ResumeSection>
  ) => void;

  onShowAIConsent?: () => void;
  aiConsent?: { aiProcessing: boolean; aiTraining: boolean } | null;
  cvId?: string;
  onCheckExistingConsent?: (
    cvId: string
  ) => Promise<{ aiProcessing: boolean; aiTraining: boolean } | null>;

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
}

export function SectionContentRenderer({
  section,
  onUpdate,
  onUpdateSection, // NEW
  onShowAIConsent,
  aiConsent,
  cvId,
  onCheckExistingConsent,
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
}: SectionContentRendererProps) {
  // ---------- local working copy for SKILLS (prevents "save clears inputs") ----------
  const [localSkills, setLocalSkills] = useState(skills);

  // Keep local copy in sync if the user switches to another section or external refresh happens
  useEffect(() => {
    if (section.type === "skills") {
      setLocalSkills(skills);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, section.type, JSON.stringify(skills)]);

  // Push localSkills to parent immediately so Save won’t wipe them
  const commitSkills = useCallback(
    (next: Skill[]) => {
      setLocalSkills(next);

      // keep existing per-row flow if you rely on it
      if (onUpdateSkill) {
        next.forEach((s) => {
          onUpdateSkill(s.id, "name", s.name ?? "");
          onUpdateSkill(s.id, "level", (s.level ?? "Beginner") as string);
        });
      }

      // update the whole section immediately (narrowed to 'skills' case)
      if (onUpdateSection) {
        const update = {
          data: { ...(section.data as any), skills: next },
        } as unknown as Partial<ResumeSection>;
        onUpdateSection(section.id, update);
      }
    },
    [onUpdateSkill, onUpdateSection, section.data, section.id]
  );

  // wrappers we pass to SkillsSection that update the local copy first
  const handleAddSkillLocal = useCallback(() => {
    if (!onAddSkill) return;
    onAddSkill(); // let parent create id
    // local add placeholder so UI doesn’t jump; real id arrives from parent shortly
    commitSkills([
      ...localSkills,
      {
        id: `temp-${Date.now()}`,
        name: "",
        level: "Beginner",
      } as any,
    ]);
  }, [onAddSkill, localSkills, commitSkills]);

  const handleRemoveSkillLocal = useCallback(
    (id: string) => {
      onRemoveSkill?.(id);
      commitSkills(localSkills.filter((s) => s.id !== id));
    },
    [onRemoveSkill, localSkills, commitSkills]
  );

  const handleUpdateSkillLocal = useCallback(
    (id: string, field: keyof Skill, value: string) => {
      onUpdateSkill?.(id, field as any, value);
      commitSkills(
        localSkills.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    [onUpdateSkill, localSkills, commitSkills]
  );

  // -------------------------------------------------------------------------------

  switch (section.type) {
    case "personal-info":
      return (
        <PersonalInfoSection
          personalInfo={personalInfo || section.data}
          onUpdatePersonalInfo={onUpdate}
          onImageUpload={onImageUpload || (() => {})}
          onRemoveImage={onRemoveImage || (() => {})}
        />
      );

    case "work-experience":
      return (
        <ExperienceSection
          experiences={experiences}
          personalInfo={personalInfo}
          onAdd={onAddExperience || (() => {})}
          onRemove={onRemoveExperience || (() => {})}
          onUpdate={onUpdateExperience || (() => {})}
          onShowAIConsent={onShowAIConsent}
          aiConsent={aiConsent}
          cvId={cvId}
          onCheckExistingConsent={onCheckExistingConsent}
        />
      );

    case "education":
      return (
        <EducationSection
          educations={educations}
          onAdd={onAddEducation || (() => {})}
          onRemove={onRemoveEducation || (() => {})}
          onUpdate={onUpdateEducation || (() => {})}
        />
      );

    case "skills":
      return (
        <SkillsSection
          skills={localSkills} // ← use local working copy
          personalInfo={personalInfo}
          onAdd={handleAddSkillLocal}
          onRemove={handleRemoveSkillLocal}
          onUpdate={handleUpdateSkillLocal}
          onShowAIConsent={onShowAIConsent}
          aiConsent={aiConsent}
          cvId={cvId}
        />
      );

    case "professional-summary":
      return (
        <SummarySection
          professionalSummary={professionalSummary || section.data}
          personalInfo={personalInfo}
          onUpdateProfessionalSummary={onUpdate}
          onShowAIConsent={onShowAIConsent}
          aiConsent={aiConsent}
          cvId={cvId}
          onCheckExistingConsent={onCheckExistingConsent}
        />
      );

    case "languages":
      return (
        <LanguagesSection
          languages={languages}
          onAdd={onAddLanguage || (() => {})}
          onRemove={onRemoveLanguage || (() => {})}
          onUpdate={onUpdateLanguage || (() => {})}
        />
      );

    case "awards":
      return (
        <AwardsSection
          awards={awards}
          onAdd={onAddAward || (() => {})}
          onRemove={onRemoveAward || (() => {})}
          onUpdate={onUpdateAward || (() => {})}
        />
      );

    case "projects":
      return (
        <ProjectsSection
          projects={projects}
          onAdd={onAddProject || (() => {})}
          onRemove={onRemoveProject || (() => {})}
          onUpdate={onUpdateProject || (() => {})}
        />
      );

    case "interests":
      return (
        <InterestsSection
          interests={interests}
          onAdd={onAddInterest || (() => {})}
          onRemove={onRemoveInterest || (() => {})}
          onUpdate={onUpdateInterest || (() => {})}
        />
      );

    case "certifications":
      return (
        <CertificationsSection
          certifications={certifications}
          onAdd={onAddCertification || (() => {})}
          onRemove={onRemoveCertification || (() => {})}
          onUpdate={onUpdateCertification || (() => {})}
        />
      );

    default:
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {section.type?.replace("-", " ") || "Unknown Section"}
          </h3>
          <p className="text-sm text-gray-600">
            Section editor for {section.type} will be implemented here
          </p>
        </div>
      );
  }
}
