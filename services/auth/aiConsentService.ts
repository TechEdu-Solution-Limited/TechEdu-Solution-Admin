// src/services/auth/aiConsentService.ts

import { getTokenFromCookies } from "@/lib/cookies";

// lib/apiBase.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const apiUrl = (path: string) =>
  /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

async function doFetch<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<T> {
  const token = getTokenFromCookies();
  if (!token) throw new Error("Authentication token not found");

  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      })()
    : null;

  if (!res.ok) {
    const msg = (json as any)?.message ?? `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json as T;
}

export const aiConsentService = {
  /** Idempotent: { success, data: { ok: true } } */
  async acceptProcessing(): Promise<boolean> {
    const json = await doFetch<{ success: boolean; data?: { ok?: boolean } }>(
      "/api/auth/ai/consent/accept",
      "POST",
      {}
    );
    return json?.data?.ok === true;
  },

  /** Optional helpers if you also toggle training in a modal */
  async get(): Promise<{
    aiProcessing?: boolean;
    aiTraining?: boolean;
  } | null> {
    const json = await doFetch<{
      success: boolean;
      data?: { aiProcessing?: boolean; aiTraining?: boolean };
    }>("/api/auth/ai/consent", "GET");
    return json?.data ?? null;
  },

  async setTraining(allow: boolean): Promise<boolean> {
    const json = await doFetch<{
      success: boolean;
      data?: { ok?: boolean; aiTraining?: boolean };
    }>("/api/auth/ai/consent/accept", "POST", { allow });
    return json?.data?.ok === true && json?.data?.aiTraining === allow;
  },
};
