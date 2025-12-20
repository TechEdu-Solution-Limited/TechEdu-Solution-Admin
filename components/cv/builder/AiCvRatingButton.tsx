"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getTokenFromCookies } from "@/lib/cookies";

type RatingResult = {
  score?: number;
  breakdown?: any;
  suggestions?: string[];
  [k: string]: any;
};

export default function AiCvRatingButton({
  cvId,
  summary,
  fallbackFetch = false,
}: {
  cvId: string;
  summary?: string;
  fallbackFetch?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RatingResult | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  async function maybeFetchSummary(): Promise<string> {
    if (summary && summary.trim()) return summary.trim();
    if (!fallbackFetch) return "";
    // Optional: fetch the CV and read its summary (adjust path/shape to your API)
    try {
      const token = getTokenFromCookies();
      const res = await fetch(`${API}/api/cv/${encodeURIComponent(cvId)}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!res.ok) return "";
      const payload = await res.json();
      // Adjust to your server shape:
      // const s = payload?.data?.content?.headline?.summary || payload?.content?.headline?.summary || "";
      const s =
        payload?.data?.content?.headline?.summary ??
        payload?.content?.headline?.summary ??
        "";
      return (s || "").trim();
    } catch {
      return "";
    }
  }

  async function rate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const jobDescription = await maybeFetchSummary();
      if (!cvId) throw new Error("Missing CV ID.");
      if (!jobDescription)
        throw new Error("Your CV has no summary to rate yet.");

      const token = getTokenFromCookies();
      const res = await fetch(`${API}/api/cv/ai/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ cvId, jobDescription }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.message || `Rating failed (status ${res.status}).`
        );
      }

      const payload = await res.json();
      setResult(payload);
      setOpen(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong while rating your CV.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  const disabled = !cvId || (!summary?.trim() && !fallbackFetch);

  return (
    <div className="relative inline-flex">
      <button
        onClick={rate}
        disabled={loading || disabled}
        title={disabled ? "Add a professional summary first." : "Rate CV"}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium"
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Rating…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            AI CV Rating
          </>
        )}
      </button>

      {/* lightweight results popover */}
      {open && (
        <div className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] z-50 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Rating Result
              </h4>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {!error && result && (
              <div className="space-y-3 text-sm">
                {/* Render common fields nicely if present, then raw JSON as fallback */}
                {"score" in result && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Score
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {String(result.score)}
                    </span>
                  </div>
                )}

                {Array.isArray((result as any)?.suggestions) &&
                  (result as any).suggestions.length > 0 && (
                    <div>
                      <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">
                        Suggestions
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        {(result as any).suggestions.map(
                          (s: string, i: number) => (
                            <li key={i}>{s}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Always include raw for debugging / iteration */}
                <details className="rounded-md bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-2">
                  <summary className="cursor-pointer text-gray-700 dark:text-gray-300">
                    Raw response
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
