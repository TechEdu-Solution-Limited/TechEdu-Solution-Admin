import { getTokenFromCookies } from "@/lib/cookies";

/* -----------------------------------------------------------------------------
   Safe JSON helpers: prune Window/DOM/React objects and break cycles
----------------------------------------------------------------------------- */

const PRUNE_KEYS = new Set([
  "window",
  "ownerDocument",
  "defaultView",
  "parentNode",
  "parentElement",
  "nextSibling",
  "previousSibling",
  "children",
  "childNodes",
  "view",
  "_owner",
  "__reactFiber$",
  "__reactInternalInstance",
]);

function isLikelyReactElement(v: any) {
  return !!(v && (v.$$typeof || v._owner || v._store));
}

function isDomLike(v: any) {
  return !!(
    v &&
    typeof v === "object" &&
    ("nodeType" in v || "tagName" in v || "ownerDocument" in v)
  );
}

function isWindowLike(v: any) {
  return !!(v && typeof v === "object" && (v.window === v || v.self === v));
}

function safeJsonStringify(input: any): string {
  const seen = new WeakSet<object>();

  return JSON.stringify(input, function (key, value) {
    // Drop known problematic keys early
    if (PRUNE_KEYS.has(key)) return undefined;

    // Functions / symbols / undefined => drop
    if (
      typeof value === "function" ||
      typeof value === "symbol" ||
      typeof value === "undefined"
    ) {
      return undefined;
    }

    if (value && typeof value === "object") {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);

      if (isWindowLike(value)) return "[Window]";
      if (isDomLike(value)) {
        const name =
          (value as any).nodeName ||
          (value as any).tagName ||
          value.constructor?.name ||
          "DOMNode";
        return `[${name}]`;
      }
      if (isLikelyReactElement(value)) return "[ReactElement]";

      if (value instanceof Date) return value.toISOString();
      if (typeof File !== "undefined" && value instanceof File)
        return `[File:${value.name}]`;
      if (typeof Blob !== "undefined" && value instanceof Blob)
        return `[Blob:${value.size}]`;
      if (value instanceof Map)
        return { __type: "Map", value: Array.from(value.entries()) };
      if (value instanceof Set)
        return { __type: "Set", value: Array.from(value.values()) };
      if (value instanceof URL) return value.toString();
      if (value instanceof RegExp) return value.toString();
    }

    return value;
  });
}

/* -----------------------------------------------------------------------------
   Types
----------------------------------------------------------------------------- */

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
  template?: string;
}

interface CVResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    sections: CVSection[];
    consent: ConsentSettings;
    template?: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

interface DraftResponse {
  success: boolean;
  data: {
    _id: string;
    userId: string;
    cvId: string;
    working: any[];
    isDirty: boolean;
    template?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message?: string;
}

/* -----------------------------------------------------------------------------
   Optimized CV service
----------------------------------------------------------------------------- */

class OptimizedCVService {
  // Generic API request method
  private async apiRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
    body?: any
  ): Promise<T> {
    // Safe JSON stringify function for logging
    const safeStringify = (obj: any) => {
      try {
        return JSON.stringify(
          obj,
          (key, value) => {
            if (value && typeof value === "object") {
              // Handle all HTML elements
              if (
                value.constructor &&
                value.constructor.name.startsWith("HTML")
              ) {
                return `[${value.constructor.name}]`;
              }
              // Handle SVG elements
              if (
                value.constructor &&
                value.constructor.name.startsWith("SVG")
              ) {
                return `[${value.constructor.name}]`;
              }
              // Handle React Fiber nodes
              if (value.__reactFiber$ || value.__reactInternalInstance) {
                return "[ReactElement]";
              }
              // Handle circular references
              if (value.constructor && value.constructor.name === "FiberNode") {
                return "[FiberNode]";
              }
              // Handle any other DOM-like objects
              if (value.nodeType || value.tagName || value.ownerDocument) {
                return "[DOMElement]";
              }
            }
            return value;
          },
          2
        );
      } catch (error) {
        return "[Circular Reference Error]";
      }
    };

    console.log(`🌐 API Request: ${method} ${endpoint}`, {
      hasBody: !!body,
      bodyKeys: body ? Object.keys(body) : [],
      bodyPreview: body ? safeStringify(body).substring(0, 500) + "..." : null,
    });

    const token = getTokenFromCookies();
    if (!token) {
      console.error("❌ Authentication token not found");
      throw new Error("Authentication token not found");
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}${endpoint}`;

    console.log(`🔗 Full URL: ${url}`);
    console.log(`🚀 API Call: ${method} ${url}`);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: body ? safeJsonStringify(body) : undefined,
    });

    console.log(
      `📡 Response status: ${response.status} ${response.statusText}`
    );

    // Safer parsing: tolerate non-JSON error responses
    const raw = await response.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = { message: raw || "Non-JSON response" };
    }

    console.log(`📥 Response data:`, parsed);

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        parsed,
        url: response.url,
        method,
        endpoint,
      });
      throw new Error(
        parsed?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    console.log(`✅ API Success: ${method} ${endpoint}`);
    return parsed as T;
  }

  // CV Operations
  async createCV(data: CreateCVRequest): Promise<string> {
    console.log("🔧 createCV called with:", {
      hasTitle: !!data.title,
      hasSections: !!data.sections,
      sectionsCount: data.sections?.length,
      hasConsent: !!data.consent,
    });

    const response = await this.apiRequest<CVResponse>("/api/cv", "POST", data);

    console.log("✅ New CV created:", response.data.id);
    return response.data.id;
  }

  async getCV(id: string): Promise<CVResponse["data"]> {
    const response = await this.apiRequest<CVResponse>(`/api/cv/${id}`, "GET");
    return response.data;
  }

  async updateCV(
    id: string,
    data: Partial<CreateCVRequest>
  ): Promise<CVResponse["data"]> {
    console.log("🔧 updateCV called with:", {
      id,
      hasTitle: !!data.title,
      hasSections: !!data.sections,
      sectionsCount: data.sections?.length,
    });

    const response = await this.apiRequest<CVResponse>(
      `/api/cv/${id}`,
      "PATCH",
      data
    );

    console.log("✅ CV updated successfully:", response.data.id);
    return response.data;
  }

  // Get all CVs for authenticated user
  async getAllCVs(): Promise<CVResponse["data"][]> {
    const response = await this.apiRequest<{
      success: boolean;
      data: CVResponse["data"][];
    }>("/api/cv", "GET");
    return response.data;
  }

  async deleteCV(id: string): Promise<void> {
    await this.apiRequest(`/api/cv/${id}`, "DELETE");
  }

  // Draft Operations
  async getDraft(id: string): Promise<DraftResponse["data"]> {
    const response = await this.apiRequest<DraftResponse>(
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
    template?: string;
  }): Promise<string> {
    const response = await this.apiRequest<DraftResponse>(
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
    template?: string;
    draftId?: string; // If provided, update existing draft
  }): Promise<string> {
    console.log("🔧 createOrUpdateDraft called with:", {
      cvId: data.cvId,
      draftId: data.draftId,
      hasWorking: data.working?.length,
    });

    if (data.draftId) {
      console.log("🔄 Updating existing draft:", data.draftId);
      // Remove draftId from the request body since it's in the URL
      const { draftId, ...updateData } = data;
      const response = await this.apiRequest<DraftResponse>(
        `/api/cv/drafts/${data.draftId}`,
        "PATCH",
        updateData
      );
      console.log("✅ Draft updated successfully:", response.data._id);
      return response.data._id;
    }

    console.log("🆕 Creating new draft for cvId:", data.cvId);
    const response = await this.apiRequest<DraftResponse>(
      "/api/cv/drafts",
      "POST",
      data
    );
    console.log("✅ New draft created:", response.data._id);
    return response.data._id;
  }

  // Publish CV from draft
  async publishCV(draftId: string): Promise<string> {
    const response = await this.apiRequest<CVResponse>(
      `/api/cv/publish`,
      "POST",
      { draftId }
    );
    return response.data.id;
  }

  // AI Operations
  async generateSummary(
    tone: string = "professional and concise"
  ): Promise<string> {
    const response = await this.apiRequest<{
      success: boolean;
      summary: string;
    }>("/api/cv/ai/summary", "POST", { tone });
    return response.summary;
  }

  async generateExperience(context: {
    targetRole: string;
    industry: string;
  }): Promise<any> {
    const response = await this.apiRequest("/api/cv/ai/experience", "POST", {
      context,
    });
    return response;
  }

  async generateSkills(
    level: "all" | "top-5" = "all",
    prompt?: string,
    context?: { targetRole: string; emphasize: string[] }
  ): Promise<any> {
    const requestBody: any = { level };
    if (prompt) requestBody.prompt = prompt;
    if (context) requestBody.context = context;

    const response = await this.apiRequest(
      "/api/cv/ai/skills",
      "POST",
      requestBody
    );
    return response;
  }

  async generateProjects(
    prompt?: string,
    context?: { targetRole: string; emphasize: string[] }
  ): Promise<any> {
    const requestBody: any = {};
    if (prompt) requestBody.prompt = prompt;
    if (context) requestBody.context = context;

    const response = await this.apiRequest(
      "/api/cv/ai/projects",
      "POST",
      requestBody
    );
    return response;
  }

  async getMatchScore(jobDescription: string): Promise<any> {
    const response = await this.apiRequest("/api/cv/ai/match-score", "POST", {
      jobDescription,
    });
    return response;
  }

  // Helpers
  transformPersonalInfo(personalInfo: any): any {
    const firstName = personalInfo.firstName || "User";
    const lastName = personalInfo.lastName || "Name";
    const fullName = `${firstName} ${lastName}`.trim();

    return { ...personalInfo, fullName };
  }

  createCVData(
    personalInfo: any,
    sections: any[],
    consent?: ConsentSettings,
    template?: string
  ): CreateCVRequest {
    const transformedPersonalInfo = this.transformPersonalInfo(personalInfo);

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
      template: template,
    };
  }
}

// Export singleton instance
export const cvService = new OptimizedCVService();
export type { CreateCVRequest, CVResponse, CVSection, ConsentSettings };
