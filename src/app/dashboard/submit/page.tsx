"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FileUp,
  BrainCircuit,
  UserPlus,
  Send,
  History,
  Check,
  TriangleAlert,
  X,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Lottie from "lottie-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperTrigger,
  useStepper,
} from "@/components/ui/stepper";
import { SpiderChart } from "@/components/spider-chart";
import { INITIAL_CLUSTER_WEIGHTS } from "@/lib/data/reports";
import { MOCK_TTCS, MOCK_INNOVATORS } from "@/lib/data/organization";
import { MOCK_INNOVATOR_USER } from "@/lib/data/auth";
import { MOCK_DOMAINS_WITH_SUBDOMAINS } from "@/lib/data/platform";
import { useToast } from "@/hooks/use-toast";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- SCHEMA & PRESETS ---
const clusterKeys = Object.keys(INITIAL_CLUSTER_WEIGHTS);
const weightageSchema = clusterKeys.reduce(
  (acc, key) => ({ ...acc, [key]: z.number().min(0).max(100) }),
  {} as Record<string, z.ZodNumber>
);

const submitIdeaSchema = z
  .object({
    ...weightageSchema,
    preset: z.string().default("Balanced"),
    title: z.string().min(1, "Title is required."),
    coreTeam: z.string().optional(),
    invitedTeam: z.array(z.string()).optional(),
    mentor: z.string().min(1, "A mentor must be selected."),
    domain: z.string().min(1, "Project domain is required."),
    subDomain: z.string().optional(),
    otherDomain: z.string().optional(),
    cityOrVillage: z.string().optional(),
    locality: z.string().optional(),
    concept: z.string().min(1, "Core concept is required."),
    trl: z.string().min(1, "TRL is required."),
    background: z.string().min(1, "Background is required."),
    pptFile: z
      .any()
      .refine((files) => files?.[0], "PPT file is required.")
      .refine(
        (files) =>
          files?.[0]?.name?.endsWith(".ppt") ||
          files?.[0]?.name?.endsWith(".pptx"),
        "Please upload a .ppt or .pptx file."
      ),
  })
  .refine(
    (data) => {
      if (data.domain === "Other") {
        return !!data.otherDomain && data.otherDomain.length > 0;
      }
      return true;
    },
    {
      message: "Please specify your domain",
      path: ["otherDomain"],
    }
  )
  .refine(
    (data) => {
      const selectedDomain = MOCK_DOMAINS_WITH_SUBDOMAINS.find(
        (d) => d.name === data.domain
      );
      if (selectedDomain && selectedDomain.subDomains.length > 0) {
        return !!data.subDomain && data.subDomain.length > 0;
      }
      return true;
    },
    {
      message: "Please select a sub-domain.",
      path: ["subDomain"],
    }
  )
  .refine(
    (data) => {
      if (data.domain === "Retail") {
        return !!data.cityOrVillage && data.cityOrVillage.length > 0;
      }
      return true;
    },
    {
      message: "Please select a city or village for the Retail domain",
      path: ["cityOrVillage"],
    }
  );

type SubmitIdeaForm = z.infer<typeof submitIdeaSchema>;

const defaultValues: Partial<SubmitIdeaForm> = {
  ...INITIAL_CLUSTER_WEIGHTS,
  preset: "Balanced",
  title: "",
  coreTeam: "",
  invitedTeam: [],
  mentor: "",
  domain: "",
  subDomain: "",
  otherDomain: "",
  cityOrVillage: "",
  locality: "",
  concept: "",
  trl: "",
  background: "",
  pptFile: undefined,
};

const presets = {
  "Impact-First": {
    "Core Idea & Innovation": 15,
    "Market & Commercial Opportunity": 10,
    "Execution & Operations": 10,
    "Business Model & Strategy": 10,
    "Team & Organizational Health": 10,
    "External Environment & Compliance": 25,
    "Risk & Future Outlook": 20,
  },
  "Scale-Up": {
    "Core Idea & Innovation": 15,
    "Market & Commercial Opportunity": 30,
    "Execution & Operations": 20,
    "Business Model & Strategy": 20,
    "Team & Organizational Health": 5,
    "External Environment & Compliance": 5,
    "Risk & Future Outlook": 5,
  },
  Disruptor: {
    "Core Idea & Innovation": 35,
    "Market & Commercial Opportunity": 15,
    "Execution & Operations": 20,
    "Business Model & Strategy": 10,
    "Team & Organizational Health": 5,
    "External Environment & Compliance": 5,
    "Risk & Future Outlook": 10,
  },
  Balanced: INITIAL_CLUSTER_WEIGHTS,
};
const clusters = Object.keys(INITIAL_CLUSTER_WEIGHTS);

const trlLevels = [
  {
    phase: "Phase 1: Research (TRL 1–3)",
    levels: [
      {
        value: "TRL 1",
        title: "TRL 1: Basic Principles Observed",
        description:
          "Scientific research is conducted, principles are postulated and observed, with the application being largely theoretical.",
      },
      {
        value: "TRL 2",
        title: "TRL 2: Technology Concept Formulated",
        description:
          "Practical applications are identified, but no experimental proof exists yet. This stage is focused on applied research.",
      },
      {
        value: "TRL 3",
        title: "TRL 3: Experimental Proof of Concept",
        description:
          "Active R&D begins, involving laboratory studies and measurements to validate analytical predictions.",
      },
    ],
  },
  {
    phase: "Phase 2: Development and Demonstration (TRL 4–7)",
    levels: [
      {
        value: "TRL 4",
        title: "TRL 4: Technology Validated in Lab",
        description:
          'Individual components are integrated and tested in a controlled laboratory setting to create an "alpha prototype".',
      },
      {
        value: "TRL 5",
        title: "TRL 5: Technology Validated in Relevant Environment",
        description:
          "Components are validated in a simulated environment relevant to its intended operational conditions.",
      },
      {
        value: "TRL 6",
        title: "TRL 6: Technology Demonstrated in Relevant Environment",
        description:
          "A working, full-scale prototype is tested in a relevant (but simulated) environment.",
      },
      {
        value: "TRL 7",
        title:
          "TRL 7: System Prototype Demonstration in Operational Environment",
        description:
          "The full prototype is demonstrated in a real-world, operational setting.",
      },
    ],
  },
  {
    phase: "Phase 3: Deployment (TRL 8–9)",
    levels: [
      {
        value: "TRL 8",
        title: "TRL 8: System Complete and Qualified",
        description:
          "The final technology has been developed, tested, and qualified to be ready for commercial production.",
      },
      {
        value: "TRL 9",
        title: "TRL 9: Actual System Proven in Operational Environment",
        description:
          "The technology is proven through successful, long-term operations in its final commercial environment.",
      },
    ],
  },
];

// --- Form Wrapper Component ---
function SubmitIdeaForm({
  form,
  setMentorApproved,
  mentorApproved,
  isSubmitting,
}: {
  form: any;
  setMentorApproved: (isApproved: boolean) => void;
  mentorApproved: boolean;
  isSubmitting: boolean;
}) {
  const stepper = useStepper();

  const handleSaveDraft = () => {
    const formData = form.getValues();
    localStorage.setItem("ideaDraft", JSON.stringify(formData));
    toast({
      title: "Draft Saved! 💾",
      description: "Your idea progress has been saved locally.",
    });
  };

  const founder = MOCK_INNOVATOR_USER;
  const invitedTeamEmails = form.watch("invitedTeam") || [];
  const founderReady = founder.hasPsychometricAnalysis;
  const pendingMembers = invitedTeamEmails
    .map((email: string) => MOCK_INNOVATORS.find((u) => u.email === email))
    .filter((user: any) => user && !user.hasPsychometricAnalysis)
    .map((user: any) => user.name);

  const teamReady = pendingMembers.length === 0;

  return (
    <>
      <StepperItem index={0}>
        <StepperTrigger>
          <CardTitle>Idea Basics</CardTitle>
          <CardDescription>
            Tell us about your project and team.
          </CardDescription>
        </StepperTrigger>
        <StepperContent>
          <Step1Content
            form={form}
            next={stepper.next}
            handleSaveDraft={handleSaveDraft}
          />
        </StepperContent>
      </StepperItem>

      <StepperItem index={1}>
        <StepperTrigger>
          <CardTitle>Internal mentor assignment</CardTitle>
          <CardDescription>
            Select a mentor for guidance and approval.
          </CardDescription>
        </StepperTrigger>
        <StepperContent>
          <Step2Content
            form={form}
            next={stepper.next}
            prev={stepper.prev}
            setMentorApproved={setMentorApproved}
            mentorApproved={mentorApproved}
            handleSaveDraft={handleSaveDraft}
          />
        </StepperContent>
      </StepperItem>

      <StepperItem index={2}>
        <StepperTrigger>
          <CardTitle>Idea Settings - Cluster Weightage</CardTitle>
          <CardDescription>
            Adjust weights to match your idea's focus.
          </CardDescription>
        </StepperTrigger>
        <StepperContent>
          <Step3Content
            form={form}
            next={stepper.next}
            prev={stepper.prev}
            handleSaveDraft={handleSaveDraft}
          />
        </StepperContent>
      </StepperItem>

      <StepperItem index={3}>
        <StepperTrigger>
          <CardTitle>Deep Dive</CardTitle>
          <CardDescription>
            Provide core details about your idea.
          </CardDescription>
        </StepperTrigger>
        <StepperContent>
          <Step4Content
            form={form}
            next={stepper.next}
            prev={stepper.prev}
            handleSaveDraft={handleSaveDraft}
          />
        </StepperContent>
      </StepperItem>

      <StepperItem index={4}>
        <StepperTrigger>
          <CardTitle>Uploads</CardTitle>
          <CardDescription>Provide your pitch deck.</CardDescription>
        </StepperTrigger>
        <StepperContent>
          <Step5Content
            form={form}
            next={stepper.next}
            prev={stepper.prev}
            handleSaveDraft={handleSaveDraft}
          />
        </StepperContent>
      </StepperItem>

      <StepperItem index={5}>
        <StepperTrigger>
          <CardTitle>Review & Submit</CardTitle>
          <CardDescription>
            Confirm your details before final submission.
          </CardDescription>
        </StepperTrigger>
        <StepperContent>
          <Step6Content
            form={form}
            prev={stepper.prev}
            isSubmitting={isSubmitting}
            mentorApproved={mentorApproved}
            handleSaveDraft={handleSaveDraft}
            founderReady={founderReady}
            teamReady={teamReady}
            pendingMembers={pendingMembers}
          />
        </StepperContent>
      </StepperItem>
    </>
  );
}

// --- STEPS ---
const Step1Content = ({
  form,
  next,
  handleSaveDraft,
}: {
  form: any;
  next: () => void;
  handleSaveDraft: () => void;
}) => {
  const { toast } = useToast();
  const invitedTeamEmails = form.watch("invitedTeam") || [];
  const founder = MOCK_INNOVATOR_USER;

  const handleInvite = () => {
    const email = form.getValues("coreTeam");
    if (!email) return;

    const emailSchema = z.string().email("Please enter a valid email address.");
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: result.error.errors[0].message,
      });
      return;
    }

    if (invitedTeamEmails.includes(email) || email === founder.email) {
      toast({
        variant: "destructive",
        title: "Already on Team",
        description: `${email} is already part of the team.`,
      });
      return;
    }

    let invitedUser = MOCK_INNOVATORS.find((inv) => inv.email === email);
    if (!invitedUser) {
      const newUser = {
        id: `INV_NEW_${Math.random().toString(36).substr(2, 5)}`,
        name: email.split("@")[0],
        email: email,
        collegeId: founder.college,
        credits: 0,
        status: "Active",
        hasPsychometricAnalysis: false,
      };
      MOCK_INNOVATORS.push(newUser);
    }

    const newInvitedTeam = [...invitedTeamEmails, email];
    form.setValue("invitedTeam", newInvitedTeam);
    form.setValue("coreTeam", "");

    toast({
      title: "Invite Sent!",
      description: `An invitation has been sent to ${email}.`,
    });
  };

  const handleRevoke = (emailToRevoke: string) => {
    const newInvitedTeam = invitedTeamEmails.filter(
      (email: string) => email !== emailToRevoke
    );
    form.setValue("invitedTeam", newInvitedTeam);
    toast({
      title: "Invite Revoked",
      description: `The invitation for ${emailToRevoke} has been revoked.`,
    });
  };

  const getInitials = (email: string) => {
    const user = MOCK_INNOVATORS.find((u) => u.email === email);
    return user
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : (email.charAt(0) || "").toUpperCase();
  };

  return (
    <>
      <div className="space-y-6 py-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idea Title ✍️</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., AI-Powered Crop Disease Detection"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coreTeam"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Core Team</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Enter team member's email to invite"
                    {...field}
                  />
                </FormControl>
                <Button type="button" variant="outline" onClick={handleInvite}>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite
                </Button>
              </div>
              <FormDescription>
                Only participants who completed Psychometric Analysis are
                eligible.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {(invitedTeamEmails.length > 0 || founder) && (
          <div className="space-y-2">
            <FormLabel>Current Team</FormLabel>
            <div className="flex flex-wrap gap-2">
              {[founder.email, ...invitedTeamEmails].map((email: string) => {
                const user = MOCK_INNOVATORS.find((u) => u.email === email);
                const hasAnalysis = user?.hasPsychometricAnalysis;
                return (
                  <TooltipProvider key={email}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium">
                          <Avatar className="h-6 w-6 text-xs">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${email}.png`}
                              alt={email}
                            />
                            <AvatarFallback>
                              {getInitials(email)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user?.name || email}</span>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              hasAnalysis ? "bg-green-500" : "bg-red-500"
                            )}
                          ></span>
                          {email !== founder.email && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(email)}
                              className="ml-1 rounded-full p-0.5 text-secondary-foreground/70 hover:bg-secondary-foreground/20 hover:text-secondary-foreground transition-colors"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">
                                Revoke invite for {email}
                              </span>
                            </button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {hasAnalysis
                            ? "Psychometric analysis completed."
                            : "Awaiting psychometric analysis."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <Button type="button" variant="secondary" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={async () => {
            if (await form.trigger(["title"])) next();
          }}
        >
          Next
        </Button>
      </div>
    </>
  );
};

const Step2Content = ({
  form,
  next,
  prev,
  setMentorApproved,
  mentorApproved,
  handleSaveDraft,
}: {
  form: any;
  next: () => void;
  prev: () => void;
  setMentorApproved: (isApproved: boolean) => void;
  mentorApproved: boolean;
  handleSaveDraft: () => void;
}) => {
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestApproval = () => {
    setIsRequesting(true);
    toast({
      title: "Request Sent!",
      description: "An approval request has been sent to your selected mentor.",
    });
    setTimeout(() => {
      setMentorApproved(true);
      setIsRequesting(false);
      toast({
        title: "Mentor Approved!",
        description: "Your mentor has approved the idea. You can now proceed.",
      });
    }, 2000);
  };

  return (
    <>
      <div className="space-y-6 py-6">
        <FormField
          control={form.control}
          name="mentor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Mentor (Required)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor from the database" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_TTCS.map((ttc) => (
                    <SelectItem key={ttc.id} value={ttc.name}>
                      {ttc.name} - ({ttc.expertise.join(", ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          onClick={handleRequestApproval}
          disabled={
            isRequesting || mentorApproved || form.watch("mentor") === ""
          }
        >
          {isRequesting ? (
            <>
              <History className="mr-2 h-4 w-4 animate-spin" />
              Awaiting Approval...
            </>
          ) : mentorApproved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Mentor Approved
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Request Mentor Approval
            </>
          )}
        </Button>
        <FormDescription>
          The "Next" button will be enabled once your mentor approves.
        </FormDescription>
      </div>
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={prev}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={async () => {
              if (await form.trigger(["mentor"])) next();
            }}
            disabled={!mentorApproved}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

const Step3Content = ({
  form,
  next,
  prev,
  handleSaveDraft,
}: {
  form: any;
  next: () => void;
  prev: () => void;
  handleSaveDraft: () => void;
}) => {
  const { toast } = useToast();
  const preset = form.watch("preset");
  const totalWeight = clusters.reduce(
    (acc, cluster) => acc + Math.round(form.getValues(cluster) || 0),
    0
  );

  const handlePresetChange = (presetKey: keyof typeof presets | "Manual") => {
    form.setValue("preset", presetKey);
    if (presetKey !== "Manual") {
      const presetValues = presets[presetKey as keyof typeof presets];
      Object.entries(presetValues).forEach(([key, value]) => {
        form.setValue(key, value);
      });
    }
  };

  const handleNext = () => {
    if (preset === "Manual" && totalWeight !== 100) {
      toast({
        variant: "destructive",
        title: "Weightage Error",
        description: `Total weightage must be 100%. Current: ${totalWeight}%`,
      });
      return;
    }
    next();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
        <div className="w-full space-y-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.keys(presets).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={preset === p ? "default" : "outline"}
                onClick={() => handlePresetChange(p as keyof typeof presets)}
              >
                {p}
              </Button>
            ))}
            <Button
              size="sm"
              variant={preset === "Manual" ? "default" : "outline"}
              onClick={() => handlePresetChange("Manual")}
            >
              Manual 🛠️
            </Button>
          </div>
          {preset === "Manual" && (
            <Alert
              variant="default"
              className="border-orange-500/50 text-orange-700 dark:text-orange-300"
            >
              <TriangleAlert className="h-4 w-4 !text-orange-600" />
              <AlertTitle>Expert Mode Activated</AlertTitle>
              <AlertDescription>
                You are in full control. Adjust sliders to set weights.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {clusters.map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{key}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[field.value || 0]}
                          onValueChange={(v) => field.onChange(v[0])}
                          max={100}
                          step={1}
                          disabled={preset !== "Manual"}
                        />
                        <Input
                          type="number"
                          className="w-20 text-center"
                          value={Math.round(field.value || 0)}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                          min="0"
                          max="100"
                          disabled={preset !== "Manual"}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <div
            className={cn(
              "relative text-sm font-medium p-3 border rounded-lg flex justify-between items-center",
              totalWeight === 100 ? "border-green-500" : "border-red-500"
            )}
          >
            <span>Total Weight:</span>
            <span className="font-bold text-xl">{totalWeight}%</span>
          </div>
        </div>
        <div className="w-full h-[500px] bg-background rounded-lg p-4 flex items-center justify-center">
          <SpiderChart data={form.getValues()} size={500} />
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prev}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

const Step4Content = ({
  form,
  next,
  prev,
  handleSaveDraft,
}: {
  form: any;
  next: () => void;
  prev: () => void;
  handleSaveDraft: () => void;
}) => {
  const domain = form.watch("domain");
  const cityOrVillage = form.watch("cityOrVillage");
  const selectedDomainData = MOCK_DOMAINS_WITH_SUBDOMAINS.find(
    (d) => d.name === domain
  );
  React.useEffect(() => {
    form.setValue("subDomain", "");
  }, [domain, form]);

  return (
    <>
      <div className="space-y-6 py-6">
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain of Project</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOCK_DOMAINS_WITH_SUBDOMAINS.map((domainData) => (
                    <SelectItem key={domainData.name} value={domainData.name}>
                      {domainData.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedDomainData && selectedDomainData.subDomains.length > 0 && (
          <FormField
            control={form.control}
            name="subDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Domain of Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sub-domain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedDomainData.subDomains.map((subDomain) => (
                      <SelectItem key={subDomain} value={subDomain}>
                        {subDomain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {domain === "Other" && (
          <FormField
            control={form.control}
            name="otherDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please specify the domain</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sustainable Fashion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {domain === "Retail" && (
          <>
            <FormField
              control={form.control}
              name="cityOrVillage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City or village</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city or village" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {cityOrVillage && (
              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locality</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Bandra West, Connaught Place"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        <FormField
          control={form.control}
          name="concept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Core Concept</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the problem, solution, and target audience."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="trl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current TRL (Technology Readiness Level)</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-1"
                >
                  <Accordion type="single" collapsible className="w-full">
                    {trlLevels.map((phase) => (
                      <AccordionItem value={phase.phase} key={phase.phase}>
                        <AccordionTrigger>{phase.phase}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-4">
                            {phase.levels.map((level) => (
                              <FormItem
                                key={level.value}
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem value={level.value} />
                                </FormControl>
                                <div className="space-y-1">
                                  <FormLabel className="font-normal">
                                    {level.title}
                                  </FormLabel>
                                  <FormDescription>
                                    {level.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Validation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How did your personal background, skills, or experiences inspire this specific idea?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prev}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={async () => {
              if (
                await form.trigger([
                  "domain",
                  "subDomain",
                  "concept",
                  "trl",
                  "background",
                  "cityOrVillage",
                ])
              )
                next();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

const Step5Content = ({
  form,
  next,
  prev,
  handleSaveDraft,
}: {
  form: any;
  next: () => void;
  prev: () => void;
  handleSaveDraft: () => void;
}) => {
  return (
    <>
      <div className="space-y-6 py-6">
        <FormField
          control={form.control}
          name="pptFile"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Pitch Deck Upload</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="file"
                    className="pl-10"
                    accept=".ppt, .pptx"
                    onChange={(e) => onChange(e.target.files)}
                    {...rest}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Sample template provided 📑.{" "}
                <Link href="#">Download here.</Link>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prev}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={async () => {
              if (await form.trigger(["pptFile"])) next();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

const Step6Content = ({
  form,
  prev,
  isSubmitting,
  mentorApproved,
  handleSaveDraft,
  founderReady,
  teamReady,
  pendingMembers,
}: {
  form: any;
  prev: () => void;
  isSubmitting: boolean;
  mentorApproved: boolean;
  handleSaveDraft: () => void;
  founderReady: boolean;
  teamReady: boolean;
  pendingMembers: string[];
}) => {
  const allValues = form.getValues();
  const weights = clusters.reduce(
    (acc, key) => ({ ...acc, [key]: allValues[key] }),
    {}
  );
  const canSubmit = founderReady && teamReady && mentorApproved;

  return (
    <>
      <div className="space-y-6 py-6">
        {!founderReady && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required!</AlertTitle>
            <AlertDescription>
              You must complete your own psychometric analysis before submitting
              an idea.
              <Link
                href={`/dashboard/psychometric-analysis?role=${ROLES.INNOVATOR}`}
                className="font-bold underline ml-2"
              >
                Take the Assessment Now
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {founderReady && !teamReady && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Waiting for Team Members</AlertTitle>
            <AlertDescription>
              The idea will be automatically submitted once the following team
              members complete their analysis: {pendingMembers.join(", ")}.
              Reminders will be sent.
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Idea Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <span className="font-medium text-muted-foreground">Title:</span>{" "}
              {allValues.title}
            </p>
            <p>
              <span className="font-medium text-muted-foreground">Mentor:</span>{" "}
              {allValues.mentor}
            </p>
            <p>
              <span className="font-medium text-muted-foreground">Domain:</span>{" "}
              {allValues.domain === "Other"
                ? allValues.otherDomain
                : allValues.domain}
            </p>
            {allValues.subDomain && (
              <p>
                <span className="font-medium text-muted-foreground">
                  Sub Domain:
                </span>{" "}
                {allValues.subDomain}
              </p>
            )}
            {allValues.domain === "Retail" && (
              <>
                <p>
                  <span className="font-medium text-muted-foreground">
                    City or village:
                  </span>{" "}
                  {allValues.cityOrVillage}
                </p>
                {allValues.locality && (
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Locality:
                    </span>{" "}
                    {allValues.locality}
                  </p>
                )}
              </>
            )}
            <p>
              <span className="font-medium text-muted-foreground">TRL:</span>{" "}
              {allValues.trl}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Cluster Weightage (<Badge>{allValues.preset}</Badge>)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex justify-center">
              <SpiderChart data={weights} size={350} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={prev}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? (
                  <BrainCircuit className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Submit Idea
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Submission?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will use 1 credit and send your idea for AI validation.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="submit">Yes, Submit Idea</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {!mentorApproved && (
        <p className="text-sm text-yellow-500 text-right mt-2">
          Mentor approval is required before submission.
        </p>
      )}
    </>
  );
};

// --- MAIN COMPONENT ---
export default function SubmitIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mentorApproved, setMentorApproved] = React.useState(false);
  const [animationData, setAnimationData] = React.useState(null);

  React.useEffect(() => {
    fetch(
      "https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json"
    )
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  const form = useForm<SubmitIdeaForm>({
    resolver: zodResolver(submitIdeaSchema),
    defaultValues,
  });

  React.useEffect(() => {
    const savedDraft = localStorage.getItem("ideaDraft");
    const ideaParam = searchParams.get("idea");
    let initialData: Partial<SubmitIdeaForm> = {};
    if (ideaParam) {
      try {
        const ideaData = JSON.parse(ideaParam);
        initialData = {
          ...initialData,
          title: ideaData.title,
          concept: ideaData.description,
          domain: ideaData.domain,
          ...ideaData.weights,
        };
      } catch (e) {
        console.error("Failed to parse idea from URL params", e);
      }
    } else if (savedDraft) {
      try {
        initialData = JSON.parse(savedDraft);
        toast({
          title: "Draft Restored",
          description: "Your previously saved draft has been loaded.",
        });
      } catch (error) {
        console.error("Failed to parse draft from localStorage", error);
        localStorage.removeItem("ideaDraft");
      }
    }
    if (Object.keys(initialData).length > 0) {
      form.reset(initialData);
    }
  }, [form, toast, searchParams]);

  const onSubmit = async (data: SubmitIdeaForm) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting Idea...",
      description: "The AI is validating your idea. This may take a moment.",
    });
    const finalDomain =
      data.domain === "Other" ? data.otherDomain : data.domain;

    try {
      const response = await fetch("/api/ideas/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.concept,
          domain: finalDomain,
        }),
      });
      if (!response.ok) throw new Error("Failed to validate idea");
      const result = await response.json();
      toast({
        title: "Validation Complete!",
        description: `Your idea "${data.title}" has been evaluated.`,
      });
      localStorage.removeItem("ideaDraft");
      router.push(`/dashboard/ideas/${result.idea.id}?role=${ROLES.INNOVATOR}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>Submit New Idea</CardTitle>
        <CardDescription>
          Follow the steps to validate and launch your innovation journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stepper initialStep={0} orientation="vertical">
              <SubmitIdeaForm
                form={form}
                setMentorApproved={setMentorApproved}
                mentorApproved={mentorApproved}
                isSubmitting={isSubmitting}
              />
            </Stepper>
          </form>
        </Form>
      </CardContent>
      {isSubmitting && animationData && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
          <div className="h-48 w-48">
            <Lottie animationData={animationData} loop={true} autoplay={true} />
          </div>
          <p className="mt-2 font-medium text-muted-foreground">
            AI is validating your idea...
          </p>
        </div>
      )}
    </Card>
  );
}
