// services/cv/cvServiceOptimized.ts

import { getTokenFromCookies } from "@/lib/cookies";

/* ----------------------------------------------------------------------------- */
/* Safe JSON helpers: prune Window/DOM/React objects and break cycles            */
/* ----------------------------------------------------------------------------- */

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
    if (PRUNE_KEYS.has(key)) return undefined;

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

/* ----------------------------------------------------------------------------- */
/* Types                                                                         */
/* ----------------------------------------------------------------------------- */

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

export type ExperienceAIResult = {
  description?: string;
  achievements?: string[];
  seniority?: "junior" | "mid" | "senior" | "lead";
  minYears?: number;
  topSkills?: string[];
  rationale?: string;
};

type ExperienceAIRequest = {
  startDate?: string;
  endDate?: string;
  targetJobTitle?: string;
  targetCompany?: string;
  targetIndustry?: string;
};

export type ExperienceAssessment = {
  seniority: "junior" | "mid" | "senior" | "lead";
  minYears: number;
  description: string;
  achievements: string[];
};

export type SkillItem = {
  name: string;
  score: number; // 0..100
  evidence?: string;
};

export type SkillsAssessment = {
  skills: SkillItem[];
  top: string[];
};

// ---- CV rating result types ----
export type CVRatingResult = {
  ok: boolean;
  reviewId: string;
  rating: {
    overall: number;
    sections: Record<string, number>;
    strengths: string[];
    gaps: string[];
    atsFriendly: boolean;
    keywordCoverage: number;
    seniority: string; // e.g. "junior" | "mid" | "senior" | "lead"
    notes?: string;
    match?: {
      score: number;
      missingSkills?: string[];
      reasons?: string[];
    };
  };
  fileMeta?: {
    bytes?: number;
    mime?: string;
    pages?: number;
    ext?: string;
  };
};

/* ----------------------------------------------------------------------------- */
/* AI NORMALIZERS                                                                */
/* ----------------------------------------------------------------------------- */

function pickBestItem(
  items: any[] = [],
  sel?: { jobTitle?: string; company?: string; preferCurrent?: boolean }
) {
  const jt = (sel?.jobTitle || "").toLowerCase().trim();
  const co = (sel?.company || "").toLowerCase().trim();
  let best = items[0] || null;
  let bestScore = -1;

  for (const it of items) {
    let score = 0;
    const ij = (it?.jobTitle || "").toLowerCase();
    const ic = (it?.company || "").toLowerCase();

    if (jt && ij === jt) score += 3;
    else if (jt && ij.includes(jt)) score += 2;

    if (co && ic === co) score += 2;
    else if (co && ic.includes(co)) score += 1;

    if (sel?.preferCurrent && it?.current) score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = it;
    }
  }
  return best || null;
}

function normalizeExperienceV2(
  raw: any,
  sel?: { jobTitle?: string; company?: string; preferCurrent?: boolean }
): ExperienceAIResult {
  const payload = raw?.data?.data ?? raw?.data ?? raw;

  if (Array.isArray(payload?.items) && payload.items.length) {
    const chosen = pickBestItem(payload.items, sel) || payload.items[0];
    return {
      description: String(chosen?.description || "").trim(),
      achievements: Array.isArray(chosen?.achievements)
        ? chosen.achievements.map((s: any) => String(s).trim()).filter(Boolean)
        : [],
    };
  }

  if (payload?.rationale || payload?.topSkills) {
    return {
      description: String(payload?.rationale ?? "").trim(),
      achievements: Array.isArray(payload?.topSkills)
        ? payload.topSkills.map((s: any) => String(s).trim()).filter(Boolean)
        : [],
      seniority: payload?.seniority,
      minYears: payload?.minYears,
      topSkills: payload?.topSkills,
      rationale: payload?.rationale,
    };
  }
  return {};
}

function normalizeExperienceV3(raw: any): ExperienceAIResult {
  const p = raw?.data ?? raw;
  const w = p?.workExperience ?? p?.data?.workExperience;
  if (w) {
    return {
      description: String(w?.description ?? "").trim(),
      achievements: Array.isArray(w?.achievements)
        ? w.achievements.map((s: any) => String(s).trim()).filter(Boolean)
        : [],
    };
  }
  const items = p?.items ?? p?.data?.items;
  if (Array.isArray(items) && items.length) {
    const chosen = items[0];
    return {
      description: String(chosen?.description ?? "").trim(),
      achievements: Array.isArray(chosen?.achievements)
        ? chosen.achievements.map((s: any) => String(s).trim()).filter(Boolean)
        : [],
    };
  }
  if (p?.rationale || p?.topSkills) {
    return {
      description: String(p?.rationale ?? "").trim(),
      achievements: Array.isArray(p?.topSkills)
        ? p.topSkills.map((s: any) => String(s).trim()).filter(Boolean)
        : [],
      seniority: p?.seniority,
      minYears: p?.minYears,
      topSkills: p?.topSkills,
      rationale: p?.rationale,
    };
  }
  return {};
}

export type AiSummary = { content: string; bullets: string[] };

function normalizeSummary(raw: any): AiSummary {
  if (typeof raw === "string") return { content: raw.trim(), bullets: [] };
  if (!raw || typeof raw !== "object") return { content: "", bullets: [] };

  if (raw.success && raw.data && (raw.data.content || raw.data.bullets)) {
    return {
      content: String(raw.data.content ?? "").trim(),
      bullets: Array.isArray(raw.data.bullets) ? raw.data.bullets : [],
    };
  }
  if (raw.data && raw.data.success && raw.data.data) {
    const d = raw.data.data;
    return {
      content: String(d.content ?? d.summary ?? "").trim(),
      bullets: Array.isArray(d.bullets) ? d.bullets : [],
    };
  }
  if (raw.data && (raw.data.content || raw.data.bullets || raw.data.summary)) {
    return {
      content: String(raw.data.content ?? raw.data.summary ?? "").trim(),
      bullets: Array.isArray(raw.data.bullets) ? raw.data.bullets : [],
    };
  }
  if (raw.content || raw.bullets || raw.summary) {
    return {
      content: String(raw.content ?? raw.summary ?? "").trim(),
      bullets: Array.isArray(raw.bullets) ? raw.bullets : [],
    };
  }
  return { content: "", bullets: [] };
}

function normalizeExperience(raw: any): ExperienceAssessment {
  const d = (raw?.data?.data ?? raw?.data ?? raw) as {
    seniority?: unknown;
    minYears?: unknown;
    topSkills?: unknown;
    description?: unknown;
    achievements?: unknown;
  };

  let seniority = String(d?.seniority ?? "").toLowerCase();
  const valid = new Set<ExperienceAssessment["seniority"]>([
    "junior",
    "mid",
    "senior",
    "lead",
  ]);
  if (!valid.has(seniority as any)) seniority = "mid";

  const minYearsRaw = Number(d?.minYears);
  let minYears = Number.isFinite(minYearsRaw) ? minYearsRaw : 0;
  if (minYears < 0) minYears = 0;

  const topSkillsInput = Array.isArray(d?.topSkills)
    ? (d!.topSkills as unknown[])
    : [];
  const topSkills: string[] = Array.from(
    new Set<string>(
      topSkillsInput
        .map((s) => String(s).trim())
        .filter((s): s is string => s.length > 0)
    )
  );

  const description = String(d?.description ?? "").trim();
  const achievements = Array.isArray(d?.achievements)
    ? (d.achievements as unknown[])
    : [];

  return {
    seniority: seniority as ExperienceAssessment["seniority"],
    minYears,
    description,
    achievements: achievements as ExperienceAssessment["achievements"],
  };
}

function normalizeSkills(raw: any): SkillsAssessment {
  const d = (raw?.data?.data ?? raw?.data ?? raw) as {
    skills?: unknown;
    top?: unknown;
  };
  const incomingSkills = Array.isArray(d?.skills)
    ? (d.skills as unknown[])
    : [];
  const skillsMap = new Map<string, SkillItem>();

  for (const itemAny of incomingSkills) {
    const item = itemAny as Partial<SkillItem> & {
      name?: unknown;
      score?: unknown;
      evidence?: unknown;
    };
    const name = String(item?.name ?? "").trim();
    if (!name) continue;

    let score = Number(item?.score);
    if (!Number.isFinite(score)) score = 0;
    score = Math.max(0, Math.min(100, Math.round(score)));

    const ev = item?.evidence;
    const evidence = ev == null ? undefined : String(ev);

    const prev = skillsMap.get(name);
    if (
      !prev ||
      score > prev.score ||
      (evidence?.length ?? 0) > (prev.evidence?.length ?? 0)
    ) {
      skillsMap.set(name, { name, score, evidence });
    }
  }
  const skills = Array.from(skillsMap.values());

  const topInput = Array.isArray(d?.top) ? (d.top as unknown[]) : [];
  const top: string[] = Array.from(
    new Set<string>(
      topInput
        .map((s) => String(s).trim())
        .filter((s): s is string => s.length > 0)
    )
  );

  return { skills, top };
}

/* ----------------------------------------------------------------------------- */
/* Optimized CV service                                                          */
/* ----------------------------------------------------------------------------- */
// lib/apiBase.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const apiUrl = (path: string) =>
  /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

class OptimizedCVService {
  private async apiRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
    body?: any
  ): Promise<T> {
    const token = getTokenFromCookies();
    if (!token) {
      console.error("❌ Authentication token not found");
      throw new Error("Authentication token not found");
    }

    const url = apiUrl(endpoint);

    console.log(`🚀 API Call: ${method} ${url}`, {
      endpoint,
      hasBody: !!body,
    });

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: body !== undefined ? safeJsonStringify(body) : undefined,
    });

    const raw = await response.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = { message: raw || "Non-JSON response" };
    }

    if (!response.ok) {
      console.error(`❌ API Error ${response.status} for ${url}`, parsed);
      throw new Error(
        parsed?.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return parsed as T;
  }

  // CV CRUD
  async createCV(data: CreateCVRequest): Promise<string> {
    const response = await this.apiRequest<CVResponse>("/api/cv", "POST", data);
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
    const response = await this.apiRequest<CVResponse>(
      `/api/cv/${id}`,
      "PATCH",
      data
    );
    return response.data;
  }

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

  // Drafts
  async getDraft(id: string): Promise<DraftResponse["data"]> {
    const response = await this.apiRequest<DraftResponse>(
      `/api/cv/drafts/${id}`,
      "GET"
    );
    return response.data;
  }

  async getDraftIdForCv(cvId: string): Promise<string | null> {
    try {
      const response = await this.apiRequest<{
        success: boolean;
        data: DraftResponse["data"];
      }>(`/api/cv/drafts/by-cv/${encodeURIComponent(cvId)}`, "GET");
      return response?.data?._id || null;
    } catch (error) {
      console.warn(
        "No existing draft found for cvId or endpoint unavailable:",
        { cvId, error }
      );
      return null;
    }
  }

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

  async createOrUpdateDraft(data: {
    cvId?: string;
    working: any[];
    isDirty?: boolean;
    aiSuggestions?: any;
    template?: string;
    draftId?: string;
  }): Promise<string> {
    if (data.draftId) {
      const { draftId, ...updateData } = data;
      const response = await this.apiRequest<DraftResponse>(
        `/api/cv/drafts/${draftId}`,
        "PATCH",
        updateData
      );
      return response.data._id;
    }
    const response = await this.apiRequest<DraftResponse>(
      "/api/cv/drafts",
      "POST",
      data
    );
    return response.data._id;
  }

  async publishCV(draftId: string): Promise<string> {
    const response = await this.apiRequest<CVResponse>(
      `/api/cv/publish`,
      "POST",
      { draftId }
    );
    return response.data.id;
  }

  /* ------------------------------ AI OPERATIONS ------------------------------ */

  async generateSummary(
    cvId: string,
    tone = "professional and concise"
  ): Promise<AiSummary> {
    const response = await this.apiRequest<any>(
      `/api/cv/ai/summary?cvId=${encodeURIComponent(cvId)}`,
      "POST",
      { tone }
    );
    return normalizeSummary(response);
  }

  /**
   * Robust experience generator: tries known endpoints until one succeeds.
   * Many backends use different route names across versions:
   *  - /api/cv/ai/work-entry-generate   (recommended)
   *  - /api/cv/ai/experience
   *  - /api/cv/ai/work-experience
   */
  async generateExperience(
    cvId: string,
    payload: ExperienceAIRequest
  ): Promise<ExperienceAIResult> {
    if (!cvId) throw new Error("CV must be created first");

    const endpoints = [
      `/api/cv/ai/work-entry-generate?cvId=${encodeURIComponent(cvId)}`,
    ];

    // ✅ build body explicitly so startDate/endDate are always considered
    const body: Record<string, any> = {
      cvId,
      // prefer camelCase; also include snake_case for older handlers
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
      start_date: payload.startDate ?? null,
      end_date: payload.endDate ?? null,
    };

    if (typeof payload.targetJobTitle === "string")
      body.targetJobTitle = payload.targetJobTitle;
    if (typeof payload.targetCompany === "string")
      body.targetCompany = payload.targetCompany;
    if (typeof payload.targetIndustry === "string")
      body.targetIndustry = payload.targetIndustry;

    let lastErr: any = null;

    for (const ep of endpoints) {
      try {
        const res = await this.apiRequest<any>(ep, "POST", body);

        if (res?.data?.ok === false) {
          const reason =
            res?.error?.details?.[0] ||
            res?.data?.reason ||
            res?.message ||
            "AI generation failed";
          throw new Error(reason);
        }

        // Prefer newest normalizer but tolerate older shapes
        const v3 = normalizeExperienceV3(res);
        const hasV3 =
          (v3.description && v3.description.length > 0) ||
          (Array.isArray(v3.achievements) && v3.achievements.length > 0);
        if (hasV3) return v3;

        const v2 = normalizeExperienceV2(res, {
          jobTitle: payload.targetJobTitle,
          company: payload.targetCompany,
          preferCurrent: !payload.endDate,
        });
        if (
          (v2.description && v2.description.length > 0) ||
          (v2.achievements && v2.achievements.length > 0)
        ) {
          return v2;
        }

        // Legacy fallback
        return normalizeExperience(res);
      } catch (e: any) {
        lastErr = e;
        const msg = (e?.message || "").toString().toLowerCase();
        if (
          msg.includes("cannot post") ||
          msg.includes("not found") ||
          msg.includes("404")
        ) {
          continue; // try next variant
        }
        break; // non-404 error → stop trying
      }
    }

    throw new Error(
      lastErr?.message ||
        "AI experience generation failed (no compatible endpoint found). Please ensure your backend route is enabled."
    );
  }

  /** Explicit AI-processing consent; returns true on { success, data: { ok: true } } */
  async acceptAIProcessing() {
    const json = await this.apiRequest<{
      success: boolean;
      data?: { ok?: boolean };
    }>(`/api/auth/ai/consent/accept`, "POST", {});
    return json?.data?.ok === true;
  }

  async generateSkills(
    cvId: string,
    level: "all" | "top-5" = "all",
    prompt?: string,
    context?: { targetRole: string; industry: string | undefined }
  ): Promise<SkillsAssessment> {
    // ✅ include cvId in the body (and snake_case for legacy handlers)
    const body: any = {
      cvId,
      cv_id: cvId,
      level,
    };
    if (prompt) body.prompt = prompt;
    if (context) body.context = context;

    const res = await this.apiRequest<any>(
      // keep query param for existing route variants
      `/api/cv/ai/skills?cvId=${encodeURIComponent(cvId)}`,
      "POST",
      body
    );
    return normalizeSkills(res);
  }


  async generateProjects(
    cvId: string,
    prompt?: string,
    context?: { targetRole: string; emphasize: string[] }
  ): Promise<any> {
    const requestBody: any = {};
    if (prompt) requestBody.prompt = prompt;
    if (context) requestBody.context = context;

    const response = await this.apiRequest(
      `/api/cv/ai/projects?cvId=${encodeURIComponent(cvId)}`,
      "POST",
      requestBody
    );
    return response;
  }

  async getMatchScore(cvId: string, jobDescription: string): Promise<any> {
    const response = await this.apiRequest(
      `/api/cv/ai/match-score?cvId=${encodeURIComponent(cvId)}`,
      "POST",
      {
        jobDescription,
      }
    );
    return response;
  }

  /** Rate a CV directly from a file URL. Returns the plain rating payload. */
  async rateFromUrl(fileUrl: string, redact = false): Promise<CVRatingResult> {
    // POST /api/cv/rate-from-url { url, redact }
    const res = await this.apiRequest<any>("/api/cv/rate-from-url", "POST", {
      url: fileUrl,
      redact,
    });

    // tolerate both plain and wrapped shapes
    const data: any =
      res?.data &&
      (res.success || res?.data?.ok !== undefined || res?.data?.rating)
        ? res.data
        : res;

    if (!data?.ok) {
      const msg =
        data?.message ||
        res?.message ||
        "Rating failed: backend returned an unsuccessful response.";
      throw new Error(msg);
    }
    return data as CVRatingResult;
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

    const payload: CreateCVRequest = {
      title: `${transformedPersonalInfo.fullName} - CV`,
      sections: transformedSections,
      template,
    };

    if (typeof consent !== "undefined") {
      payload.consent = consent;
    }

    return payload;
  }
}

export const cvService = new OptimizedCVService();
export type { CreateCVRequest, CVResponse, CVSection, ConsentSettings };
