"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES, type Role } from "@/lib/constants";
import {
  MOCK_INNOVATOR_USER,
  MOCK_PRINCIPAL_USERS,
  MOCK_MENTORS,
  MOCK_TEAM_MEMBER_USERS,
  MOCK_INTERNAL_MENTOR_USERS,
} from "@/lib/data/auth";
import { MOCK_TTCS } from "@/lib/data/organization";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Logo } from "./icons";
import { CardDescription } from "./ui/card";
import axios from "axios";

const getDashboardLink = (role: Role) => {
  switch (role) {
    case ROLES.INNOVATOR:
      return `/dashboard?role=${role}`;
    case ROLES.INDIVIDUAL_INNOVATOR:
      return `/dashboard?role=${role}`;
    case ROLES.PRINCIPAL:
      return `/dashboard/principal?role=${role}`;
    case ROLES.COORDINATOR:
      return `/dashboard/coordinator?role=${role}`;
    case ROLES.MENTOR:
      return `/dashboard/mentor?role=${role}`;
    case ROLES.TEAM_MEMBER:
    case ROLES.INTERNAL_MENTOR:
      return `/dashboard/member?role=${role}`;
    case ROLES.SUPER_ADMIN:
      return `/dashboard/admin?role=${role}`;
    default:
      return `/dashboard?role=${ROLES.INNOVATOR}`;
  }
};

export function LoginForm({ title }: { title: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password,
      });
      console.log(res);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("collegeId", res.data.user.collegeId);
        localStorage.setItem("UserId", res.data.user.uid);
        console.log(res.data.user);

        toast({
          title: "Login Successful",
          description: `Welcome! Redirecting to the ${res.data.user.role} dashboard.`,
        });
        router.push(getDashboardLink(res.data.user.role));
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Server error. Please try again.",
      });
    }
  };

  // const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   let userRole: Role | null = null;
  //   const lowerCaseEmail = email.toLowerCase();

  //   // Find potential user matches from all mock data sources
  //   const ttcUser = MOCK_TTCS.find(
  //     (t) => t.email.toLowerCase() === lowerCaseEmail
  //   );
  //   const principalUser = MOCK_PRINCIPAL_USERS.find(
  //     (p) => p.email.toLowerCase() === lowerCaseEmail
  //   );
  //   const innovatorUser =
  //     MOCK_INNOVATOR_USER.email.toLowerCase() === lowerCaseEmail
  //       ? MOCK_INNOVATOR_USER
  //       : null;
  //   const mentorUser = MOCK_MENTORS.find(
  //     (m) => m.email.toLowerCase() === lowerCaseEmail
  //   );
  //   const teamMemberUser = MOCK_TEAM_MEMBER_USERS.find(
  //     (m) => m.email.toLowerCase() === lowerCaseEmail
  //   );
  //   const internalMentorUser = MOCK_INTERNAL_MENTOR_USERS.find(
  //     (m) => m.email.toLowerCase() === lowerCaseEmail
  //   );

  //   //   if (lowerCaseEmail === 'admin@pragati.ai' && password === 'superadminpass') {
  //   //     userRole = ROLES.SUPER_ADMIN;
  //   //   } else if (principalUser && principalUser.password === password) {
  //   //     userRole = ROLES.PRINCIPAL;
  //   //   } else if (ttcUser && ttcUser.password === password) {
  //   //     userRole = ROLES.COORDINATOR;
  //   //   } else if (innovatorUser && innovatorUser.password === password) {
  //   //     userRole = ROLES.INNOVATOR;
  //   //   } else if (mentorUser && mentorUser.password === password) {
  //   //     userRole = ROLES.MENTOR;
  //   //   } else if (teamMemberUser && teamMemberUser.password === password) {
  //   //     userRole = ROLES.TEAM_MEMBER;
  //   //   } else if (internalMentorUser && internalMentorUser.password === password) {
  //   //     userRole = ROLES.INTERNAL_MENTOR;
  //   //   }

  //   //   if (userRole) {
  //   //     toast({
  //   //       title: "Login Successful",
  //   //       description: `Welcome! Redirecting to the ${userRole} dashboard.`,
  //   //     });
  //   //     router.push(getDashboardLink(userRole));
  //   //   } else {
  //   //     toast({
  //   //       variant: "destructive",
  //   //       title: "Login Failed",
  //   //       description: "Invalid credentials. Please try again.",
  //   //     });
  //   //   }
  //   // };
  // };
  return (
    <Card className="w-full shadow-2xl">
      <form onSubmit={handleLogin}>
        <CardHeader>
          <div className="relative flex flex-col items-center text-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="absolute top-0 left-0 z-10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Logo className="mb-4 h-12 w-12 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-headline">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground text-balance">
              Fostering the next generation of innovation in education.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@pragati.ai"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              >
                Forgot Username?
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full">
            <span>Login</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
