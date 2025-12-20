"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Target,
  TrendingUp,
  Star,
  Clock,
  Plus,
  Edit,
  Download,
  Share2,
  RefreshCw,
  BookOpen,
  Code,
  Building,
  Globe,
  Shield,
  Database,
  Cloud,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Award,
  Users,
  Calendar,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

interface CVAnalysis {
  id: string;
  cvName: string;
  uploadDate: string;
  lastAnalyzed: string;
  overallScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string[];
    suggestions: string[];
  }[];
  keywords: {
    found: string[];
    missing: string[];
    suggested: string[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  industryMatch: {
    score: number;
    matchedIndustries: string[];
    targetRoles: string[];
  };
  improvements: {
    priority: "critical" | "high" | "medium" | "low";
    category: string;
    description: string;
    impact: number;
    effort: "low" | "medium" | "high";
    estimatedTime: string;
  }[];
  performance: {
    views: number;
    applications: number;
    interviews: number;
    offers: number;
    conversionRate: number;
  };
}

interface JobMatch {
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  salary: string;
  location: string;
  postedDate: string;
}

export default function CVAnalysisPage() {
  const { userData } = useRole();
  const [analyses, setAnalyses] = useState<CVAnalysis[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAnalyses: CVAnalysis[] = [
      {
        id: "1",
        cvName: "Software_Engineer_Resume_2024.pdf",
        uploadDate: "2024-01-15",
        lastAnalyzed: "2024-01-20",
        overallScore: 78,
        sections: [
          {
            name: "Contact Information",
            score: 95,
            feedback: ["Complete contact details", "Professional email format"],
            suggestions: ["Add LinkedIn profile", "Include portfolio URL"],
          },
          {
            name: "Professional Summary",
            score: 70,
            feedback: ["Good overview of experience", "Could be more specific"],
            suggestions: [
              "Add quantifiable achievements",
              "Include target role/industry",
              "Make it more compelling",
            ],
          },
          {
            name: "Work Experience",
            score: 82,
            feedback: ["Good job descriptions", "Shows progression"],
            suggestions: [
              "Add more metrics and achievements",
              "Use action verbs consistently",
              "Include project outcomes",
            ],
          },
          {
            name: "Skills",
            score: 75,
            feedback: [
              "Relevant technical skills",
              "Good mix of hard and soft skills",
            ],
            suggestions: [
              "Add proficiency levels",
              "Include emerging technologies",
              "Group skills by category",
            ],
          },
          {
            name: "Education",
            score: 90,
            feedback: ["Clear education background", "Relevant degree"],
            suggestions: ["Add relevant coursework", "Include certifications"],
          },
        ],
        keywords: {
          found: ["JavaScript", "React", "Node.js", "AWS", "Agile"],
          missing: ["TypeScript", "Docker", "Kubernetes", "Microservices"],
          suggested: ["TypeScript", "Docker", "CI/CD", "System Design"],
        },
        atsCompatibility: {
          score: 85,
          issues: [
            "Some formatting may not parse correctly",
            "Missing some industry keywords",
          ],
          recommendations: [
            "Use standard fonts (Arial, Calibri)",
            "Avoid tables and complex formatting",
            "Include more industry-specific keywords",
          ],
        },
        industryMatch: {
          score: 80,
          matchedIndustries: [
            "Technology",
            "Software Development",
            "E-commerce",
          ],
          targetRoles: [
            "Senior Software Engineer",
            "Full Stack Developer",
            "Tech Lead",
          ],
        },
        improvements: [
          {
            priority: "critical",
            category: "Skills",
            description: "Add TypeScript to skills section",
            impact: 15,
            effort: "low",
            estimatedTime: "1 hour",
          },
          {
            priority: "high",
            category: "Experience",
            description: "Add quantifiable achievements to work experience",
            impact: 12,
            effort: "medium",
            estimatedTime: "2-3 hours",
          },
          {
            priority: "medium",
            category: "Summary",
            description: "Rewrite professional summary to be more compelling",
            impact: 8,
            effort: "medium",
            estimatedTime: "1-2 hours",
          },
        ],
        performance: {
          views: 45,
          applications: 12,
          interviews: 3,
          offers: 1,
          conversionRate: 8.3,
        },
      },
    ];

    const mockJobMatches: JobMatch[] = [
      {
        jobTitle: "Senior Software Engineer",
        company: "TechCorp Inc.",
        matchScore: 85,
        matchedSkills: ["JavaScript", "React", "Node.js", "AWS", "Agile"],
        missingSkills: ["TypeScript", "Docker"],
        salary: "$120,000 - $150,000",
        location: "San Francisco, CA",
        postedDate: "2024-01-18",
      },
      {
        jobTitle: "Full Stack Developer",
        company: "StartupXYZ",
        matchScore: 78,
        matchedSkills: ["JavaScript", "React", "Node.js", "MongoDB"],
        missingSkills: ["TypeScript", "Docker", "Kubernetes"],
        salary: "$100,000 - $130,000",
        location: "Austin, TX",
        postedDate: "2024-01-16",
      },
      {
        jobTitle: "Frontend Engineer",
        company: "BigTech Company",
        matchScore: 72,
        matchedSkills: ["JavaScript", "React", "HTML", "CSS"],
        missingSkills: ["TypeScript", "Next.js", "GraphQL"],
        salary: "$110,000 - $140,000",
        location: "Seattle, WA",
        postedDate: "2024-01-19",
      },
    ];

    setTimeout(() => {
      setAnalyses(mockAnalyses);
      setJobMatches(mockJobMatches);
      setSelectedAnalysis(mockAnalyses[0].id);
      setLoading(false);
    }, 1000);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 80) return "bg-blue-100";
    if (score >= 70) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const currentAnalysis = analyses.find((a) => a.id === selectedAnalysis);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CV Analysis</h1>
          <p className="text-gray-600 mt-2">
            AI-powered resume analysis and improvement recommendations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload New CV
          </Button>
        </div>
      </div>

      {/* CV Selection */}
      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select CV for Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`p-4 border rounded-[10px] cursor-pointer transition-all ${
                    selectedAnalysis === analysis.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedAnalysis(analysis.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{analysis.cvName}</h3>
                    <Badge
                      className={`${getScoreBgColor(
                        analysis.overallScore
                      )} ${getScoreColor(analysis.overallScore)}`}
                    >
                      {analysis.overallScore}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Uploaded:{" "}
                      {new Date(analysis.uploadDate).toLocaleDateString()}
                    </p>
                    <p>
                      Last analyzed:{" "}
                      {new Date(analysis.lastAnalyzed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentAnalysis && (
        <>
          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Overall Score
                    </p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        currentAnalysis.overallScore
                      )}`}
                    >
                      {currentAnalysis.overallScore}%
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-[10px] ${getScoreBgColor(
                      currentAnalysis.overallScore
                    )}`}
                  >
                    <BarChart3
                      className={`w-6 h-6 ${getScoreColor(
                        currentAnalysis.overallScore
                      )}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      ATS Compatibility
                    </p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        currentAnalysis.atsCompatibility.score
                      )}`}
                    >
                      {currentAnalysis.atsCompatibility.score}%
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-[10px] ${getScoreBgColor(
                      currentAnalysis.atsCompatibility.score
                    )}`}
                  >
                    <CheckCircle
                      className={`w-6 h-6 ${getScoreColor(
                        currentAnalysis.atsCompatibility.score
                      )}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Industry Match
                    </p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(
                        currentAnalysis.industryMatch.score
                      )}`}
                    >
                      {currentAnalysis.industryMatch.score}%
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-[10px] ${getScoreBgColor(
                      currentAnalysis.industryMatch.score
                    )}`}
                  >
                    <Target
                      className={`w-6 h-6 ${getScoreColor(
                        currentAnalysis.industryMatch.score
                      )}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentAnalysis.performance.conversionRate}%
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-[10px]">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sections">Section Analysis</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="matches">Job Matches</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle>Section Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentAnalysis.sections.map((section) => (
                        <div key={section.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{section.name}</span>
                            <span
                              className={`font-bold ${getScoreColor(
                                section.score
                              )}`}
                            >
                              {section.score}%
                            </span>
                          </div>
                          <Progress value={section.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>CV Views</span>
                        <span className="font-medium">
                          {currentAnalysis.performance.views}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Applications</span>
                        <span className="font-medium">
                          {currentAnalysis.performance.applications}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Interviews</span>
                        <span className="font-medium">
                          {currentAnalysis.performance.interviews}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Job Offers</span>
                        <span className="font-medium">
                          {currentAnalysis.performance.offers}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Conversion Rate</span>
                          <span className="font-bold text-blue-600">
                            {currentAnalysis.performance.conversionRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentAnalysis.sections.map((section) => (
                  <Card key={section.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{section.name}</CardTitle>
                        <Badge
                          className={`${getScoreBgColor(
                            section.score
                          )} ${getScoreColor(section.score)}`}
                        >
                          {section.score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Feedback:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {section.feedback.map((item, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Suggestions:
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {section.suggestions.map((item, index) => (
                              <li key={index} className="flex items-center">
                                <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Found Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.keywords.found.map((keyword) => (
                        <Badge
                          key={keyword}
                          className="bg-green-100 text-green-800"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                      Missing Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.keywords.missing.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="outline"
                          className="text-red-600 border-red-300"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
                      Suggested Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.keywords.suggested.map((keyword) => (
                        <Badge
                          key={keyword}
                          className="bg-blue-100 text-blue-800"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentAnalysis.improvements.map((improvement, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">
                            {improvement.description}
                          </h3>
                          <Badge
                            className={getPriorityColor(improvement.priority)}
                          >
                            {improvement.priority}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Impact:</span>
                            <span className="font-medium">
                              +{improvement.impact}% score
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Effort:</span>
                            <Badge
                              className={getEffortColor(improvement.effort)}
                            >
                              {improvement.effort}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Time:</span>
                            <span className="font-medium">
                              {improvement.estimatedTime}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Implement Improvement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobMatches.map((job, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {job.jobTitle}
                            </h3>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <Badge
                            className={`${getScoreBgColor(
                              job.matchScore
                            )} ${getScoreColor(job.matchScore)}`}
                          >
                            {job.matchScore}% match
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Salary:</span>
                            <span className="ml-2 font-medium">
                              {job.salary}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-2 font-medium">
                              {job.location}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Matched Skills:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {job.matchedSkills.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {job.missingSkills.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Missing Skills:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {job.missingSkills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-red-600 border-red-300 text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex space-x-2 pt-4 border-t">
                          <Button size="sm" className="flex-1">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Job
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
