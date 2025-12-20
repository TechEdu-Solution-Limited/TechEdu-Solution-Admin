"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { X, Crown, CheckCircle, Star, Zap, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: "monthly" | "one-time") => void;
  loading?: boolean;
}

export default function ProAccessModal({
  isOpen,
  onClose,
  onSubscribe,
  loading = false,
}: ProAccessModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "one-time">(
    "monthly"
  );
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

  const features = [
    "Unlimited CV analysis and rating",
    "Advanced ATS optimization",
    "Industry-specific templates",
    "Real-time editing and preview",
    "Export to multiple formats",
    "Priority customer support",
    "Advanced analytics dashboard",
    "Custom branding options",
  ];

  const plans = [
    {
      id: "monthly",
      title: "Monthly Subscription",
      price: "£29.99",
      period: "per month",
      description: "Perfect for ongoing career development",
      features,
      popular: true,
      savings: null,
    },
    {
      id: "one-time",
      title: "One-Time Purchase",
      price: "£299.99",
      period: "one-time payment",
      description: "Lifetime access to all Pro features",
      features,
      popular: false,
      savings: "Save 17% vs monthly",
    },
  ] as const;

  return (
    <>
      <style jsx global>{`
        dialog.pro-access-modal::backdrop {
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
    pro-access-modal
    fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0
    w-[min(92vw,64rem)] max-h-[90vh] overflow-y-auto
    rounded-[10px] border border-gray-200 dark:border-gray-800
    bg-white dark:bg-gray-800 p-0 shadow-2xl
  `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              id={titleId}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Upgrade to Pro Access
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Professional CV Tools
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get access to advanced CV analysis, professional templates, and
              career development tools to land your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-blue-500 border-blue-500"
                    : "hover:shadow-lg"
                } ${plan.popular ? "border-blue-200" : "border-gray-200"}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {plan.title}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-green-100 text-green-800"
                    >
                      {plan.savings}
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gray-50 p-6 rounded-[10px] mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              What's Included in Pro Access
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h5 className="font-medium text-gray-900">
                  Unlimited Analysis
                </h5>
                <p className="text-sm text-gray-600">
                  Analyze as many CVs as you need
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h5 className="font-medium text-gray-900">ATS Optimization</h5>
                <p className="text-sm text-gray-600">
                  Beat applicant tracking systems
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h5 className="font-medium text-gray-900">
                  Professional Templates
                </h5>
                <p className="text-sm text-gray-600">
                  Industry-specific designs
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <h5 className="font-medium text-gray-900">Priority Support</h5>
                <p className="text-sm text-gray-600">
                  Get help when you need it
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={() => onSubscribe(selectedPlan)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing…
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe to Pro Access
                </>
              )}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
