/**
 * Shared Section Logic for Classic Template
 *
 * Provides consistent data formatting for both HTML preview and PDF rendering
 */

import { ResumeSection } from "@/types";

export function formatSectionContent(section: ResumeSection) {
  switch (section.type) {
    case "work-experience":
      return Array.isArray(section.data)
        ? section.data.map((exp: any) => ({
            title: exp.position || exp.title,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate || "Present",
            location: exp.location,
            bullets: exp.highlights || exp.description ? [exp.description] : [],
          }))
        : [];

    case "education":
      return Array.isArray(section.data)
        ? section.data.map((edu: any) => ({
            degree: edu.degree,
            school: edu.institution,
            startDate: edu.startDate,
            endDate: edu.endDate || "Present",
            location: edu.location,
            gpa: edu.gpa,
          }))
        : [];

    case "skills":
      return Array.isArray(section.data)
        ? section.data.map((skill: any) => ({
            name: skill.name,
            level: skill.level,
            category: skill.category,
          }))
        : [];

    case "languages":
      return Array.isArray(section.data)
        ? section.data.map((lang: any) => ({
            name: lang.name,
            level: lang.level,
          }))
        : [];

    case "projects":
      return Array.isArray(section.data)
        ? section.data.map((project: any) => ({
            name: project.name,
            description: project.description,
            url: project.url,
            technologies: project.technologies || [],
            startDate: project.startDate,
            endDate: project.endDate || "Present",
          }))
        : [];

    case "certifications":
      return Array.isArray(section.data)
        ? section.data.map((cert: any) => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date,
            credentialId: cert.credentialId,
          }))
        : [];

    case "awards":
      return Array.isArray(section.data)
        ? section.data.map((award: any) => ({
            title: award.title,
            issuer: award.issuer,
            date: award.date,
            description: award.description,
          }))
        : [];

    case "interests":
      return Array.isArray(section.data)
        ? section.data.map((interest: any) => ({
            name: interest.name,
            description: interest.description,
          }))
        : [];

    case "professional-summary":
      return [
        {
          summary: section.data.summary,
        },
      ];

    case "personal-info":
      return [
        {
          firstName: section.data.firstName,
          lastName: section.data.lastName,
          email: section.data.email,
          phone: section.data.phone,
          location: section.data.location,
          targetedJobTitle: section.data.targetedJobTitle,
          image: section.data.image,
          linkedin: section.data.linkedin,
          github: section.data.github,
          twitter: section.data.twitter,
          instagram: section.data.instagram,
          website: section.data.website,
        },
      ];

    default:
      return section.data;
  }
}

/**
 * Get section display name
 * Prioritizes custom heading from section data, falls back to default mapping
 */
export function getSectionDisplayName(
  sectionType: string,
  section?: ResumeSection
): string {
  // If section has a custom heading, use it
  if (section?.heading) {
    return section.heading;
  }

  // Fallback to default display names
  const displayNames: { [key: string]: string } = {
    "work-experience": "Work Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    projects: "Projects",
    certifications: "Certifications",
    awards: "Awards",
    interests: "Interests",
    "professional-summary": "Professional Summary",
    "personal-info": "Personal Information",
  };

  return displayNames[sectionType] || sectionType;
}
