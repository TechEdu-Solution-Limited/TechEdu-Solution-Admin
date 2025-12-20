"use client";

import { useState, useCallback, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { STORAGE_FOLDERS, uploadFileToFirebase } from "@/lib/firebase";
import { UploadResult } from "firebase/storage";

type TemplateKey = "classic" | "modern" | "minimal" | "elegant";

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (result: UploadResult & { file: File }) => void;
  onUpload?: (file: File) => Promise<void>;
  loading?: boolean;
}

type Phase = "idle" | "uploading" | "ingesting" | "success" | "error";

interface UploadStatus {
  status: Phase;
  message: string;
  progress: number; // only used during "uploading"
}

export default function CVUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  onUpload,
  loading,
}: CVUploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    message: "",
    progress: 0,
  });

  // NEW: request-body controls
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateKey>("classic");
  const [aiSegment, setAiSegment] = useState(true);
  const [createDraft, setCreateDraft] = useState(true);
  const [redact, setRedact] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    []
  );

  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus({
        status: "uploading",
        message: "Uploading your CV...",
        progress: 0,
      });

      // If onUpload is provided, use it (for rating flow)
      if (onUpload) {
        await onUpload(file);
        setUploadStatus({
          status: "success",
          message: "CV uploaded successfully!",
          progress: 100,
        });
        // Don't close automatically - let the parent handle it
        return;
      }

      // Otherwise, use the original ingestion flow
      if (!onUploadSuccess) {
        throw new Error("Either onUpload or onUploadSuccess must be provided");
      }

      // Simulate visible progress while Firebase uploads
      const progressInterval = setInterval(() => {
        setUploadStatus((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      // 1) Upload to Firebase -> returns public download URL string
      const fileUrl = await uploadFileToFirebase(
        file,
        STORAGE_FOLDERS.ATTACHMENTS,
        "cvs"
      );

      clearInterval(progressInterval);

      // Show full upload completion
      setUploadStatus({
        status: "ingesting",
        message: "Processing your CV (AI segmentation)…",
        progress: 100,
      });

      // 2) Ingest via your API with EXACT body you requested
      const res = await fetch("/api/cv/ingest-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fileUrl,
          template: selectedTemplate, // "classic" | "modern" | …
          aiSegment,
          createDraft,
          redact,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Ingestion failed");
      }

      // If you need the response, you can parse it here:
      // const data = await res.json();

      setUploadStatus({
        status: "success",
        message: "CV uploaded and processed successfully!",
        progress: 100,
      });

      // Give the user a brief success moment, then callback + close
      setTimeout(() => {
        // Keep the callback signature intact (drop-in safety).
        // We pass a minimal object and cast to UploadResult to satisfy the type.
        onUploadSuccess({
          // These fields are not used by Firebase's UploadResult in your flow,
          // but we keep the signature by casting.
          ref: {} as any,
          metadata: {} as any,
          state: "success" as any,
          task: {} as any,
          bytesTransferred: 0 as any,
          totalBytes: 0 as any,
          // include original file for convenience
          file,
        } as unknown as UploadResult & { file: File });

        handleClose();
      }, 900);
    } catch (error) {
      setUploadStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed",
        progress: 0,
      });
    }
  };

  const resetUpload = () => {
    setUploadStatus({
      status: "idle",
      message: "",
      progress: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetUpload();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      // role="dialog"
      // aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload Your CV
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-[10px] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Request-body options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template
              </label>
              <select
                title="selectedTemplate"
                value={selectedTemplate}
                onChange={(e) =>
                  setSelectedTemplate(e.target.value as TemplateKey)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-[10px] bg-white dark:bg-gray-800 text-sm"
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={aiSegment}
                  onChange={(e) => setAiSegment(e.target.checked)}
                />
                AI segment content
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={createDraft}
                  onChange={(e) => setCreateDraft(e.target.checked)}
                />
                Create draft
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={redact}
                  onChange={(e) => setRedact(e.target.checked)}
                />
                Redact PII
              </label>
            </div>
          </div>

          {/* Upload Area / Status */}
          {uploadStatus.status === "idle" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[12px] p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Drop your CV here or click to browse
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] font-medium transition-colors"
                >
                  Choose File
                </button>

                <input
                  title="file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {(uploadStatus.status !== "idle" || loading) && (
            <div className="space-y-6">
              {/* Status Icon */}
              <div className="flex justify-center">
                {(uploadStatus.status === "uploading" || loading) && (
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                )}
                {uploadStatus.status === "ingesting" && !loading && (
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                )}
                {uploadStatus.status === "success" && !loading && (
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {uploadStatus.status === "error" && !loading && (
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>

              {/* Status Message + Progress */}
              <div className="text-center">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    uploadStatus.status === "success" && !loading
                      ? "text-green-600 dark:text-green-400"
                      : uploadStatus.status === "error" && !loading
                      ? "text-red-600 dark:text-red-400"
                      : uploadStatus.status === "ingesting" && !loading
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {loading && !uploadStatus.message
                    ? "Processing your CV..."
                    : uploadStatus.message || "Uploading your CV..."}
                </h3>

                {(uploadStatus.status === "uploading" || loading) && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadStatus.progress || 50}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Error actions */}
              {uploadStatus.status === "error" && (
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-[10px] transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-[10px]">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Your CV is securely uploaded</li>
                  <li>• We analyze and extract information from your CV</li>
                  <li>
                    • You’ll edit the extracted data with your chosen template
                  </li>
                  <li>
                    • Uploaded files may be deleted after a retention period
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-[10px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
