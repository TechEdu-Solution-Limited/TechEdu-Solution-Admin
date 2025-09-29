"use client";

import React from "react";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  AlertTriangle,
} from "lucide-react";

interface StatusBarProps {
  isSaving: boolean;
  lastSaved: Date | null;
  isValid: boolean;
  errors: Record<string, string>;
  onSaveNow: () => void;
  onClearErrors: () => void;
}

export default function StatusBar({
  isSaving,
  lastSaved,
  isValid,
  errors,
  onSaveNow,
  onClearErrors,
}: StatusBarProps) {
  const errorCount = Object.keys(errors).length;
  const hasErrors = errorCount > 0;

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Status indicators */}
        <div className="flex items-center space-x-4">
          {/* Auto-save status */}
          <div className="flex items-center space-x-2">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Saving...
                </span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Saved {formatLastSaved(lastSaved)}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Not saved
                </span>
              </>
            )}
          </div>

          {/* Validation status */}
          <div className="flex items-center space-x-2">
            {hasErrors ? (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {errorCount} error{errorCount !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  All good
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Error details */}
          {hasErrors && (
            <button
              onClick={onClearErrors}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              <span>View Errors</span>
            </button>
          )}

          {/* Manual save button */}
          <button
            onClick={onSaveNow}
            disabled={isSaving}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </button>
        </div>
      </div>

      {/* Error details panel */}
      {hasErrors && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Validation Errors
            </h4>
            <button
              onClick={onClearErrors}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
          <div className="space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <div
                key={field}
                className="text-sm text-red-700 dark:text-red-300"
              >
                <span className="font-medium capitalize">{field}:</span> {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
