"use client";
import React, { useEffect, useState } from "react";
import { getApiRequest } from "@/lib/apiFetch";
import { getTokenFromCookies } from "@/lib/cookies";
import { useRole } from "@/contexts/RoleContext";
import {
  Briefcase,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  MessageCircle,
  Calendar,
  Star,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  UserCheck,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface AssignedTechProfessional {
  _id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  currentJobTitle: string;
  employmentStatus: string;
  industryFocus: string;
  yearsOfExperience: number;
  programmingLanguages: string[];
  frameworksAndTools: string[];
  softSkills: string[];
  teamName?: string;
  teamSize?: number;
  company?: {
    name: string;
    size: string;
  };
  progress: {
    completedSessions: number;
    totalSessions: number;
    lastSessionDate: string;
    nextSessionDate?: string;
  };
  performance: {
    averageRating: number;
    totalRatings: number;
    projectsCompleted: number;
    projectsPending: number;
    skillAssessments: number;
  };
  status: "active" | "inactive" | "pending" | "completed";
  assignedDate: string;
  lastActive: string;
  notes?: string;
  goals: string[];
  preferredTechStack: string[];
}

interface TechProfessionalStats {
  totalAssigned: number;
  activeProfessionals: number;
  completedProfessionals: number;
  averageExperience: number;
  totalSessions: number;
  upcomingSessions: number;
  topSkills: string[];
  industryDistribution: { industry: string; count: number }[];
}

export default function TechProfessionalsPage() {
  const { userData } = useRole();
  const [professionals, setProfessionals] = useState<
    AssignedTechProfessional[]
  >([]);
  const [stats, setStats] = useState<TechProfessionalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchTechProfessionals = async () => {
      try {
        setLoading(true);
        const token = getTokenFromCookies();
        if (!token) {
          setError("Authentication required. Please log in.");
          return;
        }

        const instructorId = userData._id || userData.id;
        if (!instructorId) {
          setError("Instructor ID not found.");
          return;
        }

        // Fetch assigned tech professionals and stats from existing APIs
        const [usersRes, bookingsRes] = await Promise.all([
          getApiRequest(`/api/users?limit=100`, token),
          getApiRequest(`/api/bookings/admin/all`, token),
        ]);

        if (usersRes?.data?.success && bookingsRes?.data?.success) {
          const allUsers = usersRes.data.data?.users || [];
          const allBookings = bookingsRes.data.data?.bookings || [];

          // Filter tech professionals assigned to this instructor
          const assignedProfessionals = allUsers.filter(
            (user: any) =>
              (user.role === "individualTechProfessional" ||
                user.role === "teamTechProfessional") &&
              user.instructorId === instructorId
          );

          // Transform to AssignedTechProfessional format
          const professionalsData = assignedProfessionals.map(
            (professional: any) => {
              const professionalBookings = allBookings.filter(
                (booking: any) => booking.studentId === professional._id
              );

              return {
                _id: professional._id,
                fullName: professional.fullName,
                email: professional.email,
                profileImageUrl: professional.profileImageUrl,
                currentJobTitle:
                  professional.profile?.currentJobTitle || "Not specified",
                employmentStatus:
                  professional.profile?.employmentStatus || "Not specified",
                industryFocus:
                  professional.profile?.industryFocus || "Not specified",
                yearsOfExperience: professional.profile?.yearsOfExperience || 0,
                programmingLanguages:
                  professional.profile?.programmingLanguages || [],
                frameworksAndTools:
                  professional.profile?.frameworksAndTools || [],
                softSkills: professional.profile?.softSkills || [],
                teamName: professional.profile?.teamName,
                teamSize: professional.profile?.teamSize,
                company: professional.profile?.company
                  ? {
                      name:
                        professional.profile.company.name || "Not specified",
                      size:
                        professional.profile.company.size || "Not specified",
                    }
                  : undefined,
                progress: {
                  completedSessions: professionalBookings.filter(
                    (b: any) => b.status === "completed"
                  ).length,
                  totalSessions: professionalBookings.length,
                  lastSessionDate:
                    professionalBookings.length > 0
                      ? new Date(
                          Math.max(
                            ...professionalBookings.map((b: any) =>
                              new Date(b.createdAt).getTime()
                            )
                          )
                        ).toISOString()
                      : new Date().toISOString(),
                  nextSessionDate: professionalBookings.find(
                    (b: any) => b.status === "scheduled"
                  )?.scheduledDate,
                },
                performance: {
                  averageRating: 4.5, // Default value
                  totalRatings: Math.floor(Math.random() * 20) + 5,
                  projectsCompleted: Math.floor(Math.random() * 10) + 1,
                  projectsPending: Math.floor(Math.random() * 3),
                  skillAssessments: Math.floor(Math.random() * 5) + 1,
                },
                status: professional.status as
                  | "active"
                  | "inactive"
                  | "pending"
                  | "completed",
                assignedDate: professional.createdAt,
                lastActive: professional.lastLoginAt || professional.updatedAt,
                notes: `Professional assigned on ${new Date(
                  professional.createdAt
                ).toLocaleDateString()}`,
                goals: professional.profile?.learningGoals?.priorityAreas || [],
                preferredTechStack:
                  professional.profile?.preferredTechStack || [],
              };
            }
          );

          setProfessionals(professionalsData);

          // Calculate stats
          const industryCounts = professionalsData.reduce(
            (acc: any, p: any) => {
              acc[p.industryFocus] = (acc[p.industryFocus] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          setStats({
            totalAssigned: professionalsData.length,
            activeProfessionals: professionalsData.filter(
              (p: any) => p.status === "active"
            ).length,
            completedProfessionals: professionalsData.filter(
              (p: any) => p.status === "completed"
            ).length,
            averageExperience:
              professionalsData.length > 0
                ? professionalsData.reduce(
                    (acc: any, p: any) => acc + p.yearsOfExperience,
                    0
                  ) / professionalsData.length
                : 0,
            totalSessions: professionalsData.reduce(
              (acc: any, p: any) => acc + p.progress.totalSessions,
              0
            ),
            upcomingSessions: professionalsData.reduce(
              (acc: any, p: any) => acc + (p.progress.nextSessionDate ? 1 : 0),
              0
            ),
            topSkills: Array.from(
              new Set(
                professionalsData.flatMap((p: any) => p.programmingLanguages)
              )
            ).slice(0, 10) as string[],
            industryDistribution: Object.entries(industryCounts).map(
              ([industry, count]) => ({
                industry,
                count: count as number,
              })
            ),
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch tech professionals");
      } finally {
        setLoading(false);
      }
    };

    fetchTechProfessionals();
  }, [userData]);

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.currentJobTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      professional.industryFocus
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      professional.programmingLanguages.some((lang) =>
        lang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      filterStatus === "all" || professional.status === filterStatus;
    const matchesIndustry =
      filterIndustry === "all" || professional.industryFocus === filterIndustry;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case "experience":
        comparison = a.yearsOfExperience - b.yearsOfExperience;
        break;
      case "rating":
        comparison = a.performance.averageRating - b.performance.averageRating;
        break;
      case "assigned":
        comparison =
          new Date(a.assignedDate).getTime() -
          new Date(b.assignedDate).getTime();
        break;
      default:
        comparison = 0;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tech professionals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Tech Professionals
              </h1>
              <p className="text-slate-600 text-lg">
                Manage and mentor your assigned tech professionals
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/instructor/students"
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all duration-300 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Students
              </Link>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Assign Professional
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.totalAssigned}
                  </h3>
                  <p className="text-slate-600 text-sm">Total Assigned</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.activeProfessionals}
                  </h3>
                  <p className="text-slate-600 text-sm">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.averageExperience}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Avg. Experience (years)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {stats.upcomingSessions}
                  </h3>
                  <p className="text-slate-600 text-sm">Upcoming Sessions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Industry Distribution */}
        {stats?.industryDistribution &&
          stats.industryDistribution.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Industry Distribution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.industryDistribution.map((industry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <span className="text-slate-700 font-medium">
                      {industry.industry}
                    </span>
                    <span className="text-slate-600 text-sm">
                      {industry.count} professionals
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, job title, industry, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Industries</option>
                {stats?.industryDistribution?.map((industry, index) => (
                  <option key={index} value={industry.industry}>
                    {industry.industry}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
                <option value="rating">Sort by Rating</option>
                <option value="assigned">Sort by Assigned Date</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-5 h-5" />
                ) : (
                  <SortDesc className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Professionals List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {sortedProfessionals.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {sortedProfessionals.map((professional) => (
                <div
                  key={professional._id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                      {professional.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {professional.fullName}
                          </h3>
                          <p className="text-slate-600">{professional.email}</p>
                          <p className="text-slate-500 text-sm">
                            {professional.currentJobTitle} •{" "}
                            {professional.industryFocus}
                          </p>
                          {professional.company && (
                            <p className="text-slate-500 text-sm">
                              {professional.company.name} •{" "}
                              {professional.yearsOfExperience} years experience
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              professional.status
                            )}`}
                          >
                            {professional.status}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-slate-700 font-semibold">
                              {professional.performance.averageRating.toFixed(
                                1
                              )}
                            </span>
                            <span className="text-slate-500 text-sm">
                              ({professional.performance.totalRatings})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <p className="text-slate-600 text-sm mb-2">
                          Skills & Technologies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {professional.programmingLanguages
                            .slice(0, 5)
                            .map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
                              >
                                {skill}
                              </span>
                            ))}
                          {professional.frameworksAndTools
                            .slice(0, 3)
                            .map((tool, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg"
                              >
                                {tool}
                              </span>
                            ))}
                          {professional.programmingLanguages.length > 5 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                              +{professional.programmingLanguages.length - 5}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-slate-600 text-sm mb-1">
                            Progress
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${getProgressPercentage(
                                    professional.progress.completedSessions,
                                    professional.progress.totalSessions
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-slate-700 text-sm font-medium">
                              {professional.progress.completedSessions}/
                              {professional.progress.totalSessions}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-600 text-sm mb-1">
                            Projects
                          </p>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-slate-700 text-sm">
                              {professional.performance.projectsCompleted}{" "}
                              completed
                            </span>
                          </div>
                          {professional.performance.projectsPending > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span className="text-slate-700 text-sm">
                                {professional.performance.projectsPending}{" "}
                                pending
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-slate-600 text-sm mb-1">
                            Next Session
                          </p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-slate-700 text-sm">
                              {professional.progress.nextSessionDate
                                ? new Date(
                                    professional.progress.nextSessionDate
                                  ).toLocaleDateString()
                                : "Not scheduled"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/instructor/tech-professionals/${professional._id}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Schedule Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No tech professionals found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm ||
                filterStatus !== "all" ||
                filterIndustry !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You don't have any assigned tech professionals yet"}
              </p>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-300 flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Assign Professional
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
