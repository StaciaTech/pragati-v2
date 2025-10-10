"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
// ... rest of imports

/* ----------  CLIENT COMPONENT THAT READS PARAMS  ---------- */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ This is fine inside Suspense

  const [userType, setUserType] = React.useState<string>("organisations");
  const [step, setStep] = React.useState<"select_type" | "select_org">(
    "select_type"
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = React.useState<string>("");

  const orgs = MOCK_COLLEGES;

  const handleTypeSelect = (type: string) => {
    setUserType(type);
    const ideaTitle = searchParams.get("title");
    const ideaDescription = searchParams.get("description");
    const query = new URLSearchParams();
    if (ideaTitle) query.set("title", ideaTitle);
    if (ideaDescription) query.set("description", ideaDescription);

    if (type === "innovator") {
      router.push(`/login/credentials?userType=Innovator&${query.toString()}`);
    } else {
      setStep("select_org");
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background lg:grid lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative hidden h-full flex-col items-center justify-center p-10 text-white dark:border-r lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-indigo-600 opacity-80" />
        <LottieAnimation />
        <QuoteCarousel />
      </div>

      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <SelectionCard
            step={step}
            userType={userType}
            setStep={setStep}
            handleTypeSelect={handleTypeSelect}
            popoverOpen={popoverOpen}
            setPopoverOpen={setPopoverOpen}
            selectedOrg={selectedOrg}
            orgs={orgs}
          />
          <Footer />
        </div>
      </div>
    </main>
  );
}

/* ----------  SERVER PAGE COMPONENT  ---------- */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

/* ----------  HELPER COMPONENTS  ---------- */
function LottieAnimation() {
  const [animationData, setAnimationData] = React.useState(null);
  React.useEffect(() => {
    import("lottie-react").then(() =>
      fetch(
        "https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json"
      )
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
    );
  }, []);

  if (!animationData) return null;
  const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
  return (
    <Lottie
      animationData={animationData}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

function QuoteCarousel() {
  const quotes = [
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
    },
    {
      text: "The value of an idea lies in the using of it.",
      author: "Thomas Edison",
    },
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % quotes.length), 7000);
    return () => clearInterval(id);
  }, []);

  const { text, author } = quotes[idx];
  return (
    <div className="relative z-10 w-full max-w-2xl backdrop-blur-xl bg-black/30 p-8 rounded-2xl border border-white/20 shadow-2xl">
      <div className="text-center">
        <div className="flex flex-col items-center">
          <Quote className="h-8 w-8 text-primary-foreground/50 mb-4" />
          <p className="text-2xl font-semibold text-balance">"{text}"</p>
          <p className="mt-2 text-lg text-primary-foreground/80">- {author}</p>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-8">
        {[
          { value: 1248, label: "Ideas Validated", icon: <Lightbulb /> },
          { value: 85, label: "Startups Funded", icon: <TrendingUp /> },
          { value: 4300, label: "Innovators Joined", icon: <Users /> },
        ].map((s, i) => (
          <AnimatedStat key={s.label} {...s} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

function AnimatedStat({
  value,
  label,
  icon,
  delay = 0,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const animate = (t: number) => {
      const p = Math.min((t - (performance.now() - start)) / 2000, 1);
      setCount(Math.floor(p * (value - 0) + 0));
      if (p < 1) requestAnimationFrame(animate);
    };
    const start = performance.now();
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
        {icon} {count.toLocaleString()}
      </div>
      <p className="text-sm text-primary-foreground/80">{label}</p>
    </div>
  );
}

function SelectionCard({
  step,
  userType,
  setStep,
  handleTypeSelect,
  popoverOpen,
  setPopoverOpen,
  selectedOrg,
  orgs,
}: any) {
  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <div className="relative flex flex-col items-center text-center mb-4">
          {step === "select_type" && (
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
          )}
          {step === "select_org" && (
            <Button
              variant="ghost"
              onClick={() => setStep("select_type")}
              className="absolute -top-2 -left-2 z-10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Logo className="mb-4 h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
            Login Selection
          </h1>
        </div>
        <CardDescription className="text-center">
          {step === "select_type"
            ? "First, tell us what type of user you are."
            : `Find your organization from the list below to proceed.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* buttons / popover identical to your code */}
      </CardContent>
    </Card>
  );
}

function Footer() {
  return (
    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
      © 2025 Pragati by Vencorp a Unit of Stacia Corp
    </p>
  );
}
