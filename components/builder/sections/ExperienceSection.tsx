"use client";

import { Briefcase } from "lucide-react";
import { Experience } from "@/types";
import AccordionSection from "./AccordionSection";
import RichTextEditor from "./RichTextEditor";

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    field: keyof Experience,
    value: string | boolean
  ) => void;
}

export default function ExperienceSection({
  experiences,
  onAdd,
  onRemove,
  onUpdate,
}: ExperienceSectionProps) {
  const getExperienceTitle = (exp: Experience) => {
    if (exp.position && exp.company) {
      return `${exp.position} at ${exp.company}`;
    }
    return exp.position || exp.company || "";
  };

  return (
    <AccordionSection
      title="Work Experience"
      items={experiences}
      emptyStateIcon={Briefcase}
      emptyStateTitle="No work experience added yet"
      emptyStateDescription='Click "Add Experience" to get started'
      addButtonText="Add Experience"
      onAdd={onAdd}
      onRemove={onRemove}
      getItemTitle={getExperienceTitle}
    >
      {(exp: Experience) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => onUpdate(exp.id, "company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => onUpdate(exp.id, "position", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Job title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={exp.location || ""}
                onChange={(e) => onUpdate(exp.id, "location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => onUpdate(exp.id, "startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="month"
                value={exp.endDate || ""}
                onChange={(e) => onUpdate(exp.id, "endDate", e.target.value)}
                disabled={exp.current}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) => onUpdate(exp.id, "current", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Currently working here
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <RichTextEditor
              value={exp.description || ""}
              onChange={(value) => onUpdate(exp.id, "description", value)}
              placeholder="Describe your key responsibilities and achievements..."
            />
          </div>
        </>
      )}
    </AccordionSection>
  );
}
