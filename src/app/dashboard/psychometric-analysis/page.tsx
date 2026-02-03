"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

type PsychometricProfile = {
  evaluationId: string;
  userId: string;
  profileType: string;
  userName?: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  strengths: string[];
  areasForDevelopment: string[];
  personalityProfile: string;
  entrepreneurialFit: {
    overall_fit?: string;
    fit_score?: number;
    mentoring_readiness?: string;
    teaching_style?: string;
    mentoring_capacity?: string;
    expertise_domains?: string[];
    ideal_mentee_profile?: any;
    ideal_role?: string;
    ideal_venture_type?: string;
    risk_tolerance_level?: string;
    validation_focus_areas?: string[];
  };
  recommendations: string[];
  detailedInsights: any;
  completedAt: string;
  profileCompleteness?: number;
  completionRate: number;
};

type UserData = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isPsychometricAnalysisDone?: boolean;
  psychometricScore?: number;
};

export default function InnovatorPsychometricPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || ROLES.INNOVATOR;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [profile, setProfile] = React.useState<PsychometricProfile | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [userData, setUserData] = React.useState<UserData | null>(null);

  // Access control is still role-based
  const isAccessDenied =
    roleParam &&
    ![
      ROLES.INNOVATOR,
      ROLES.MENTOR,
      ROLES.INTERNAL_MENTOR,
      ROLES.TEAM_MEMBER,
      ROLES.INDIVIDUAL_INNOVATOR,
    ].includes(roleParam as any);

  // Get user data including role and isPsychometricAnalysisDone
  React.useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const uid = localStorage.getItem("UserId");

        if (!token || !uid) {
          setLoading(false);
          return;
        }

        console.log("Fetching user data for:", uid);

        const res = await axios.get(`${apiUrl}/api/users/${uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("User data response:", res.data.data);

        if (res.data.data) {
          setUserData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to get user info:", err);
        setError("Failed to load user information");
        setLoading(false);
      }
    };

    getUserData();
  }, [apiUrl]);

  // Fetch psychometric profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!userData) return;

      try {
        const token = localStorage.getItem("token");

        console.log("Fetching psychometric profile...");
        console.log("User role:", userData.role);

        const res = await axios.get(`${apiUrl}/api/psychometric/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Profile response:", res.data);

        if (res.data.success && res.data.data) {
          setProfile(res.data.data as PsychometricProfile);
        } else {
          // No profile found
          setProfile(null);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch psychometric profile:", err);

        if (err.response?.status === 404 || err.response?.data?.data === null) {
          // Profile not found - show CTA
          setProfile(null);
          setLoading(false);
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load profile"
          );
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [apiUrl, userData]);

  if (isAccessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is only available to innovators and mentors.</p>
        </CardContent>
      </Card>
    );
  }

  // Determine display labels based on user role
  const isMentor =
    userData?.role === "mentor" || userData?.role === "internal_mentor";
  const profileTitle = isMentor ? "Mentor" : "Innovator";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Psychometric Profile</CardTitle>
          <CardDescription>
            Understand your unique strengths and mindset as{" "}
            {isMentor ? "a mentor" : "an innovator"}.
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading your psychometric profile...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <CardTitle>Couldn&apos;t load profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      ) : profile ? (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your {profileTitle} Profile</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Completed
              </Badge>
            </CardTitle>
            <CardDescription className="italic">
              {profile.personalityProfile}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Key Traits */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Key Traits</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Overall Score:</span>{" "}
                  <Badge variant="outline">
                    {profile.overallScore.toFixed(1)}/10
                  </Badge>
                </p>
                <p>
                  <span className="text-muted-foreground">Fit Score:</span>{" "}
                  <Badge variant="outline">
                    {profile.entrepreneurialFit.fit_score || 0}%
                  </Badge>
                </p>
                {profile.profileType === "mentor" ? (
                  <>
                    <p>
                      <span className="text-muted-foreground">
                        Teaching Style:
                      </span>{" "}
                      <Badge variant="outline">
                        {profile.entrepreneurialFit.teaching_style || "N/A"}
                      </Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Mentoring Capacity:
                      </span>{" "}
                      <Badge variant="outline">
                        {profile.entrepreneurialFit.mentoring_capacity || "N/A"}
                      </Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Readiness:</span>{" "}
                      <Badge variant="outline">
                        {profile.entrepreneurialFit.mentoring_readiness ||
                          "N/A"}
                      </Badge>
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="text-muted-foreground">
                        Risk Tolerance:
                      </span>{" "}
                      <Badge variant="outline">
                        {profile.entrepreneurialFit.risk_tolerance_level ||
                          "N/A"}
                      </Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Entrepreneurial Fit:
                      </span>{" "}
                      <Badge variant="outline">
                        {profile.entrepreneurialFit.overall_fit || "N/A"}
                      </Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Ideal Role:</span>{" "}
                      <Badge variant="outline">
                        {profile.entrepreneurialFit.ideal_role || "N/A"}
                      </Badge>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">
                Strengths &amp; Growth Areas
              </h4>
              <div className="text-sm">
                <p className="font-medium text-green-600">Strengths:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {profile.strengths && profile.strengths.length > 0 ? (
                    profile.strengths.map((s, idx) => <li key={idx}>{s}</li>)
                  ) : (
                    <li>No strengths data available</li>
                  )}
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium text-red-600">Areas for Growth:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {profile.areasForDevelopment &&
                  profile.areasForDevelopment.length > 0 ? (
                    profile.areasForDevelopment.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))
                  ) : (
                    <li>No development areas data available</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Success Path / Mentoring Focus */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">
                {profile.profileType === "mentor"
                  ? "Mentoring Focus"
                  : "Your Success Path"}
              </h4>
              {profile.profileType === "mentor" ? (
                <>
                  <p className="text-sm">
                    <strong className="font-medium text-foreground">
                      Expertise Domains:
                    </strong>{" "}
                    {profile.entrepreneurialFit.expertise_domains &&
                    profile.entrepreneurialFit.expertise_domains.length > 0
                      ? profile.entrepreneurialFit.expertise_domains.join(", ")
                      : "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong className="font-medium text-foreground">
                      Ideal Mentee Level:
                    </strong>{" "}
                    {profile.entrepreneurialFit.ideal_mentee_profile
                      ?.experience_level || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong className="font-medium text-foreground">
                      Best for:
                    </strong>{" "}
                    {profile.entrepreneurialFit.ideal_mentee_profile
                      ?.challenge_areas || "N/A"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    <strong className="font-medium text-foreground">
                      Focus Areas:
                    </strong>{" "}
                    {profile.entrepreneurialFit.validation_focus_areas &&
                    profile.entrepreneurialFit.validation_focus_areas.length > 0
                      ? profile.entrepreneurialFit.validation_focus_areas.join(
                          ", "
                        )
                      : "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong className="font-medium text-foreground">
                      Venture Type:
                    </strong>{" "}
                    {profile.entrepreneurialFit.ideal_venture_type || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong className="font-medium text-foreground">
                      Key Recommendations:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {profile.recommendations &&
                    profile.recommendations.length > 0 ? (
                      profile.recommendations
                        .slice(0, 3)
                        .map((rec, idx) => <li key={idx}>{rec}</li>)
                    ) : (
                      <li>No recommendations available</li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-primary">
          <CardHeader className="text-center">
            <CardTitle>Unlock Your {profileTitle} Profile</CardTitle>
            <CardDescription>
              Take our quick psychometric assessment to discover your unique
              strengths, work style, and potential.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground max-w-md">
              This analysis helps you understand your natural tendencies and
              provides insights to help you succeed on your journey as{" "}
              {isMentor ? "a mentor" : "an innovator"}.
            </p>
            <Button asChild>
              <Link
                href={`/dashboard/psychometric-analysis/assessment?role=${
                  userData?.role || roleParam
                }`}
              >
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Your Data is Private</CardTitle>
            <CardDescription className="text-xs">
              Your detailed psychometric responses are confidential. Only you
              and authorized administrators can view this summary.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
