"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
// ... rest of imports

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// ✅ Separate the component that uses useSearchParams
function CredentialsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgName = searchParams.get("org");
  const userType = searchParams.get("userType");
  const [animationData, setAnimationData] = React.useState(null);

  React.useEffect(() => {
    import("lottie-react").then(() => {
      fetch(
        "https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json"
      )
        .then((res) => res.json())
        .then((data) => setAnimationData(data));
    });
  }, []);

  const getTitle = () => {
    if (userType === "Innovators") {
      return "Innovator Login";
    }
    if (orgName) {
      return `Pragati for ${orgName}`;
    }
    return "Welcome to PragatiAI";
  };

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
          <h2 className="text-4xl font-bold">Catalyze Innovation</h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-md text-balance">
            Transform your groundbreaking ideas into viable solutions with our
            AI-powered validation engine.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <LoginForm title={getTitle()} />
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            © 2025 Pragati by Vencorp a Unit of Stacia Corp
          </p>
        </div>
      </div>
    </main>
  );
}

// ✅ Main export with Suspense wrapper
export default function CredentialsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <CredentialsContent />
    </Suspense>
  );
}
