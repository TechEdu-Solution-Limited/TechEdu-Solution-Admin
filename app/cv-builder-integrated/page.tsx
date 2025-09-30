"use client";

import React from "react";
import CVBuilderMain from "@/components/builder/CVBuilderMain";
import { CVBuilderState } from "@/types/cv-builder";

export default function CVBuilderIntegratedPage() {
  // Initialize with some default state
  const initialState: Partial<CVBuilderState> = {
    selectedMode: "scratch",
    selectedTemplate: "modern",
    activeSection: "personal-info",
    enabledSections: [
      "personal-info",
      "work-experience",
      "education",
      "skills",
      "professional-summary",
    ],
    // Add dummy data to initial state
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      targetedJobTitle: "Senior Software Engineer",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      website: "johndoe.dev",
    },
    professionalSummary: {
      id: "professional-summary",
      summary:
        "Experienced software developer with 5+ years of expertise in building scalable web applications using React, Node.js, and cloud technologies. Passionate about creating user-friendly solutions and leading cross-functional teams to deliver high-quality products.",
    },
    experiences: [
      {
        id: "exp-1",
        position: "Senior Software Engineer",
        company: "TechCorp Inc.",
        startDate: "2021-01",
        endDate: "2024-01",
        location: "San Francisco, CA",
        description:
          "<ul><li>Led development of microservices architecture serving 1M+ users</li><li>Mentored 3 junior developers and improved team productivity by 40%</li><li>Implemented CI/CD pipelines reducing deployment time by 60%</li></ul>",
      },
    ],
    educations: [
      {
        id: "edu-1",
        degree: "Bachelor of Science in Computer Science",
        institution: "University of California, Berkeley",
        field: "Computer Science",
        startDate: "2015-09",
        endDate: "2019-05",
        location: "Berkeley, CA",
        gpa: "3.8/4.0",
      },
    ],
    skills: [
      { id: "skill-1", name: "JavaScript", level: "Expert" },
      { id: "skill-2", name: "React", level: "Advanced" },
      { id: "skill-3", name: "Node.js", level: "Advanced" },
      { id: "skill-4", name: "TypeScript", level: "Expert" },
    ],
  };

  // Auto-save configuration
  const autoSaveConfig = {
    enabled: true,
    delay: 2000, // 2 seconds
  };

  // State change handler
  const handleStateChange = (state: CVBuilderState) => {
    console.log("CV Builder state changed:", state);
  };

  // Save handler
  const handleSave = async (state: CVBuilderState) => {
    console.log("Saving CV:", state);
    // The actual saving is handled by the useCV hook internally
  };

  // Load handler
  const handleLoad = async (id: string): Promise<Partial<CVBuilderState>> => {
    console.log("Loading CV with ID:", id);
    // The actual loading is handled by the useCV hook internally
    return {};
  };

  // Export handler
  const handleExport = async (state: CVBuilderState) => {
    console.log("Exporting CV:", state);

    try {
      // Register fonts before PDF generation
      const { registerPDFFonts } = await import("@/utils/fontRegistration");
      registerPDFFonts();

      // Import PDF generation utilities
      const { pdf } = await import("@react-pdf/renderer");
      const DynamicPdfRenderer = (
        await import("@/components/dynamic/DynamicPdfRenderer")
      ).default;

      // Map the state to resume data format
      const { mapResumePropsToSectionsWithTemplate } = await import(
        "@/utils/resumeSectionMapper"
      );
      const resumeData = await mapResumePropsToSectionsWithTemplate(
        {
          personalInfo: state.personalInfo,
          professionalSummary: state.professionalSummary,
          experiences: state.experiences,
          educations: state.educations,
          skills: state.skills,
          languages: state.languages,
          certifications: state.certifications,
          awards: state.awards,
          projects: state.projects,
          interests: state.interests,
          courses: state.courses,
          organizations: state.organizations,
          publications: state.publications,
          references: state.references,
          declarations: state.declarations,
          customSections: state.customSections,
        },
        state.templateConfig
      );

      const blob = await pdf(
        <DynamicPdfRenderer
          data={resumeData}
          templateId={state.selectedTemplate}
          templateConfig={state.templateConfig}
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
      a.download = `${state.personalInfo.firstName}-${state.personalInfo.lastName}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CVBuilderMain
        initialState={initialState}
        autoSaveConfig={autoSaveConfig}
        onStateChange={handleStateChange}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
      />
    </div>
  );
}
