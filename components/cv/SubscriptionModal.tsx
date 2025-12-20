"use client";

import React, { useEffect, useId, useRef } from "react";
import { X, Crown, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const features = [
  "AI-powered CV analysis and feedback",
  "Professional CV templates",
  "Real-time editing and preview",
  "Export to multiple formats",
  "Industry-specific suggestions",
  "ATS optimization tips",
];

export default function SubscriptionModal({
  isOpen,
  onClose,
  featureName = "CV Review Tool",
}: SubscriptionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <style jsx global>{`
        dialog.sub-modal::backdrop {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
        }
      `}</style>

      <dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClose={onClose}
        className={`
    sub-modal
    fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0
    w-[min(92vw,44rem)] max-h-[90vh] overflow-y-auto
    rounded-[10px] border border-gray-200 dark:border-gray-800
    bg-white dark:bg-gray-800 p-0 shadow-2xl
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[10px] flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2
                id={titleId}
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Upgrade Required
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Access to {featureName} requires a subscription
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unlock Professional CV Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get access to advanced CV analysis, professional templates, and
              AI-powered suggestions
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What you'll get:
            </h4>
            <div className="grid gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Monthly Plan</CardTitle>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  £29
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• All CV tools included</li>
                  <li>• AI analysis & feedback</li>
                  <li>• Professional templates</li>
                  <li>• Cancel anytime</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 dark:border-blue-400 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Annual Plan</CardTitle>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  £299
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /year
                  </span>
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  Save 14% - Only £24.92/month
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• All CV tools included</li>
                  <li>• AI analysis & feedback</li>
                  <li>• Professional templates</li>
                  <li>• Priority support</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/pricing" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                View All Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Maybe Later
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All plans include a 7-day free trial. No credit card required to
              start.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
