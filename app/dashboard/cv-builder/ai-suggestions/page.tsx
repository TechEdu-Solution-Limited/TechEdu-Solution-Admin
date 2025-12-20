"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
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
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

interface AISuggestion {
  id: string;
  type:
    | "skill"
    | "certification"
    | "project"
    | "career"
    | "learning"
    | "networking";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  timeframe: string;
  confidence: number; // 0-100
  reasoning: string;
  resources: string[];
  estimatedCost?: number;
  currency?: string;
  tags: string[];
  status: "pending" | "in-progress" | "completed" | "dismissed";
  createdAt: string;
  deadline?: string;
}

interface AIInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  type: "positive" | "warning" | "opportunity" | "trend";
  data: any;
  recommendations: string[];
}

interface SkillGap {
  skill: string;
  demand: number; // 0-100
  supply: number; // 0-100
  gap: number; // demand - supply
  priority: "critical" | "high" | "medium" | "low";
  learningPath: string[];
  estimatedTime: string;
  cost: number;
}

export default function AISuggestionsPage() {
  const { userData } = useRole();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockSuggestions: AISuggestion[] = [
      {
        id: "1",
        type: "skill",
        title: "Learn TypeScript",
        description:
          "Based on your JavaScript expertise and current job market trends, TypeScript would significantly boost your employability and salary potential.",
        priority: "high",
        impact: "high",
        effort: "medium",
        timeframe: "2-3 months",
        confidence: 92,
        reasoning:
          "85% of React jobs require TypeScript, and you already have strong JavaScript skills. This is a natural progression.",
        resources: [
          "TypeScript Official Documentation",
          "TypeScript Deep Dive by Basarat",
          "React with TypeScript Course",
        ],
        estimatedCost: 50,
        currency: "USD",
        tags: ["TypeScript", "JavaScript", "React", "Frontend"],
        status: "pending",
        createdAt: "2024-01-20",
        deadline: "2024-04-20",
      },
      {
        id: "2",
        type: "certification",
        title: "AWS Solutions Architect Professional",
        description:
          "Your current AWS Associate certification combined with 2 years of cloud experience makes you ready for the Professional level.",
        priority: "high",
        impact: "high",
        effort: "high",
        timeframe: "4-6 months",
        confidence: 88,
        reasoning:
          "Cloud skills are in high demand, and Professional certifications command 30% higher salaries on average.",
        resources: ["AWS Official Training", "Practice Exams", "Hands-on Labs"],
        estimatedCost: 300,
        currency: "USD",
        tags: ["AWS", "Cloud", "DevOps", "Architecture"],
        status: "in-progress",
        createdAt: "2024-01-15",
        deadline: "2024-07-15",
      },
      {
        id: "3",
        type: "project",
        title: "Build a Full-Stack E-commerce Platform",
        description:
          "Create a comprehensive e-commerce solution using your current skills to demonstrate full-stack capabilities.",
        priority: "medium",
        impact: "medium",
        effort: "high",
        timeframe: "3-4 months",
        confidence: 85,
        reasoning:
          "Full-stack projects showcase your end-to-end development skills and are highly valued by employers.",
        resources: [
          "Next.js Documentation",
          "Stripe Integration Guide",
          "Database Design Patterns",
        ],
        estimatedCost: 100,
        currency: "USD",
        tags: ["Full-Stack", "React", "Node.js", "E-commerce"],
        status: "pending",
        createdAt: "2024-01-18",
      },
      {
        id: "4",
        type: "career",
        title: "Target Senior Developer Positions",
        description:
          "Your experience and skills align well with senior developer roles. Focus on leadership and architecture skills.",
        priority: "high",
        impact: "high",
        effort: "medium",
        timeframe: "6-12 months",
        confidence: 90,
        reasoning:
          "You have the technical foundation. Adding leadership and system design skills will unlock senior opportunities.",
        resources: [
          "System Design Interview Prep",
          "Leadership in Tech Course",
          "Technical Interview Practice",
        ],
        estimatedCost: 200,
        currency: "USD",
        tags: ["Career", "Leadership", "System Design", "Senior"],
        status: "pending",
        createdAt: "2024-01-10",
      },
      {
        id: "5",
        type: "learning",
        title: "Master System Design",
        description:
          "System design skills are crucial for senior positions and will significantly increase your market value.",
        priority: "medium",
        impact: "high",
        effort: "high",
        timeframe: "4-5 months",
        confidence: 87,
        reasoning:
          "System design interviews are common for senior roles and demonstrate architectural thinking.",
        resources: [
          "System Design Primer",
          "Grokking the System Design Interview",
          "Practice with Real Scenarios",
        ],
        estimatedCost: 150,
        currency: "USD",
        tags: ["System Design", "Architecture", "Senior", "Interview"],
        status: "pending",
        createdAt: "2024-01-12",
      },
    ];

    const mockInsights: AIInsight[] = [
      {
        id: "1",
        category: "Market Analysis",
        title: "High Demand for Cloud Skills",
        description:
          "Cloud computing skills are experiencing 40% higher demand than last year.",
        type: "opportunity",
        data: { demandIncrease: 40, averageSalary: 120000 },
        recommendations: [
          "Focus on AWS/Azure certifications",
          "Build cloud-native projects",
          "Learn containerization technologies",
        ],
      },
      {
        id: "2",
        category: "Skill Gap",
        title: "TypeScript Gap Identified",
        description:
          "Your JavaScript skills are strong, but TypeScript is becoming essential for modern development.",
        type: "warning",
        data: {
          currentSkill: "JavaScript",
          missingSkill: "TypeScript",
          gap: 75,
        },
        recommendations: [
          "Start TypeScript learning path",
          "Convert existing projects to TypeScript",
          "Practice with real-world scenarios",
        ],
      },
      {
        id: "3",
        category: "Career Progress",
        title: "Ready for Senior Role",
        description:
          "Your experience and skills align well with senior developer requirements.",
        type: "positive",
        data: {
          readinessScore: 85,
          missingSkills: ["Leadership", "System Design"],
        },
        recommendations: [
          "Apply for senior positions",
          "Develop leadership skills",
          "Practice system design interviews",
        ],
      },
    ];

    const mockSkillGaps: SkillGap[] = [
      {
        skill: "TypeScript",
        demand: 85,
        supply: 60,
        gap: 25,
        priority: "critical",
        learningPath: [
          "TypeScript Basics",
          "Advanced Types",
          "React with TypeScript",
        ],
        estimatedTime: "2-3 months",
        cost: 50,
      },
      {
        skill: "System Design",
        demand: 90,
        supply: 40,
        gap: 50,
        priority: "high",
        learningPath: [
          "System Design Fundamentals",
          "Architecture Patterns",
          "Interview Practice",
        ],
        estimatedTime: "4-5 months",
        cost: 150,
      },
      {
        skill: "Kubernetes",
        demand: 75,
        supply: 30,
        gap: 45,
        priority: "high",
        learningPath: [
          "Docker Basics",
          "Kubernetes Fundamentals",
          "Advanced Orchestration",
        ],
        estimatedTime: "3-4 months",
        cost: 200,
      },
    ];

    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setInsights(mockInsights);
      setSkillGaps(mockSkillGaps);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-purple-100 text-purple-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "skill":
        return Code;
      case "certification":
        return Star;
      case "project":
        return Building;
      case "career":
        return Target;
      case "learning":
        return BookOpen;
      case "networking":
        return Globe;
      default:
        return Zap;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "opportunity":
        return "bg-blue-100 text-blue-800";
      case "trend":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSuggestions =
    selectedFilter === "all"
      ? suggestions
      : suggestions.filter((s) => s.type === selectedFilter);

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const inProgressSuggestions = suggestions.filter(
    (s) => s.status === "in-progress"
  );
  const completedSuggestions = suggestions.filter(
    (s) => s.status === "completed"
  );

  const highPrioritySuggestions = suggestions.filter(
    (s) => s.priority === "high"
  );
  const highImpactSuggestions = suggestions.filter((s) => s.impact === "high");

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
          <h1 className="text-3xl font-bold">AI Suggestions</h1>
          <p className="text-gray-600 mt-2">
            Personalized AI-powered recommendations for your career growth
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh AI
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Generate New Suggestions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Suggestions
                </p>
                <p className="text-2xl font-bold">
                  {pendingSuggestions.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-[10px]">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {inProgressSuggestions.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-[10px]">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold">
                  {highPrioritySuggestions.length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-[10px]">
                <Target className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Impact</p>
                <p className="text-2xl font-bold">
                  {highImpactSuggestions.length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-[10px]">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-[10px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{insight.title}</h3>
                  <Badge className={getInsightTypeColor(insight.type)}>
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {insight.description}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recommendations:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {insight.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="flex items-center">
                        <ArrowRight className="w-3 h-3 mr-2 text-blue-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Gaps Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Gaps Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGaps.map((gap) => (
              <div key={gap.skill} className="p-4 border rounded-[10px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{gap.skill}</h3>
                  <Badge className={getPriorityColor(gap.priority)}>
                    {gap.priority} priority
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Demand</p>
                    <p className="font-medium">{gap.demand}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Level</p>
                    <p className="font-medium">{gap.supply}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gap</p>
                    <p className="font-medium text-red-600">{gap.gap}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Learning Path:</p>
                  <div className="flex flex-wrap gap-1">
                    {gap.learningPath.map((step, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {step}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                  <span>Time: {gap.estimatedTime}</span>
                  <span>Cost: ${gap.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({suggestions.length})</TabsTrigger>
          <TabsTrigger value="skill">
            Skills ({suggestions.filter((s) => s.type === "skill").length})
          </TabsTrigger>
          <TabsTrigger value="certification">
            Certifications (
            {suggestions.filter((s) => s.type === "certification").length})
          </TabsTrigger>
          <TabsTrigger value="project">
            Projects ({suggestions.filter((s) => s.type === "project").length})
          </TabsTrigger>
          <TabsTrigger value="career">
            Career ({suggestions.filter((s) => s.type === "career").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skill" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions
              .filter((s) => s.type === "skill")
              .map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="certification" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions
              .filter((s) => s.type === "certification")
              .map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="project" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions
              .filter((s) => s.type === "project")
              .map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions
              .filter((s) => s.type === "career")
              .map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: AISuggestion }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-purple-100 text-purple-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "skill":
        return Code;
      case "certification":
        return Star;
      case "project":
        return Building;
      case "career":
        return Target;
      case "learning":
        return BookOpen;
      case "networking":
        return Globe;
      default:
        return Zap;
    }
  };

  const TypeIcon = getTypeIcon(suggestion.type);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-[10px]">
                <TypeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {suggestion.type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(suggestion.priority)}>
                {suggestion.priority}
              </Badge>
              <Badge className={getImpactColor(suggestion.impact)}>
                {suggestion.impact} impact
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm">{suggestion.description}</p>

          {/* AI Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>AI Confidence:</span>
              <span className="font-medium">{suggestion.confidence}%</span>
            </div>
            <Progress value={suggestion.confidence} className="h-2" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Timeframe:</span>
              <span className="ml-2 font-medium">{suggestion.timeframe}</span>
            </div>
            <div>
              <span className="text-gray-600">Effort:</span>
              <span className="ml-2 font-medium capitalize">
                {suggestion.effort}
              </span>
            </div>
            {suggestion.estimatedCost && (
              <div>
                <span className="text-gray-600">Cost:</span>
                <span className="ml-2 font-medium">
                  ${suggestion.estimatedCost} {suggestion.currency}
                </span>
              </div>
            )}
            {suggestion.deadline && (
              <div>
                <span className="text-gray-600">Deadline:</span>
                <span className="ml-2 font-medium">
                  {new Date(suggestion.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Reasoning */}
          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="font-medium mb-1">AI Reasoning:</p>
            <p className="text-gray-600">{suggestion.reasoning}</p>
          </div>

          {/* Resources */}
          {suggestion.resources.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Resources:</p>
              <div className="space-y-1">
                {suggestion.resources.slice(0, 2).map((resource, index) => (
                  <div
                    key={index}
                    className="text-sm text-blue-600 flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    {resource}
                  </div>
                ))}
                {suggestion.resources.length > 2 && (
                  <p className="text-sm text-gray-500">
                    +{suggestion.resources.length - 2} more resources
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {suggestion.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button size="sm" className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button size="sm" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Discuss
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
