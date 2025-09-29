"use client";

import { X } from "lucide-react";

interface SimplePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: any;
}

export default function SimplePreviewModal({
  isOpen,
  onClose,
  previewData,
}: SimplePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Resume Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex justify-center">
            <div className="transform scale-[0.8] origin-top">
              {previewData}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
