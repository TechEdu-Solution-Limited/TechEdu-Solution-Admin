// components/cv/builder/modals/AIConsentModal.tsx
"use client";

import { useState } from "react";
import { X, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (consent?: { aiTraining: boolean }) => void; // only aiTraining
}

export default function AIConsentModal({
  isOpen,
  onClose,
  onAccept,
}: AIConsentModalProps) {
  const [aiTraining, setAiTraining] = useState(false);
  if (!isOpen) return null;

  const handleAccept = () => {
    onAccept({ aiTraining: true });
    onClose();
  };

  const handleDecline = () => {
    onAccept({ aiTraining: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-[10px] shadow-xl max-w-2xl w-full max-height-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Training Consent
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[10px] p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Help improve AI suggestions
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Opt in to allow anonymized CV data to be used for improving
                    AI models. You can change this at any time in settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[10px] p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiTraining}
                  onChange={(e) => setAiTraining(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded-[4px]"
                />
                <div className="flex-1">
                  <div className="font-medium text-green-900 dark:text-green-100 mb-2">
                    AI Training Consent
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                    “I agree to allow my anonymized CV data to be used for
                    training to improve AI suggestions.”
                  </p>
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✓ Yes, I allow anonymized training.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Decline & Continue</span>
            </Button>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!aiTraining}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                title={
                  !aiTraining
                    ? "Please check AI Training to continue"
                    : undefined
                }
              >
                <CheckCircle className="h-4 w-4" />
                <span>Accept & Continue</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
