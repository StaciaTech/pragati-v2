"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lightbulb, Mail, BrainCircuit } from "lucide-react";
import {
  MOCK_TEAM_MEMBER_USERS,
  MOCK_INTERNAL_MENTOR_USERS,
} from "@/lib/data/auth";
import { ROLES } from "@/lib/constants";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function MemberDashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  // const user = role === ROLES.TEAM_MEMBER ? MOCK_TEAM_MEMBER_USERS[0] : MOCK_INTERNAL_MENTOR_USERS[0];
  const { data: user, isLoading, refetch } = useUserProfile();
  console.log(user);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}!</CardTitle>
          <CardDescription>
            This is your personal dashboard. From here, you can manage your
            ideas, invites, and personal settings.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-primary" /> My Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View the ideas you are a part of.
            </p>
            <Button asChild className="w-full">
              <Link href={`/dashboard/member/my-ideas?role=${role}`}>
                Go to My Ideas
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="text-primary" /> Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage your pending invitations.
            </p>
            <Button asChild className="w-full">
              <Link href={`/dashboard/member/invites?role=${role}`}>
                Manage Invites
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="text-primary" /> Psychometric Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete your analysis to join teams.
            </p>
            <Button asChild className="w-full">
              <Link href={`/dashboard/psychometric-analysis?role=${role}`}>
                Go to Analysis
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
