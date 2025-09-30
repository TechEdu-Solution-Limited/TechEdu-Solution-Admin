import {
  getApiRequest,
  postApiRequest,
  patchApiRequest,
  deleteApiRequest,
} from "@/lib/apiFetch";

import { getTokenFromCookies } from "@/lib/cookies";

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

interface CreateDraftRequest extends CreateCVRequest {
  id?: string;
}

interface CVResponse {
  id: string;
  title: string;
  sections: CVSection[];
  consent: ConsentSettings;
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class CVService {
  private baseUrl = "/api/cv";

  async createCV(data: CreateCVRequest): Promise<CVResponse> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await postApiRequest<CVResponse>(
      this.baseUrl,
      token,
      data
    );
    return response.data;
  }

  async getCVs(page = 1, limit = 10): Promise<PaginatedResponse<CVResponse>> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const endpoint = `${this.baseUrl}?page=${page}&limit=${limit}`;
    const response = await getApiRequest<PaginatedResponse<CVResponse>>(
      endpoint,
      token
    );
    return response.data;
  }

  async createOrUpdateDraft(data: CreateDraftRequest): Promise<CVResponse> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await postApiRequest<CVResponse>(
      `${this.baseUrl}/drafts`,
      token,
      data
    );
    return response.data;
  }

  async getDrafts(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<CVResponse>> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const endpoint = `${this.baseUrl}/drafts?page=${page}&limit=${limit}`;
    const response = await getApiRequest<PaginatedResponse<CVResponse>>(
      endpoint,
      token
    );
    return response.data;
  }

  async getDraft(id: string): Promise<CVResponse> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await getApiRequest<CVResponse>(
      `${this.baseUrl}/drafts/${id}`,
      token
    );
    return response.data;
  }

  async updateDraft(
    id: string,
    data: Omit<CreateDraftRequest, "id">
  ): Promise<CVResponse> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await patchApiRequest<CVResponse>(
      `${this.baseUrl}/drafts/${id}`,
      token,
      data
    );
    return response.data;
  }

  async deleteDraft(id: string): Promise<void> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    await deleteApiRequest(`${this.baseUrl}/drafts/${id}`, token);
  }

  // CV Management endpoints
  async getCV(id: string): Promise<CVResponse> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await getApiRequest<CVResponse>(
      `${this.baseUrl}/${id}`,
      token
    );
    return response.data;
  }

  async updateCV(
    id: string,
    data: Partial<CreateCVRequest>
  ): Promise<CVResponse> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await patchApiRequest<CVResponse>(
      `${this.baseUrl}/${id}`,
      token,
      data
    );
    return response.data;
  }

  async deleteCV(id: string): Promise<void> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    await deleteApiRequest(`${this.baseUrl}/${id}`, token);
  }

  // Section Management endpoints
  async toggleSectionVisibility(
    cvId: string,
    sectionId: string,
    visible: boolean
  ): Promise<{ message: string; section: CVSection }> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await patchApiRequest<{
      message: string;
      section: CVSection;
    }>(`${this.baseUrl}/${cvId}/sections/toggle`, token, {
      sectionId,
      visible,
    });
    return response.data;
  }

  async reorderSections(
    cvId: string,
    sectionIds: string[]
  ): Promise<{ message: string; sections: CVSection[] }> {
    const token = getTokenFromCookies();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await patchApiRequest<{
      message: string;
      sections: CVSection[];
    }>(`${this.baseUrl}/${cvId}/sections/reorder`, token, { sectionIds });
    return response.data;
  }
}

export const cvService = new CVService();
export type {
  CVSection,
  ConsentSettings,
  CreateCVRequest,
  CreateDraftRequest,
  CVResponse,
};
