"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Sparkles, Download, Eye } from "lucide-react";
import Link from "next/link";
import CVBuilderMain from "@/components/builder/CVBuilderMain";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CVBuilderState } from "@/types/cv-builder";

export default function ResumeBuilder() {
  const [dragActive, setDragActive] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log("File dropped:", e.dataTransfer.files[0]);
      // TODO: Process the uploaded resume and populate the builder
      // Route to template selection page
      router.push(`/dashboard/cv-builder/template-selection`);
    }
  };

  const handleStartFromScratch = () => {
    // Route to template selection page
    router.push(`/dashboard/cv-builder/template-selection`);
  };

  // If user has chosen to start building, show the CVBuilderMain
  if (showBuilder) {
    return (
      <ErrorBoundary>
        <CVBuilderMain
          autoSaveConfig={{
            enabled: true,
            interval: 10000, // 10 seconds
            debounceDelay: 500, // 0.5 seconds
            onSave: async (state: CVBuilderState) => {
              try {
                console.log("Auto-saving state:", state);
                // TODO: Implement secure auto-save to CV and draft endpoints
                console.log("Auto-save successful");
              } catch (error) {
                console.error("Auto-save failed:", error);
                throw error;
              }
            },
          }}
          onStateChange={(state: CVBuilderState) => {
            // Handle state changes if needed
            console.log("State changed:", state);
          }}
          onSave={async (state: CVBuilderState) => {
            try {
              // TODO: Implement secure manual save to CV and draft endpoints
              console.log("Manual save successful:", state);
            } catch (error) {
              console.error("Manual save failed:", error);
              throw error;
            }
          }}
          onLoad={async (id: string) => {
            try {
              console.log("onLoad called with id:", id);
              // TODO: Load from secure CV endpoint
              console.log("No saved state found, using defaults");
              return {};
            } catch (error) {
              console.error("Load failed:", error);
              return {};
            }
          }}
          onExport={async (state: CVBuilderState) => {
            try {
              // Import PDF generation dependencies
              const { pdf } = await import("@react-pdf/renderer");
              const { registerPDFFonts } = await import(
                "@/utils/fontRegistration"
              );
              const DynamicPdfRenderer = (
                await import("@/components/dynamic/DynamicPdfRenderer")
              ).default;

              // Register fonts
              registerPDFFonts();

              // Generate PDF
              const blob = await pdf(
                <DynamicPdfRenderer
                  data={state.resumeData}
                  templateId={state.selectedTemplate}
                  templateConfig={state.templateConfig}
                  leftColumnSections={undefined}
                />
              ).toBlob();

              // Download PDF
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `resume-${state.personalInfo.firstName}-${state.personalInfo.lastName}.pdf`;
              a.style.display = "none";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              console.log("PDF exported successfully");
            } catch (error: any) {
              console.error("PDF export failed:", error);
              alert(`PDF export failed: ${error.message || error}`);
            }
          }}
        />
      </ErrorBoundary>
    );
  }

  // Show the landing page with options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Create Your Perfect
            <span className="text-blue-600 dark:text-blue-400"> Resume</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Build professional resumes from scratch or optimize your existing CV
            with our AI-powered tools. Get past ATS systems and land your dream
            job.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Create New Resume Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Resume
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start from scratch with our intuitive resume builder. Choose
                from professional templates and customize every detail.
              </p>
              <button
                onClick={handleStartFromScratch}
                className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Building
              </button>
            </div>
          </div>

          {/* Upload Resume Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Optimize Existing Resume
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload your current resume and get AI-powered suggestions to
                improve it for better ATS compatibility.
              </p>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Drag and drop your resume here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Supports PDF, DOC, DOCX files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why Choose Our Resume Builder?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ATS Optimized
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our resumes are designed to pass Applicant Tracking Systems and
                reach human recruiters.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Export your resume in PDF, Word, or other formats to suit
                different application requirements.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 dark:bg-pink-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Suggestions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get intelligent recommendations to improve your resume content
                and increase your chances of landing interviews.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
