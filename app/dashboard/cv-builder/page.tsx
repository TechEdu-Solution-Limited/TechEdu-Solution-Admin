// app/dashboard/cv-builder/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Sparkles, Download, Eye, Star } from "lucide-react";
import Link from "next/link";
import CVBuilderMain from "@/components/cv/builder/CVBuilderMain";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CVBuilderState } from "@/types/cv/cv-builder";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { STORAGE_FOLDERS } from "@/lib/firebase";
import safeConsole from "@/lib/console";
import TemplateSelectorModal from "@/components/cv/TemplateSelectorModal";
import { getTokenFromCookies } from "@/lib/cookies";
import { cvService } from "@/services/cv/cvServiceOptimized";
import type { CVRatingResult } from "@/services/cv/cvServiceOptimized";
import RatingModal from "@/components/cv/builder/modals/CVReatingModal";
// Remove the import since we'll use the existing one
import CVUploadModal from "@/components/cv/CVUploadModal";
import AIConsentModal from "@/components/cv/builder/modals/AIConsentModal";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "react-toastify";

// ---- Config ----
type UploadStatus = "idle" | "uploading" | "success" | "error";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function hasAllowedExtension(name: string) {
  return /\.(pdf|doc|docx)$/i.test(name || "");
}

function validateFile(file: File) {
  const mimeOk = file.type
    ? ALLOWED_MIME.has(file.type)
    : hasAllowedExtension(file.name);
  if (!mimeOk)
    throw new Error("Please upload a PDF or Word file (.pdf, .doc, .docx).");
  if (file.size > MAX_BYTES)
    throw new Error("File too large (max 10MB). Please compress or trim it.");
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export default function ResumeBuilder() {
  const [dragActive, setDragActive] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [templateOpen, setTemplateOpen] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const pendingFileRef = useRef<File | null>(null);

  const [localProgress, setLocalProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Rating flow state
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingData, setRatingData] = useState<CVRatingResult | null>(null);
  const [redactForRating, setRedactForRating] = useState(false);

  // New CV rating modals
  const [showCVUploadModal, setShowCVUploadModal] = useState(false);
  const [showCVRatingModal, setShowCVRatingModal] = useState(false);
  const [cvRatingLoading, setCvRatingLoading] = useState(false);
  const [cvRatingResult, setCvRatingResult] = useState<CVRatingResult | null>(null);

  // AI Consent modal state
  const [showAIConsentModal, setShowAIConsentModal] = useState(false);
  const [aiConsent, setAiConsent] = useState<{ aiTraining: boolean } | null>(null);

  // Role and authentication
  const { isAuthenticated, userData } = useRole();

  // Accept enhanced or basic storage hook
  const storage = useFirebaseStorage();

  const {
    uploadFile,
    loading: uploading, // boolean (legacy)
    progress: hookProgress, // optional numeric 0..100
  } = storage;

  // Wrapper for uploadFile with progress callback
  const uploadFileWithProgress = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const result = await uploadFile(
      file,
      STORAGE_FOLDERS.ATTACHMENTS,
      "cv-uploads",
      onProgress
    );
    return result.url;
  };

  const effectiveProgress =
    typeof hookProgress === "number" ? hookProgress : localProgress;

  const requestOverride = (file: File) => {
    pendingFileRef.current = file;
    setOverrideOpen(true);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  // Centralized intake: validates, enforces single CV, prompts override if needed
  async function handleIncomingFile(file: File) {
    if (uploadStatus === "uploading") {
      setUploadError(
        "An upload is already in progress. Please wait for it to finish."
      );
      setUploadStatus("error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      validateFile(file);
    } catch (err: any) {
      setUploadError(err?.message || "Invalid file.");
      setUploadStatus("error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (uploadedFile && uploadStatus === "success") {
      requestOverride(file);
      return;
    }

    await handleFilePicked(file);
  }

  const handleFilePicked = async (file: File) => {
    setUploadError(null);
    try {
      setUploadStatus("uploading");
      setLocalProgress(0);

      let url: string;
      if (typeof uploadFileWithProgress === "function") {
        url = await uploadFileWithProgress(file, (p: number) =>
          setLocalProgress(p)
        );
      } else {
        const result = await uploadFile(
          file,
          STORAGE_FOLDERS.ATTACHMENTS,
          "cv-uploads",
          (p: number) => setLocalProgress(p)
        );
        url = result.url;
        setLocalProgress(100);
      }

      safeConsole.log("✅ Uploaded file URL:", url);
      setUploadedFile({ name: file.name, url, size: file.size });
      setUploadStatus("success");
    } catch (e: any) {
      safeConsole.error("❌ Upload failed:", e);
      setUploadError(e?.message || "Upload failed. Please try again.");
      setUploadStatus("error");
    } finally {
      setDragActive(false);
      if (inputRef.current) inputRef.current.value = ""; // allow reselecting same file later
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 1) {
      setUploadError("You can only upload one CV at a time.");
      setUploadStatus("error");
      return;
    }

    const file = dt.files?.[0];
    if (file) void handleIncomingFile(file);
  };

  const handleStartFromScratch = () => {
    router.push(`/dashboard/cv-builder/template-selection`);
  };

  async function ingestCvFromUrl(fileUrl: string, templateId: string, consent?: { aiTraining: boolean }) {
    const token = getTokenFromCookies();
    setIngesting(true);

    try {
      const res = await fetch(`${API_BASE}/api/cv/ingest-from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          url: fileUrl,
          template: templateId,
          aiSegment: true,
          createDraft: true,
          redact: false,
          aiTraining: consent?.aiTraining ?? false,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.message || `Failed to ingest CV (status ${res.status}).`
        );
      }

      const payload = await res.json();
      // Supports both:
      // { success, data: { cvId, ... } }  and  { cvId, ... }
      const cvId: string | undefined = payload?.data?.cvId ?? payload?.cvId;

      if (!cvId) {
        throw new Error(
          "Ingestion succeeded but cvId is missing in the response."
        );
      }

      // Navigate to the dynamic template builder with the CV data and correct template
      router.push(
        `/dashboard/cv-builder/${templateId}?cvId=${encodeURIComponent(
          cvId
        )}&mode=view`
      );
    } catch (e: any) {
      setUploadError(e?.message || "Ingestion failed. Please try again.");
      setUploadStatus("error");
    } finally {
      setIngesting(false);
    }
  }

  async function rateCurrentUpload() {
    if (!uploadedFile?.url) return;
    setRatingBusy(true);
    setRatingError(null);
    try {
      const data = await cvService.rateFromUrl(
        uploadedFile.url,
        redactForRating
      );
      setRatingData(data);
      setRatingOpen(true);
    } catch (e: any) {
      setRatingError(e?.message || "Rating failed. Please try again.");
    } finally {
      setRatingBusy(false);
    }
  }

  // New CV rating functions
  const handleFreeCVRating = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to use the CV rating feature");
      return;
    }
    setShowCVUploadModal(true);
  };

  const handleCVUpload = async (file: File) => {
    setCvRatingLoading(true);
    try {
      // Upload file to Firebase storage first
      const result = await uploadFile(
        file,
        STORAGE_FOLDERS.ATTACHMENTS,
        "cv-uploads"
      );
      const downloadURL = result.url;
      
      // Rate the CV using the existing service
      const ratingResult = await cvService.rateFromUrl(downloadURL, false);
      setCvRatingResult(ratingResult);
      setShowCVUploadModal(false);
      setShowCVRatingModal(true);
    } catch (error: any) {
      safeConsole.error("CV rating failed:", error);
      toast.error(error?.message || "Failed to analyze CV");
    } finally {
      setCvRatingLoading(false);
    }
  };

  // If user has chosen to start building, show the CVBuilderMain (kept for parity)
  if (showBuilder) {
    return (
      <ErrorBoundary>
        <CVBuilderMain
          autoSaveConfig={{
            enabled: false,
            interval: 20000,
            debounceDelay: 500,
            onSave: async (state: CVBuilderState) => {
              try {
                safeConsole.log("Auto-saving state:", state);
              } catch (error) {
                safeConsole.error("Auto-save failed:", error);
                throw error;
              }
            },
          }}
          onStateChange={(state: CVBuilderState) =>
            safeConsole.log("State changed:", state)
          }
          onSave={async (state: CVBuilderState) =>
            safeConsole.log("Manual save successful:", state)
          }
          onLoad={async () => {
            safeConsole.log("No saved state found, using defaults");
            return {};
          }}
          onExport={async (state: CVBuilderState) =>
            safeConsole.log("Exporting CV:", state)
          }
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Create Your Professional CV
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Build a stunning resume that gets you noticed by employers. Choose
            from our professional templates and create your CV in minutes.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dropzone */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === " ") &&
                  (uploadStatus === "idle" || uploadStatus === "error")
                ) {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onClick={() => {
                if (uploadStatus === "idle" || uploadStatus === "error") {
                  inputRef.current?.click();
                }
              }}
              className={`border-2 border-dashed rounded-[10px] p-12 text-center mb-8 transition-colors ${
                uploadStatus === "uploading"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-default"
                  : uploadStatus === "success"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 cursor-default"
                  : uploadStatus === "error"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 cursor-pointer"
                  : dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadStatus === "uploading" ? (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Uploading CV...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Please wait while we upload your file
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{
                        width: `${effectiveProgress || (uploading ? 100 : 0)}%`,
                      }}
                    />
                  </div>
                </>
              ) : uploadStatus === "success" && uploadedFile ? (
                <>
                  <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
                    CV Uploaded Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    <strong>{uploadedFile.name}</strong> (
                    {formatFileSize(uploadedFile.size)})
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Your CV has been uploaded and is ready for processing.
                  </p>

                  {/* Actions after upload */}
                  <div className="flex flex-col gap-3 justify-center">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setUploadStatus("idle");
                          setLocalProgress(0);
                          if (inputRef.current) inputRef.current.value = "";
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-[10px] hover:bg-gray-700 transition-colors"
                      >
                        Upload Another
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!uploadedFile?.url) return;
                          // Show AI consent modal first
                          setShowAIConsentModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-[10px] hover:bg-green-700 transition-colors"
                      >
                        Continue to Template Selection
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void rateCurrentUpload();
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-[10px] hover:bg-purple-700 transition-colors disabled:opacity-50"
                        disabled={ratingBusy}
                        title="Get an AI rating and feedback for this CV"
                      >
                        {ratingBusy ? "Rating..." : "Rate My CV"}
                      </button>
                    </div>

                    <label className="flex items-center gap-2 justify-center text-sm text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={redactForRating}
                        onChange={(e) => setRedactForRating(e.target.checked)}
                        className="accent-purple-600"
                      />
                      Redact personal info before analysis
                    </label>

                    {/* Free CV Rating Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleFreeCVRating}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-[10px] hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        title="Get a free CV analysis without uploading to your account"
                      >
                        <Star className="w-4 h-4" />
                        Rate CV for Free
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Get instant analysis without saving to your account
                      </p>
                    </div>

                    {ratingError && (
                      <p className="text-center text-sm text-red-600">
                        {ratingError}
                      </p>
                    )}
                  </div>
                </>
              ) : uploadStatus === "error" ? (
                <>
                  <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {uploadError || "Something went wrong. Please try again."}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadStatus("idle");
                      setUploadError(null);
                      setLocalProgress(0);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-[10px] hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Upload Your Existing CV
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Drag and drop your PDF/Word file here, or click to browse
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors"
                  >
                    Browse Files
                  </button>
                </>
              )}

              <input
                ref={inputRef}
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                multiple={false}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleIncomingFile(file);
                }}
              />
            </div>

            {/* Start from Scratch */}
            <div className="bg-white dark:bg-gray-800 rounded-[10px] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start from Scratch
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Create a new CV using our professional templates
                </p>
                <button
                  onClick={handleStartFromScratch}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors"
                >
                  Choose Template
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Eye className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Live Preview
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See your CV as you build it with real-time preview
              </p>
            </div>
            <div className="text-center">
              <Download className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Formats
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Export your CV in PDF
              </p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI Suggestions
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get AI-powered suggestions to improve your CV
              </p>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center mt-8">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* AI Consent Modal */}
      <AIConsentModal
        isOpen={showAIConsentModal}
        onClose={() => setShowAIConsentModal(false)}
        onAccept={(consent) => {
          setAiConsent(consent || { aiTraining: false });
          setShowAIConsentModal(false);
          // Open template selector after consent
          setTemplateOpen(true);
        }}
      />

      {/* Template Modal */}
      <TemplateSelectorModal
        isOpen={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onTemplateSelect={async (templateId: string) => {
          if (!uploadedFile?.url) return;
          await ingestCvFromUrl(uploadedFile.url, templateId, aiConsent || undefined);
        }}
      />

      {/* Override Confirmation */}
      {overrideOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Replace existing CV?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              You’ve already uploaded a CV. Uploading another will override the
              current one.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  pendingFileRef.current = null;
                  setOverrideOpen(false);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="px-4 py-2 rounded-[10px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const file = pendingFileRef.current;
                  pendingFileRef.current = null;
                  setOverrideOpen(false);

                  // reset state before replacing
                  setUploadedFile(null);
                  setUploadError(null);
                  setUploadStatus("idle");
                  setLocalProgress(0);
                  if (inputRef.current) inputRef.current.value = "";

                  if (file) await handleFilePicked(file);
                }}
                className="px-4 py-2 rounded-[10px] bg-blue-600 text-white hover:bg-blue-700"
              >
                Replace CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingesting overlay */}
      {ingesting && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Preparing your editable draft…
            </p>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        open={ratingOpen && !!ratingData}
        data={ratingData}
        onClose={() => setRatingOpen(false)}
        onStartEditing={() => {
          setRatingOpen(false);
          setTemplateOpen(true);
        }}
      />

      {/* Rating overlay */}
      {ratingBusy && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Analyzing your CV…
            </p>
          </div>
        </div>
      )}

      {/* CV Upload Modal for Free Rating */}
      <CVUploadModal
        isOpen={showCVUploadModal}
        onClose={() => setShowCVUploadModal(false)}
        onUpload={handleCVUpload}
        loading={cvRatingLoading}
      />

      {/* CV Rating Results Modal */}
      <RatingModal
        open={showCVRatingModal}
        data={cvRatingResult}
        onClose={() => setShowCVRatingModal(false)}
        onStartEditing={() => {
          setShowCVRatingModal(false);
          // User can continue to use CV builder as they have access
        }}
      />
    </div>
  );
}
