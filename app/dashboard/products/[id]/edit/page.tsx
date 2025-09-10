"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiRequest, updateApiRequest } from "@/lib/apiFetch";
import { getTokenFromCookies } from "@/lib/cookies";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  uploadAssetImage,
  uploadMaterial,
  deleteFileFromFirebase,
} from "@/lib/firebase";
import { Product } from "@/types/products";

const PRODUCT_TYPE_OPTIONS = [
  "Training & Certification",
  "Academic Support Services",
  "Career Development & Mentorship",
  "Institutional & Team Services",
  "AI-Powered or Automation Services",
  "Career Connect",
  "Marketing, Consultation & Free Services",
];

const DELIVERY_MODE_OPTIONS = ["online", "physical", "hybrid"];
const SESSION_TYPE_OPTIONS = ["1-on-1", "group"];
const MODE_OPTIONS = ["weeks", "days", "hours"];
const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD - US Dollar" },
  { value: "eur", label: "EUR - Euro" },
  { value: "gbp", label: "GBP - British Pound" },
  { value: "cad", label: "CAD - Canadian Dollar" },
  { value: "aud", label: "AUD - Australian Dollar" },
  { value: "jpy", label: "JPY - Japanese Yen" },
  { value: "inr", label: "INR - Indian Rupee" },
  { value: "ngn", label: "NGN - Nigerian Naira" },
];

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [instructors, setInstructors] = useState<any[]>([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const token = getTokenFromCookies();
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const [productResponse, instructorsResponse] = await Promise.all([
          getApiRequest(`/api/products/public/${params.id}`, token),
          getApiRequest("/api/users/admin/instructors", token),
        ]);

        // console.log("Instructor Data", instructorsResponse);

        if (productResponse?.data?.success) {
          const product = productResponse.data.data;
          setForm({
            productType: product.productType,
            service: product.service,
            deliveryMode: product.deliveryMode,
            sessionType: product.sessionType,
            isRecurring: product.isRecurring,
            programLength: product.programLength,
            mode: product.mode,
            durationInMinutes: product.durationInMinutes,
            minutesPerSession: product.minutesPerSession,
            hasClassroom: product.hasClassroom,
            hasSession: product.hasSession,
            hasAssessment: product.hasAssessment,
            hasCertificate: product.hasCertificate,
            requiresBooking: product.requiresBooking,
            requiresEnrollment: product.requiresEnrollment,
            isBookableService: product.isBookableService,
            price: product.price,
            currency: product.currency || "gbp",
            discountPercentage: product.discountPercentage,
            maxParticipants: product.maxParticipants || 1,
            description: product.description,
            tags: product.tags || [],
            slug: product.slug,
            iconUrl: product.iconUrl,
            thumbnailUrl: product.thumbnailUrl,
            materialUrl: product.materialUrl, // Add materialUrl to form
            isAttachmentRequired: product.isAttachmentRequired, // Add isAttachmentRequired to form
            publicSchedulingUrl: product.publicSchedulingUrl, // Add publicSchedulingUrl to form
            enabled: product.enabled,
            instructorId: product.instructorId, // Add instructorId to form
          });
        } else {
          setError("Failed to load product");
        }

        // Set instructors data
        if (instructorsResponse?.data?.success) {
          setInstructors(instructorsResponse.data.data.instructors || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" && "checked" in e.target
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleDeleteMaterial = async () => {
    if (!form.materialUrl) return;

    setSaving(true);
    try {
      // Delete the file from Firebase Storage
      await deleteFileFromFirebase(form.materialUrl);

      // Clear the material URL from the form
      setForm((prev) => ({
        ...prev,
        materialUrl: "",
      }));

      setSuccess("Material deleted successfully!");
    } catch (err) {
      setError("Failed to delete material. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = getTokenFromCookies();
    if (!token) {
      setError("Authentication required. Please log in.");
      setSaving(false);
      return;
    }

    try {
      // Validate duration in minutes (1-120 minutes)
      if (
        (form.durationInMinutes ?? 0) < 1 ||
        (form.durationInMinutes ?? 0) > 120
      ) {
        setError("Duration must be between 1 and 120 minutes.");
        setSaving(false);
        return;
      }

      // Validate minutes per session (1-120 minutes)
      if (
        (form.minutesPerSession ?? 0) < 1 ||
        (form.minutesPerSession ?? 0) > 120
      ) {
        setError("Minutes per session must be between 1 and 120 minutes.");
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price) || 0,
        currency: form.currency || "gbp",
        discountPercentage: Number(form.discountPercentage) || 0,
        maxParticipants: Number(form.maxParticipants) || 1,
        programLength: Number(form.programLength) || 0,
        durationInMinutes: Number(form.durationInMinutes) || 0,
        minutesPerSession: Number(form.minutesPerSession) || 0,
        tags: Array.isArray(form.tags) ? form.tags : [],
      };

      const response = await updateApiRequest(
        `/api/products/${params.id}`,
        token,
        payload
      );

      if (response?.data?.success) {
        setSuccess("Product updated successfully!");
        setTimeout(() => {
          router.push(`/dashboard/products/${params.id}`);
        }, 2000);
      } else {
        setError(response?.data?.message || "Failed to update product");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-12 w-full bg-slate-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Error Loading Product
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Link href="/dashboard/products">
              <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all duration-300">
                Back to Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/products/${params.id}`}>
              <button className="p-3 rounded-full hover:bg-slate-100 transition-all duration-300">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
              <p className="text-slate-600 mt-1">
                Update product information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Type *
                  </label>
                  <select
                    name="productType"
                    value={form.productType || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="">Select Product Type</option>
                    {PRODUCT_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Service Name *
                  </label>
                  <Input
                    name="service"
                    value={form.service || ""}
                    onChange={handleChange}
                    placeholder="Enter service name"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Booking Scheduling Link *
                  </label>
                  <Input
                    name="publicSchedulingUrl"
                    value={form.publicSchedulingUrl || ""}
                    onChange={handleChange}
                    placeholder="Generate the scheduling link for the service"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assign Instructor
                  </label>
                  <select
                    name="instructorId"
                    value={form.instructorId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select Instructor (Optional)</option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor.userId}>
                        {instructor.fullName} - {instructor.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Upload field for Training Programs */}
                {(form.productType === "Training & Certification" ||
                  form.productType === "Academic Support Services" ||
                  form.productType === "Career Development & Mentorship") && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Training Materials *
                    </label>

                    {/* Current Material Display */}
                    {form.materialUrl && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-700 text-sm font-medium">
                              Current Material
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleDeleteMaterial}
                            disabled={saving}
                            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            {saving ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                        <a
                          href={form.materialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Preview current material
                        </a>
                        <p className="text-green-600 text-xs mt-1">
                          Tech professionals will be able to download this
                          material after purchase
                        </p>
                      </div>
                    )}

                    {/* File Upload Input */}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.xlsx,.csv"
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSaving(true);
                          try {
                            // If there's an existing material, delete it first
                            if (form.materialUrl) {
                              try {
                                await deleteFileFromFirebase(form.materialUrl);
                              } catch (deleteErr) {
                                console.warn(
                                  "Failed to delete old material:",
                                  deleteErr
                                );
                                // Continue with upload even if deletion fails
                              }
                            }

                            // Upload new material
                            const url = await uploadMaterial(
                              file,
                              "course-materials"
                            );
                            setForm((prev: any) => ({
                              ...prev,
                              materialUrl: url,
                            }));
                            setSuccess("Material uploaded successfully!");
                          } catch (err) {
                            setError("Material upload failed");
                          } finally {
                            setSaving(false);
                          }
                        }
                      }}
                    />

                    {/* Info Box */}
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-3 h-3 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-blue-800 text-sm font-medium mb-1">
                            For Tech Professionals
                          </p>
                          <p className="text-blue-700 text-sm">
                            Upload training materials, course content,
                            resources, or documents that tech professionals can
                            view and download after purchasing this program.
                          </p>
                          <p className="text-blue-600 text-xs mt-1">
                            Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT,
                            ZIP, RAR, XLSX, CSV
                          </p>
                          {form.materialUrl && (
                            <p className="text-blue-600 text-xs mt-2 font-medium">
                              💡 Uploading a new file will replace the current
                              material
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachment Required Checkbox for all services */}
                {form.productType && (
                  <div className="mt-4">
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAttachmentRequired"
                        checked={!!form.isAttachmentRequired}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        Attachment Required
                      </span>
                    </label>
                    <p className="text-slate-500 text-sm mt-1 ml-2">
                      Check if users need to submit attachments for this service
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Slug *
                  </label>
                  <Input
                    name="slug"
                    value={form.slug || ""}
                    onChange={handleChange}
                    placeholder="Enter URL-friendly slug"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Delivery & Session */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Delivery & Session
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Delivery Mode *
                  </label>
                  <select
                    name="deliveryMode"
                    value={form.deliveryMode || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="">Select Delivery Mode</option>
                    {DELIVERY_MODE_OPTIONS.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Session Type *
                  </label>
                  <select
                    name="sessionType"
                    value={form.sessionType || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="">Select Session Type</option>
                    {SESSION_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Program Length *
                    </label>
                    <Input
                      name="programLength"
                      value={form.programLength || ""}
                      onChange={handleChange}
                      type="number"
                      min={0}
                      placeholder="e.g., 8"
                      className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mode *
                    </label>
                    <select
                      name="mode"
                      value={form.mode || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Select Mode</option>
                      {MODE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Duration */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Pricing & Duration
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price *
                  </label>
                  <Input
                    name="price"
                    value={form.price || ""}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00 (free) or amount"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency || "gbp"}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    {CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Max Participants
                  </label>
                  <Input
                    name="maxParticipants"
                    value={form.maxParticipants || ""}
                    onChange={handleChange}
                    type="number"
                    min={1}
                    placeholder="Maximum number of participants"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Discount Percentage
                  </label>
                  <Input
                    name="discountPercentage"
                    value={form.discountPercentage || ""}
                    onChange={handleChange}
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <Input
                    name="durationInMinutes"
                    value={form.durationInMinutes || ""}
                    onChange={handleChange}
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Total duration (1-120 minutes)"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  {form.durationInMinutes &&
                    (form.durationInMinutes < 1 ||
                      form.durationInMinutes > 120) && (
                      <p className="text-red-500 text-sm mt-1">
                        Duration must be between 1 and 120 minutes.
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Minutes Per Session *
                  </label>
                  <Input
                    name="minutesPerSession"
                    value={form.minutesPerSession || ""}
                    onChange={handleChange}
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Per session duration (1-120 minutes)"
                    className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  {form.minutesPerSession &&
                    (form.minutesPerSession < 1 ||
                      form.minutesPerSession > 120) && (
                      <p className="text-red-500 text-sm mt-1">
                        Minutes per session must be between 1 and 120 minutes.
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Features
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: "hasCertificate", label: "Has Certificate" },
                  { key: "hasAssessment", label: "Has Assessment" },
                  { key: "hasClassroom", label: "Has Classroom" },
                  { key: "hasSession", label: "Has Session" },
                  { key: "requiresBooking", label: "Requires Booking" },
                  { key: "requiresEnrollment", label: "Requires Enrollment" },
                  { key: "isBookableService", label: "Bookable Service" },
                  { key: "isRecurring", label: "Recurring" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all duration-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name={key}
                      checked={!!form[key as keyof typeof form]}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Tags</h2>
              <Input
                name="tags"
                value={Array.isArray(form.tags) ? form.tags.join(", ") : ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Enter tags separated by commas (e.g., Python, AI, Machine Learning)"
                className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Status */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Status</h2>
              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all duration-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={!!form.enabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Product Enabled
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Link href={`/dashboard/products/${params.id}`}>
                  <button
                    type="button"
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-green-700 font-medium">{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
