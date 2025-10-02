import { getTokenFromCookies } from "@/lib/cookies";

// Types
interface CVSection {
  id?: string;
  type: string;
  heading?: string;
  visible?: boolean;
  data?: Record<string, any>;
}

interface ConsentSettings {
  aiProcessing?: boolean;
  aiTraining?: boolean;
}

interface CreateCVRequest {
  title?: string;
  sections: CVSection[];
  consent?: ConsentSettings;
}

interface CVResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    sections: CVSection[];
    consent: ConsentSettings;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

// Single optimized CV service
class OptimizedCVService {
  // Generic API request method
  private async apiRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
    body?: any
  ): Promise<T> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}${endpoint}`;
    console.log(`🚀 API Call: ${method} ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  }

  // CV Operations
  async createCV(data: CreateCVRequest): Promise<string> {
    const response = await this.apiRequest<CVResponse>("/api/cv", "POST", data);
    return response.data._id;
  }

  async getCV(id: string): Promise<CVResponse["data"]> {
    const response = await this.apiRequest<CVResponse>(`/api/cv/${id}`, "GET");
    return response.data;
  }

  async updateCV(
    id: string,
    data: Partial<CreateCVRequest>
  ): Promise<CVResponse["data"]> {
    const response = await this.apiRequest<CVResponse>(
      `/api/cv/${id}`,
      "PATCH",
      data
    );
    return response.data;
  }

  async deleteCV(id: string): Promise<void> {
    await this.apiRequest(`/api/cv/${id}`, "DELETE");
  }

  // Draft Operations

  async getDraft(id: string): Promise<CVResponse["data"]> {
    const response = await this.apiRequest<CVResponse>(
      `/api/cv/drafts/${id}`,
      "GET"
    );
    return response.data;
  }

  // Create draft with working data (template draft or with cvId)
  async createDraft(data: {
    cvId?: string;
    working: any[];
    isDirty?: boolean;
    aiSuggestions?: any;
  }): Promise<string> {
    const response = await this.apiRequest<CVResponse>(
      "/api/cv/drafts",
      "POST",
      data
    );
    return response.data._id;
  }

  // Create or update draft - prevents multiple drafts
  async createOrUpdateDraft(data: {
    cvId?: string;
    working: any[];
    isDirty?: boolean;
    aiSuggestions?: any;
    draftId?: string; // If provided, update existing draft
  }): Promise<string> {
    // If we have a draftId, update existing draft
    if (data.draftId) {
      const response = await this.apiRequest<CVResponse>(
        `/api/cv/drafts/${data.draftId}`,
        "PATCH",
        data
      );
      return response.data._id;
    }

    // Otherwise, create new draft
    const response = await this.apiRequest<CVResponse>(
      "/api/cv/drafts",
      "POST",
      data
    );
    return response.data._id;
  }

  // Publish CV from draft
  async publishCV(draftId: string): Promise<string> {
    const response = await this.apiRequest<CVResponse>(
      `/api/cv/publish`,
      "POST",
      { draftId }
    );
    return response.data._id;
  }

  // AI Operations
  async generateSummary(
    cvId: string,
    tone: string = "professional and concise"
  ): Promise<string> {
    const response = await this.apiRequest<{
      success: boolean;
      summary: string;
    }>("/api/cv/ai/summary", "POST", { cvId, tone });
    return response.summary;
  }

  async generateExperience(
    cvId: string,
    jobTitle: string,
    company: string,
    industry?: string
  ): Promise<any> {
    const response = await this.apiRequest("/api/cv/ai/experience", "POST", {
      cvId,
      jobTitle,
      company,
      industry,
    });
    return response;
  }

  // Helper method to transform personal info for API
  transformPersonalInfo(personalInfo: any): any {
    const firstName = personalInfo.firstName || "User";
    const lastName = personalInfo.lastName || "Name";
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      ...personalInfo,
      fullName,
    };
  }

  // Helper method to create CV data
  createCVData(
    personalInfo: any,
    sections: any[],
    consent?: ConsentSettings
  ): CreateCVRequest {
    const transformedPersonalInfo = this.transformPersonalInfo(personalInfo);

    // Transform sections to include fullName in personal info
    const transformedSections = sections.map((section) => {
      if (section.type === "personal-info" && section.data) {
        return {
          ...section,
          data: {
            ...section.data,
            fullName: transformedPersonalInfo.fullName,
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
          },
        };
      }
      return section;
    });

    return {
      title: `${transformedPersonalInfo.fullName} - CV`,
      sections: transformedSections,
      consent: consent || { aiProcessing: false, aiTraining: false },
    };
  }
}

// Export singleton instance
export const cvService = new OptimizedCVService();
export type { CreateCVRequest, CVResponse, CVSection, ConsentSettings };
