import { ResumeSection } from "@/types";
import { TemplateLayout } from "@/types/template";

/**
 * Creates a ResumeSection object with proper typing
 */
export const createResumeSection = <T extends ResumeSection["type"]>(
  type: T,
  heading: string,
  data: any,
  condition: boolean = true
): ResumeSection | null => {
  if (!condition) return null;

  return {
    id: type,
    type,
    heading,
    visible: true,
    data,
  } as ResumeSection;
};

/**
 * Maps resume props to ResumeSection array
 */
export const mapResumePropsToSections = (props: {
  personalInfo: any;
  professionalSummary?: any;
  experiences: any[];
  educations: any[];
  skills: any[];
  languages?: any[];
  certifications?: any[];
  awards?: any[];
  projects?: any[];
  interests?: any[];
  courses?: any[];
  organizations?: any[];
  publications?: any[];
  references?: any[];
  declarations?: any[];
  customSections?: any[];
}): ResumeSection[] => {
  const {
    personalInfo,
    professionalSummary,
    experiences,
    educations,
    skills,
    languages = [],
    certifications = [],
    awards = [],
    projects = [],
    interests = [],
    courses = [],
    organizations = [],
    publications = [],
    references = [],
    declarations = [],
    customSections = [],
  } = props;

  // Debug: Log the props to see what we're receiving
  console.log("mapResumePropsToSections props:", props);

  const sections = [
    createResumeSection(
      "personal-info",
      "Personal Information",
      personalInfo,
      true
    ),
    createResumeSection("education", "Education", educations, true),
    createResumeSection(
      "work-experience",
      "Work Experience",
      experiences,
      true
    ),
    createResumeSection("skills", "Skills", skills, true),
    createResumeSection(
      "professional-summary",
      "Professional Summary",
      professionalSummary,
      true
    ),
    createResumeSection(
      "languages",
      "Languages",
      languages,
      languages.length > 0
    ),
    createResumeSection(
      "certifications",
      "Certifications",
      certifications,
      certifications.length > 0
    ),
    createResumeSection("awards", "Awards", awards, awards.length > 0),
    createResumeSection("projects", "Projects", projects, projects.length > 0),
    createResumeSection(
      "interests",
      "Interests",
      interests,
      interests.length > 0
    ),
    createResumeSection("courses", "Courses", courses, courses.length > 0),
    createResumeSection(
      "organizations",
      "Organizations",
      organizations,
      organizations.length > 0
    ),
    createResumeSection(
      "publications",
      "Publications",
      publications,
      publications.length > 0
    ),
    createResumeSection(
      "references",
      "References",
      references,
      references.length > 0
    ),
    createResumeSection(
      "declarations",
      "Declarations",
      declarations,
      declarations.length > 0
    ),
    // Handle custom sections
    ...customSections.map((customSection, index) =>
      createResumeSection(
        "custom",
        customSection.title || `Custom ${index + 1}`,
        customSection,
        customSection.title !== ""
      )
    ),
  ].filter(Boolean) as ResumeSection[];

  // Debug: Log the final result
  console.log("mapResumePropsToSections result:", sections);
  return sections;
};

/**
 * Maps resume props to ResumeSection array with fully dynamic template-aware configuration
 * This version is completely dynamic - no hardcoded section mappings!
 */
export const mapResumePropsToSectionsWithTemplate = async (
  props: {
    personalInfo: any;
    professionalSummary?: any;
    experiences: any[];
    educations: any[];
    skills: any[];
    languages?: any[];
    certifications?: any[];
    awards?: any[];
    projects?: any[];
    interests?: any[];
    courses?: any[];
    organizations?: any[];
    publications?: any[];
    references?: any[];
    declarations?: any[];
    customSections?: any[];
  },
  template?: TemplateLayout | null
): Promise<ResumeSection[]> => {
  const {
    personalInfo,
    professionalSummary,
    experiences,
    educations,
    skills,
    languages = [],
    certifications = [],
    awards = [],
    projects = [],
    interests = [],
    courses = [],
    organizations = [],
    publications = [],
    references = [],
    declarations = [],
    customSections = [],
  } = props;

  // If no template is provided, fall back to the original mapper
  if (!template) {
    return mapResumePropsToSections(props);
  }

  // Dynamically import templateManager to get section configurations
  const { templateManager } = await import("@/lib/templates/templateManager");

  // Get all sections that are enabled in the template
  const enabledSections = new Set<string>();
  template.columns.forEach((column) => {
    column.sections.forEach((sectionType) => {
      enabledSections.add(sectionType);
    });
  });

  // Create sections based on template configuration - FULLY DYNAMIC!
  const sections: ResumeSection[] = [];

  // Get all available section configurations dynamically
  const allSectionConfigs = templateManager.getSectionConfigs();

  // Create a dynamic data mapping based on props structure
  const propsData = {
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
  };

  // Process each enabled section dynamically
  for (const sectionType of enabledSections) {
    if (sectionType === "custom") {
      // Handle custom sections dynamically
      customSections.forEach((customSection, index) => {
        const section = createResumeSection(
          "custom",
          customSection.title || `Custom ${index + 1}`,
          customSection,
          customSection.title !== ""
        );
        if (section) sections.push(section);
      });
    } else {
      // Get section configuration dynamically
      const sectionConfig = templateManager.getSectionConfig(sectionType);

      if (sectionConfig) {
        // Dynamically determine the data and condition based on section config
        const data = getSectionData(sectionType, propsData);
        const condition = getSectionCondition(sectionType, data, sectionConfig);

        // Get custom heading from template or fall back to section config
        const customHeading = template?.sectionHeadings?.[sectionType];
        const heading = customHeading || sectionConfig.displayName;

        const section = createResumeSection(
          sectionType as any,
          heading, // Use custom heading or dynamic display name from config
          data,
          condition
        );

        if (section) sections.push(section);
      }
    }
  }

  console.log("mapResumePropsToSectionsWithTemplate result:", {
    templateId: template.id,
    enabledSections: Array.from(enabledSections),
    sectionsCount: sections.length,
    sections: sections.map((s) => ({ type: s.type, heading: s.heading })),
  });

  return sections;
};

/**
 * Dynamically get section data based on section type and props structure
 * This function uses dynamic property mapping to avoid hardcoding
 */
function getSectionData(sectionType: string, propsData: any): any {
  // Convert section type to camelCase property name dynamically
  // e.g., "personal-info" -> "personalInfo", "work-experience" -> "experiences"

  // Handle special cases first
  const specialMappings: Record<string, string> = {
    "personal-info": "personalInfo",
    "professional-summary": "professionalSummary",
    "work-experience": "experiences",
    education: "educations",
    custom: "customSections",
  };

  if (specialMappings[sectionType]) {
    return propsData[specialMappings[sectionType]];
  }

  // For standard section types, convert kebab-case to camelCase
  // e.g., "languages" -> "languages", "certifications" -> "certifications"
  const camelCaseKey = sectionType.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );

  // Check if the property exists in propsData
  if (propsData.hasOwnProperty(camelCaseKey)) {
    return propsData[camelCaseKey];
  }

  // If not found, return null
  return null;
}

/**
 * Dynamically determine section visibility condition based on section config and data
 */
function getSectionCondition(
  sectionType: string,
  data: any,
  sectionConfig: any
): boolean {
  // If section config has custom condition logic, use it
  if (
    sectionConfig.condition &&
    typeof sectionConfig.condition === "function"
  ) {
    return sectionConfig.condition(data);
  }

  // Default dynamic conditions based on data type
  if (Array.isArray(data)) {
    return data.length > 0;
  }

  if (typeof data === "object" && data !== null) {
    // For objects, check if they have meaningful content
    return Object.values(data).some(
      (value) => value !== null && value !== undefined && value !== ""
    );
  }

  // For primitive values, just check if they exist
  return data !== null && data !== undefined && data !== "";
}
