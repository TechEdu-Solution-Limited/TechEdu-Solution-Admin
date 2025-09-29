"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, ArrowRight } from "lucide-react";

const templates = [
  {
    id: "two-column",
    name: "Two Column",
    description: "Professional sidebar layout with contact info and skills",
    preview: "/api/placeholder/400/500",
    features: [
      "Sidebar layout",
      "Professional styling",
      "Contact info sidebar",
    ],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with bold colors and modern typography",
    preview: "/api/placeholder/400/500",
    features: ["Dark sidebar", "Bold colors", "Contemporary design"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean single column layout with minimal styling",
    preview: "/api/placeholder/400/500",
    features: ["Single column", "Clean design", "Minimal styling"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout with timeless design",
    preview: "/api/placeholder/400/500",
    features: ["Traditional design", "Serif typography", "Professional"],
  },
];

export default function TemplateSelectionPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("two-column");

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/dashboard/cv-builder/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Resume Builder
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Template
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a template that best represents your professional style. You
            can customize any template to match your unique needs.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-xl ${
                selectedTemplate === template.id
                  ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {/* Preview Image */}
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-t-xl flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.name} Preview
                  </p>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  {selectedTemplate === template.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {template.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedTemplate === template.id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template.id);
                  }}
                >
                  {selectedTemplate === template.id
                    ? "Selected"
                    : "Select Template"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {/* <div className="text-center mt-12">
          <button
            onClick={() => handleTemplateSelect(selectedTemplate)}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Continue with{" "}
            {templates.find((t) => t.id === selectedTemplate)?.name}
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div> */}
      </div>
    </div>
  );
}
