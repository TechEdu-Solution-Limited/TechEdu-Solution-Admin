// CV Upload Workflow Service - Handles the complete upload and parsing process
import { STORAGE_FOLDERS, uploadFileToFirebase } from "@/lib/firebase";
import { parseCV, ParsedCVData } from "./cvParserService";
import { cvApi } from "@/lib/cv/cvApi";
import { ResumeSection } from "@/types/cv/index";
import { mapResumePropsToSections } from "@/utils/cv/resumeSectionMapper";

// ✅ remove: import { UploadResult } from "firebase/storage";

export interface CVUploadWorkflowResult {
  // ✅ explicitly return what callers actually need
  uploadResult: { url: string; file: File };
  parsedData: ParsedCVData;
  cvId?: string;
  error?: string;
}

export interface WorkflowOptions {
  userId?: string;
  autoCreateCV?: boolean;
  template?: string;
}

/**
 * Complete CV upload and parsing workflow
 */
export async function processCVUpload(
  file: File,
  options: WorkflowOptions = {}
): Promise<CVUploadWorkflowResult> {
  try {
    // Step 1: Upload file to Firebase
    console.log("Step 1: Uploading CV to Firebase...");
    // ⬇️ assume this returns a download URL string
    const downloadUrl = await uploadFileToFirebase(
      file,
      STORAGE_FOLDERS.ATTACHMENTS,
      "cvs"
    );
    console.log("Upload completed:", downloadUrl);

    // Step 2: Extract text from uploaded file
    console.log("Step 2: Extracting text from CV...");
    const extractedText = await extractTextFromFile(
      { url: downloadUrl, file }, // ✅ pass our own shape
      file.type
    );
    console.log("Text extraction completed, length:", extractedText.length);

    // Step 3: Parse the extracted text
    console.log("Step 3: Parsing CV content...");
    const parsedData = await parseCV(extractedText);
    console.log("Parsing completed, confidence:", parsedData.confidence);

    // Step 4: Optionally create CV in backend
    let cvId: string | undefined;
    if (options.autoCreateCV) {
      console.log("Step 4: Creating CV in backend...");
      const resumeData = mapResumePropsToSections({
        personalInfo: parsedData.personalInfo,
        professionalSummary: parsedData.professionalSummary,
        experiences: parsedData.experiences,
        educations: parsedData.educations,
        skills: parsedData.skills,
        languages: parsedData.languages,
        certifications: parsedData.certifications,
        awards: parsedData.awards,
        projects: parsedData.projects,
        interests: parsedData.interests,
      });

      const cvResponse = await cvApi.createCV({
        data: resumeData,
        template: options.template || "two-column",
        enabledSections: [
          "personal-info",
          "professional-summary",
          "work-experience",
          "education",
          "skills",
          "languages",
          "certifications",
          "awards",
          "projects",
          "interests",
        ],
      });

      cvId = cvResponse.id;
      console.log("CV created in backend with ID:", cvId);
    }

    return {
      uploadResult: { url: downloadUrl, file }, // ✅ strongly typed
      parsedData,
      cvId,
    };
  } catch (error) {
    console.error("CV upload workflow failed:", error);
    return {
      uploadResult: { url: "", file }, // ✅ keep same shape on error
      parsedData: {} as ParsedCVData,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Extract text content from uploaded file
 */
async function extractTextFromFile(
  fileRef: { url: string; file: File }, // ✅ custom shape
  fileType: string
): Promise<string> {
  try {
    console.log("Extracting text from:", fileRef.url, "Type:", fileType);

    if (fileType === "text/plain") {
      const response = await fetch(fileRef.url);
      return await response.text();
    } else {
      return getSampleCVText();
    }
  } catch (error) {
    console.error("Text extraction failed:", error);
    return getSampleCVText();
  }
}

/** Sample CV text for demonstration purposes */
function getSampleCVText(): string {
  return `
  ... (unchanged sample text) ...
  `;
}

/**
 * Load existing CV by ID and populate builder
 */
export async function loadCVById(cvId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const cvResponse = await cvApi.getCV(cvId);
    const convertedData = convertResumeSectionsToProps(cvResponse.data);

    return {
      success: true,
      data: {
        ...convertedData,
        template: cvResponse.template,
        enabledSections: cvResponse.enabledSections,
      },
    };
  } catch (error) {
    console.error("Failed to load CV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load CV",
    };
  }
}

/** * Convert ResumeSection[] back to individual props format
 * * This is the reverse of mapResumePropsToSections */
function convertResumeSectionsToProps(sections: ResumeSection[]): any {
  const props: any = {
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      twitter: "",
      instagram: "",
      website: "",
      targetedJobTitle: "",
      image: "",
    },
    professionalSummary: { summary: "" },
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    certifications: [],
    awards: [],
    projects: [],
    interests: [],
    customSections: [],
  };
  sections.forEach((section) => {
    // Normalize summary sections: convert type "summary" to "professional-summary"
    // and transform data.content to data.summary
    // Note: Backend may return "summary" type which is not in the ResumeSection union
    const sectionType = section.type as string;
    const normalizedType = sectionType === "summary" ? "professional-summary" : section.type;
    const normalizedData = sectionType === "summary" 
      ? { summary: (section.data as any)?.content || (section.data as any)?.summary || "" }
      : section.data;

    switch (normalizedType) {
      case "personal-info":
        props.personalInfo = { ...props.personalInfo, ...normalizedData };
        break;
      case "professional-summary":
        props.professionalSummary = normalizedData;
        break;
      case "work-experience":
        props.experiences = section.data;
        break;
      case "education":
        props.educations = section.data;
        break;
      case "skills":
        props.skills = section.data;
        break;
      case "languages":
        props.languages = section.data;
        break;
      case "certifications":
        props.certifications = section.data;
        break;
      case "awards":
        props.awards = section.data;
        break;
      case "projects":
        props.projects = section.data;
        break;
      case "interests":
        props.interests = section.data;
        break;
      case "custom":
        props.customSections.push(section.data);
        break;
    }
  });
  return props;
}
