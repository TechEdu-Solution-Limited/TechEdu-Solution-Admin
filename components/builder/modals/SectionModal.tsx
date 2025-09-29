"use client";

import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  FileCheck,
  Trophy,
  BookOpen,
  Heart,
  BookOpenCheck,
  Users,
  FileText as Publication,
  UserCheck,
  FileSignature,
  Settings2,
  FileText,
} from "lucide-react";
import { Section } from "@/types";

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  enabledSections: string[];
  activeSection: string;
  onToggleSection: (sectionId: string) => void;
  onNavigateToSection: (sectionId: string) => void;
}

export default function SectionModal({
  isOpen,
  onClose,
  sections,
  enabledSections,
  activeSection,
  onToggleSection,
  onNavigateToSection,
}: SectionModalProps) {
  if (!isOpen) return null;

  const sectionConfigs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      description: "Basic contact information",
    },
    {
      id: "professional-summary",
      label: "Professional Summary",
      icon: FileText,
      description: "Professional summary",
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      description: "Work history and positions",
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      description: "Academic background",
    },
    {
      id: "skills",
      label: "Skills",
      icon: Award,
      description: "Technical and soft skills",
    },
    {
      id: "languages",
      label: "Languages",
      icon: Languages,
      description: "Language proficiencies",
    },
    {
      id: "certifications",
      label: "Certifications",
      icon: FileCheck,
      description: "Professional certifications",
    },
    {
      id: "awards",
      label: "Awards",
      icon: Trophy,
      description: "Achievements and recognition",
    },
    {
      id: "projects",
      label: "Projects",
      icon: BookOpen,
      description: "Personal and professional projects",
    },
    {
      id: "interests",
      label: "Interests",
      icon: Heart,
      description: "Personal interests and hobbies",
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpenCheck,
      description: "MOOCs and additional courses",
    },
    {
      id: "organizations",
      label: "Organizations",
      icon: Users,
      description: "Volunteer work and memberships",
    },
    {
      id: "publications",
      label: "Publications",
      icon: Publication,
      description: "Academic papers and articles",
    },
    {
      id: "references",
      label: "References",
      icon: UserCheck,
      description: "Professional references",
    },
    {
      id: "declarations",
      label: "Declarations",
      icon: FileSignature,
      description: "Legal declarations and signatures",
    },
    {
      id: "custom",
      label: "Custom Sections",
      icon: Settings2,
      description: "Create your own custom sections",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Sections
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Manage your resume sections. Green sections are enabled and appear
            in your sidebar. Click to toggle sections on/off or navigate to
            enabled sections.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionConfigs.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isEnabled = enabledSections.includes(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    if (isEnabled) {
                      onNavigateToSection(section.id);
                    } else {
                      onToggleSection(section.id);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                    isEnabled
                      ? isActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isEnabled
                          ? isActive
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-green-100 dark:bg-green-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isEnabled
                            ? isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold ${
                            isEnabled
                              ? isActive
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-green-900 dark:text-green-100"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {section.label}
                        </h3>
                        {isEnabled && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                            Enabled
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          isEnabled
                            ? isActive
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-green-700 dark:text-green-300"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {section.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
