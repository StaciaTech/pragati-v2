"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  Landmark,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import Lottie from "lottie-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PragathiLogo from "../vencorplogo.png";

export default function SignupPage() {
  const router = useRouter();
  const [animationData, setAnimationData] = React.useState(null);

  React.useEffect(() => {
    fetch(
      "https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json"
    )
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  const selectionOptions = [
    {
      icon: UserIcon,
      title: "As an Individual Innovator",
      description:
        "Sign up to submit your ideas, build a team, and get AI-powered feedback.",
      href: "/signup/individual",
    },
    {
      icon: Star,
      title: "As an External Mentor",
      description:
        "Join as an expert to guide high-potential ideas and shape the future of innovation.",
      href: "/signup/individual?role=mentor",
    },
    {
      icon: Building,
      title: "For an Existing Institution / Org",
      description:
        "Join your organization or college that is already on the PragatiAI platform.",
      href: "/signup/join-organization",
    },
    {
      icon: Landmark,
      title: "Register a New Institution / Org",
      description:
        "Onboard your entire organization or college to manage your innovation ecosystem.",
      href: "/signup/register-organization",
    },
  ];

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background lg:grid lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative hidden h-full flex-col items-center justify-center p-10 text-white dark:border-r lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-indigo-600 opacity-80" />
        {animationData && (
          <Lottie
            animationData={animationData}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="relative z-10 m-auto flex flex-col items-center text-center backdrop-blur-lg bg-black/30 p-8 rounded-2xl border border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold">Join the Innovation Revolution</h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-md text-balance">
            Select your path and start transforming ideas into reality today.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <Card className="shadow-2xl">
            <CardHeader>
              <div className="relative flex flex-col items-center text-center mb-4">
                <Button
                  variant="ghost"
                  asChild
                  className="absolute -top-2 -left-2 z-10"
                >
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <Image
                  src={PragathiLogo}
                  alt="Picture of the author"
                  className="h-12 w-12 text-primary mb-4"
                />
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
                  Create Your Account
                </h1>
              </div>
              <CardDescription className="text-center">
                How would you like to join PragatiAI?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectionOptions.map((option, i) => (
                <motion.div
                  key={option.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={option.href} className="block group">
                    <div className="p-4 border rounded-lg flex items-center gap-4 transition-all hover:border-primary hover:bg-muted/50 cursor-pointer">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <option.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{option.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
