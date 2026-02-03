"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  Target,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface PsychometricScores {
  leadership: number;
  risk_tolerance: number;
  resilience: number;
  innovation: number;
  decision_making: number;
  emotional_intelligence: number;
  persistence: number;
  strategic_thinking: number;
  communication: number;
  problem_solving: number;
}

interface DetailedInsights {
  leadership_style: string;
  decision_making_pattern: string;
  stress_response: string;
  growth_potential: string;
  team_dynamics: string;
  unique_qualities: string;
}

interface InnovatorInsight {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year: string;
  psychometricScores: PsychometricScores;
  overallScore: number;
  entrepreneurialFit: string;
  fitScore: number;
  idealRole: string;
  idealVentureType: string;
  topStrengths: string[];
  developmentAreas: string[];
  personalityProfile: string;
  riskToleranceLevel: string;
  detailedInsights: DetailedInsights;
  recommendations: string[];
  validationFocusAreas: string[];
  assessmentDate: string;
  lastUpdated: string;
  profileCompleteness: number;
}

const getFitBadgeColor = (fit: string) => {
  switch (fit.toLowerCase()) {
    case "high":
      return "bg-green-500 text-white";
    case "medium":
      return "bg-yellow-500 text-white";
    case "low":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getRiskBadgeColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-blue-500 text-white";
    case "low":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export default function InnovatorInsightsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const token = getToken();

  // Fetch innovator insights
  const { data, isLoading, error } = useQuery({
    queryKey: ["innovator-insights", searchTerm],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/admin/innovators/psychometric-insights`,
        {
          params: { search: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: !!token,
  });

  const innovators: InnovatorInsight[] = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading innovator insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-red-500">
          <p>Failed to load innovator insights. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Innovator Psychometric Insights
              </CardTitle>
              <CardDescription>
                Comprehensive psychometric analysis and entrepreneurial fit
                assessment for {innovators.length} innovators
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg">
              {innovators.length} Profiles
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by innovator name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Innovator Cards */}
      {innovators.map((innovator) => (
        <Card key={innovator.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{innovator.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {innovator.email}
                  {innovator.department && (
                    <span>• {innovator.department}</span>
                  )}
                  {innovator.year && <span>• Year {innovator.year}</span>}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  className={getFitBadgeColor(innovator.entrepreneurialFit)}
                >
                  {innovator.entrepreneurialFit} Fit ({innovator.fitScore}%)
                </Badge>
                <Badge
                  className={getRiskBadgeColor(innovator.riskToleranceLevel)}
                >
                  {innovator.riskToleranceLevel} Risk
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Psychometric Score</span>
                <span className="font-bold">
                  {(innovator.overallScore * 10).toFixed(1)}/10
                </span>
              </div>
              <Progress value={innovator.overallScore * 10} className="h-2" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ideal Role & Venture */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Ideal Profile
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Role:</span>{" "}
                    <Badge variant="outline">{innovator.idealRole}</Badge>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Venture:</span>{" "}
                    <Badge variant="outline">
                      {innovator.idealVentureType}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  Top Strengths
                </h4>
                <ul className="text-sm space-y-1">
                  {innovator.topStrengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-600">•</span>
                      <span className="text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Development Areas */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-600">
                  <TrendingDown className="w-4 h-4" />
                  Development Areas
                </h4>
                <ul className="text-sm space-y-1">
                  {innovator.developmentAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-orange-600">•</span>
                      <span className="text-muted-foreground">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Validation Focus */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Validation Focus
                </h4>
                <ul className="text-sm space-y-1">
                  {innovator.validationFocusAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span>•</span>
                      <span className="text-muted-foreground">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Personality Profile */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm">Personality Profile</h4>
              <p className="text-sm text-muted-foreground italic">
                "{innovator.personalityProfile}"
              </p>
            </div>

            {/* Detailed Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Behavioral Insights</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium text-xs text-muted-foreground">
                      Leadership Style
                    </p>
                    <p>{innovator.detailedInsights.leadership_style}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground">
                      Decision Making
                    </p>
                    <p>{innovator.detailedInsights.decision_making_pattern}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground">
                      Stress Response
                    </p>
                    <p>{innovator.detailedInsights.stress_response}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">
                  Growth & Team Dynamics
                </h4>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium text-xs text-muted-foreground">
                      Growth Potential
                    </p>
                    <p>{innovator.detailedInsights.growth_potential}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground">
                      Team Dynamics
                    </p>
                    <p>{innovator.detailedInsights.team_dynamics}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground">
                      Unique Qualities
                    </p>
                    <p>{innovator.detailedInsights.unique_qualities}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {innovator.recommendations.length > 0 && (
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  AI Recommendations
                </h4>
                <ul className="text-sm space-y-1">
                  {innovator.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">
                        →
                      </span>
                      <span className="text-blue-900 dark:text-blue-100">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Psychometric Scores Bar */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">
                Psychometric Scores Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(innovator.psychometricScores).map(
                  ([key, value]) => {
                    if (value === 0) return null; // Skip zero scores
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize text-muted-foreground">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-medium">
                            {value.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={value * 10} className="h-1.5" />
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
              <span>
                Assessment Date:{" "}
                {new Date(innovator.assessmentDate).toLocaleDateString()}
              </span>
              <span>
                Profile Completeness: {innovator.profileCompleteness}%
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Empty State */}
      {innovators.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              No psychometric insights available
            </p>
            <p className="text-sm">
              {searchTerm
                ? "No innovators match your search criteria"
                : "No innovators have completed psychometric analysis yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
