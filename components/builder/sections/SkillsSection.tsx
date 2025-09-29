"use client";

import { Award, Trash2 } from "lucide-react";
import { Skill } from "@/types";

interface SkillsSectionProps {
  skills: Skill[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Skill, value: string) => void;
}

export default function SkillsSection({
  skills,
  onAdd,
  onRemove,
  onUpdate,
}: SkillsSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Skills
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add Skill</span>
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No skills added yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click &quot;Add Skill&quot; to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => onUpdate(skill.id, "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Skill name"
                />
              </div>
              <div className="w-32">
                <select
                  value={skill.level}
                  onChange={(e) => onUpdate(skill.id, "level", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <button
                onClick={() => onRemove(skill.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
