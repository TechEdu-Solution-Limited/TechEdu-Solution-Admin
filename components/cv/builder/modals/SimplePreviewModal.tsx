// components/builder/modals/SimplePreviewModal.tsx
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="max-w-3xl w-full max-h-[100vh] overflow-auto hide-custom-scrollbar">
        {/* Header */}

        {/* Body */}
        <div className="p-6 hide-custom-scrollbar">
          <div className="flex justify-center">
            <div className="transform scale-[1] origin-top">{previewData}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
