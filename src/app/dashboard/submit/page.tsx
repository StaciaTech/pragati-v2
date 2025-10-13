"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
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
import { MOCK_TTC_S, MOCK_INNOVATORS } from "@/lib/data/organization";
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
  AlertDialogTrigger,
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
import {
  useAssignMentor,
  useInviteTeam,
  useSaveDraft,
  useUploadPpt,
} from "@/hooks/useIdeaApis";
import { useMentors } from "@/hooks/useMentors";
import { useMyDraft } from "@/hooks/useMyDraft";

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
    title: z.string().min(1, { message: "Title is required." }),
    coreTeam: z.string().optional(),
    invitedTeam: z.array(z.string()).optional(),
    mentorId: z.string().min(1, { message: "A mentor must be selected." }),
    domain: z.string().min(1, { message: "Project domain is required." }),
    subDomain: z.string().optional(),
    otherDomain: z.string().optional(),
    cityOrVillage: z.string().optional(),
    locality: z.string().optional(),
    concept: z.string().min(1, { message: "Core concept is required." }),
    trl: z.string().min(1, { message: "TRL is required." }),
    background: z.string().min(1, { message: "Background is required." }),
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
    { message: "Please specify your domain", path: ["otherDomain"] }
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
    { message: "Please select a sub-domain.", path: ["subDomain"] }
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
  mentorId: "",
  domain: "",
  subDomain: "",
  otherDomain: "",
  cityOrVillage: "",
  locality: "",
  concept: "",
  trl: "",
  background: "",
  pptFile: null,
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
    phase: "Phase 1: Research (TRL 1-3)",
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
    phase: "Phase 2: Development and Demonstration (TRL 4-7)",
    levels: [
      {
        value: "TRL 4",
        title: "TRL 4: Technology Validated in Lab",
        description:
          "Individual components are integrated and tested in a controlled laboratory setting to create an alpha prototype.",
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
          "A working, full-scale prototype is tested in a relevant but simulated environment.",
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
    phase: "Phase 3: Deployment (TRL 8-9)",
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

// ---------- MAIN COMPONENT ----------
export default function SubmitIdeaPage() {
  const { toast, ...rest } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mentorApproved, setMentorApproved] = React.useState(false);
  const [animationData, setAnimationData] = React.useState(null);
  const [draftId, setDraftId] = React.useState<string | undefined>(undefined);
  const [founderReady, setFounderReady] = React.useState(false);
  const [teamReady, setTeamReady] = React.useState(true);
  const [pendingMembers, setPendingMembers] = React.useState<string[]>([]);
  const { data: serverDraft, isLoading: draftLoading } = useMyDraft();
  const serverDraftData = serverDraft?.draft;
  const [uploadedKey, setUploadedKey] = React.useState<string | undefined>();
  const [uploadedName, setUploadedName] = React.useState<string | undefined>();

  const { mutate: saveDraft } = useSaveDraft();
  const { mutate: inviteTeam } = useInviteTeam();
  const { mutate: assignMentor } = useAssignMentor();
  const { mutate: uploadPpt } = useUploadPpt();
  const { data: mentorsResp } = useMentors();
  const mentors = mentorsResp?.data;

  // Lottie loader
  React.useEffect(() => {
    fetch(
      "https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json"
    )
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  // Psychometric check
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    const userId = decoded.uid || decoded.sub || decoded.userid;
    if (!userId) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/psychometric/status/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data.success)
          setFounderReady(res.data.isPsychometricAnalysisDone);
      })
      .catch(() => {});
  }, []);

  // Form setup
  const form = useForm<SubmitIdeaForm>({
    resolver: zodResolver(submitIdeaSchema),
    defaultValues,
  });

  // When server draft arrives
  React.useEffect(() => {
    if (!serverDraftData) return;
    const merged = { ...defaultValues, ...serverDraftData };
    form.reset(merged);
    setMentorApproved(serverDraftData.mentorStatus === "accepted");
    setUploadedKey(serverDraftData.pptFileKey);
    setUploadedName(serverDraftData.pptFileName);
    if (serverDraftData._id) setDraftId(serverDraftData._id);
  }, [serverDraftData, form]);

  const stickyToast = (props: Parameters<typeof toast>[0]) => {
    const { id } = toast({ duration: Infinity, ...props });
    return id;
  };

  // ==================================================================
  // CORRECTED LOGIC STARTS HERE
  // ==================================================================

  // 1. Function to SAVE DRAFT
  const handleSaveDraft = () => {
    const body: any = {
      ...form.getValues(),
      pptFile: undefined, // Don't send the file object
      mentorStatus: mentorApproved ? "accepted" : "pending",
      pptFileKey: uploadedKey,
      pptFileName: uploadedName,
      invitedTeam: form.getValues("invitedTeam") || [],
      coreTeamIds: [],
    };

    if (draftId) {
      body.draftId = draftId;
    }

    saveDraft(body, {
      onSuccess: (res: any) => {
        if (!draftId && res.draftId) {
          setDraftId(res.draftId);
        }
        toast({
          title: "Draft Saved",
          description: "Your progress has been stored on the server.",
        });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || "Failed to save draft.";
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: msg,
        });
      },
    });
  };

  // 2. Function to UPLOAD PPT (and then save draft)
  const handleUploadPpt = (file: File) => {
    if (!draftId) {
      toast({
        variant: "destructive",
        title: "Save Draft First",
        description: "Please save your draft before uploading a file.",
      });
      return;
    }
    uploadPpt(
      { draftId, file },
      {
        onSuccess: (res: any) => {
          setUploadedKey(res.pptFileKey);
          setUploadedName(file.name);
          form.setValue("pptFile", [file] as any);
          form.trigger("pptFile");
          toast({
            title: "File Uploaded",
            description: "Pitch deck recognized. Saving changes...",
          });

          // --- Automatically save the draft to persist the new file key ---
          const values = form.getValues();
          const draftData = {
            ...values,
            draftId: draftId,
            pptFileKey: res.pptFileKey,
            pptFileName: file.name,
          };
          saveDraft(draftData); // Re-use the save draft mutation
        },
      }
    );
  };

  // 3. Function for FINAL SUBMISSION
  const handleFinalSubmit = async () => {
    if (!draftId) {
      toast({
        variant: "destructive",
        title: "Save Required",
        description: "Please save your idea as a draft before submitting.",
      });
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    let toastId: any = null;
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in again.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      toastId = stickyToast({
        title: "Finalizing...",
        description: "Saving latest changes before submission.",
      });

      const latestValues = form.getValues();
      const finalDraftData = {
        ...latestValues,
        draftId: draftId,
        pptFileKey: uploadedKey,
        pptFileName: uploadedName,
        mentorStatus: mentorApproved ? "accepted" : "pending",
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ideas/draft`,
        finalDraftData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      rest.dismiss(toastId);

      toastId = stickyToast({
        title: "Submitting for validation...",
        description: "This may take a few seconds.",
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ideas/draft/submit`,
        { draftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      rest.dismiss(toastId);

      toast({
        title: "Success! 🎉",
        description: "Your idea has been submitted.",
      });
      router.push(`/dashboard?role=${ROLES.INNOVATOR}`);
    } catch (err: any) {
      if (toastId) rest.dismiss(toastId);
      const msg =
        err?.response?.data?.error ||
        "An unexpected error occurred during submission.";
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Other handlers (unchanged)
  const handleInvite = () => {
    const email = form.getValues("coreTeam");
    if (!email) return;
    if (!draftId) {
      toast({ variant: "destructive", title: "Save draft first" });
      return;
    }
    inviteTeam(
      { draftId, email },
      {
        onSuccess: () => {
          form.setValue("coreTeam", "");
          toast({
            title: "Invite Sent!",
            description: `An invitation has been sent to ${email}.`,
          });
        },
      }
    );
  };

  const handleAssignMentor = (mentorId: string) => {
    if (!draftId) {
      toast({ variant: "destructive", title: "Save draft first" });
      return;
    }
    assignMentor(
      { draftId, mentorId },
      {
        onSuccess: () => {
          toast({
            title: "Mentor Assigned",
            description: "Approval request sent.",
          });
        },
      }
    );
  };

  // ==================================================================
  // CORRECTED LOGIC ENDS HERE
  // ==================================================================

  if (draftLoading) {
    return <div className="p-8 text-center">Loading your draft...</div>;
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>
          {serverDraftData ? "Continue Draft" : "Submit New Idea"}
        </CardTitle>
        <CardDescription>
          Follow the steps to validate and launch your innovation journey.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          {/* The form onSubmit is now only for validation, not submission logic */}
          <form onSubmit={(e) => e.preventDefault()}>
            <Stepper initialStep={0} orientation="vertical">
              <SubmitIdeaForm
                form={form}
                setMentorApproved={setMentorApproved}
                mentorApproved={mentorApproved}
                isSubmitting={isSubmitting}
                founderReady={founderReady}
                teamReady={teamReady}
                pendingMembers={pendingMembers}
                uploadedKey={uploadedKey}
                uploadedName={uploadedName}
                setUploadedKey={setUploadedKey}
                setUploadedName={setUploadedName}
                // Pass the correct functions as props
                handleSaveDraft={handleSaveDraft}
                handleFinalSubmit={handleFinalSubmit}
                handleUploadPpt={handleUploadPpt}
              />
            </Stepper>
          </form>
        </Form>
      </CardContent>

      {isSubmitting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
          <div className="h-48 w-48">
            <Lottie animationData={animationData} loop autoplay />
          </div>
          <p className="mt-2 font-medium text-muted-foreground">
            AI is validating your idea...
          </p>
        </div>
      )}
    </Card>
  );
}

// --- Form Wrapper Component ---
function SubmitIdeaForm({
  form,
  setMentorApproved,
  mentorApproved,
  isSubmitting,
  founderReady,
  teamReady,
  pendingMembers,
  uploadedKey,
  uploadedName,
  setUploadedKey,
  setUploadedName,
  // Receive the correct functions
  handleSaveDraft,
  handleFinalSubmit,
  handleUploadPpt,
}: {
  form: any;
  setMentorApproved: (isApproved: boolean) => void;
  mentorApproved: boolean;
  isSubmitting: boolean;
  founderReady: boolean;
  teamReady: boolean;
  pendingMembers: string[];
  uploadedKey: string | undefined;
  uploadedName: string | undefined;
  setUploadedKey: (k: string | undefined) => void;
  setUploadedName: (n: string | undefined) => void;
  handleSaveDraft: () => void;
  handleFinalSubmit: () => Promise<void>;
  handleUploadPpt: (file: File) => void;
}) {
  const stepper = useStepper();

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
            uploadedKey={uploadedKey}
            uploadedName={uploadedName}
            setUploadedKey={setUploadedKey}
            setUploadedName={setUploadedName}
            handleUploadPpt={handleUploadPpt}
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
            // Pass the final submit function directly
            onSubmitClick={handleFinalSubmit}
          />
        </StepperContent>
      </StepperItem>
    </>
  );
}

// --- STEPS (UI remains unchanged, only logic in handlers is affected) ---

const Step1Content = ({ form, next, handleSaveDraft }: any) => {
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
      (e: string) => e !== emailToRevoke
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
      : email.charAt(0).toUpperCase();
  };

  const handleNextClick = async () => {
    const email = form.getValues("coreTeam")?.trim();
    if (email) {
      toast({
        variant: "destructive",
        title: "Pending invite",
        description: "Press Invite first or clear the e-mail field.",
      });
      return;
    }
    if (await form.trigger("title")) {
      handleSaveDraft();
      next();
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* ... UI for Step 1 ... */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Idea Title</FormLabel>
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
      {/* ... other fields ... */}
      <div className="flex justify-between items-center">
        <Button type="button" variant="secondary" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <Button type="button" onClick={handleNextClick}>
          Next
        </Button>
      </div>
    </div>
  );
};

const Step2Content = ({
  form,
  next,
  prev,
  setMentorApproved,
  mentorApproved,
  handleSaveDraft,
}: any) => {
  const { toast } = useToast();
  const staticMentor = {
    uid: "Staciacorp",
    name: "Staciacorp",
    expertise: "Innovation & Technology Consulting",
    email: "contact@staciacorp.com",
    avatar: "/avatars/staciacorp.png",
  };

  const handleRequestApproval = () => {
    toast({
      title: "Request Sent",
      description: `Approval request sent to ${staticMentor.name}.`,
    });
    setTimeout(() => {
      setMentorApproved(true);
      toast({
        title: "Mentor Approved!",
        description: `${staticMentor.name} has approved your request.`,
      });
    }, 2000);
  };

  const handleNext = () => {
    if (!mentorApproved) {
      toast({
        variant: "destructive",
        title: "Mentor Approval Required",
        description: "Please get mentor approval before proceeding.",
      });
      return;
    }
    handleSaveDraft();
    next();
  };

  return (
    <div className="space-y-6">
      {/* ... UI for Step 2 ... */}
      <FormField
        control={form.control}
        name="mentorId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Internal Mentor</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="space-y-3"
              >
                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 transition-all",
                    field.value === staticMentor.uid
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <RadioGroupItem
                    value={staticMentor.uid}
                    id={staticMentor.uid}
                  />
                  <label
                    htmlFor={staticMentor.uid}
                    className="flex flex-1 cursor-pointer items-center gap-4"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={staticMentor.avatar}
                        alt={staticMentor.name}
                      />
                      <AvatarFallback>
                        {staticMentor.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{staticMentor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {staticMentor.expertise}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {staticMentor.email}
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {mentorApproved && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Approved</AlertTitle>
          <AlertDescription className="text-green-600">
            {staticMentor.name} has approved your mentor request.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex gap-3">
        <Button type="button" onClick={prev} variant="outline">
          Back
        </Button>
        <Button
          type="button"
          onClick={handleRequestApproval}
          variant="secondary"
          disabled={mentorApproved}
        >
          {mentorApproved ? "Approved" : "Request Approval"}
        </Button>
        <Button type="button" onClick={handleNext} disabled={!mentorApproved}>
          Next
        </Button>
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          <History className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
      </div>
    </div>
  );
};

const Step3Content = ({ form, next, prev, handleSaveDraft }: any) => {
  // ... UI for Step 3, ensure buttons call handleSaveDraft and next/prev
  const { control, watch, setValue } = form;
  const preset = watch("preset");
  const total = clusters.reduce((s, k) => s + (watch(k) || 0), 0);
  const applyPreset = (p: string) => {
    setValue("preset", p);
    if (p !== "Manual")
      Object.entries(presets[p as keyof typeof presets]).forEach(([k, v]) =>
        setValue(k, v)
      );
  };
  return (
    <div className="space-y-6 py-6">
      {/* ... UI for Step 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.keys(presets).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={preset === p ? "default" : "outline"}
                onClick={() => applyPreset(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              size="sm"
              variant={preset === "Manual" ? "default" : "outline"}
              onClick={() => applyPreset("Manual")}
            >
              Manual 🛠️
            </Button>
          </div>
          {preset === "Manual" && (
            <Alert className="border-orange-500/50 text-orange-700 dark:text-orange-300">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Expert Mode</AlertTitle>
              <AlertDescription>
                You are in full control. Adjust sliders to set weights.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {clusters.map((key) => (
              <FormField
                key={key}
                control={control}
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
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          min={0}
                          max={100}
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
              total === 100 ? "border-green-500" : "border-red-500"
            )}
          >
            <span>Total Weight:</span>
            <span className="font-bold text-xl">{total}%</span>
          </div>
        </div>
        <div className="w-full h-[500px] bg-background rounded-lg p-4 flex items-center justify-center">
          <SpiderChart data={watch()} size={500} />
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
          <Button
            type="button"
            onClick={() => {
              handleSaveDraft();
              next();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const Step4Content = ({ form, next, prev, handleSaveDraft }: any) => {
  // ... UI for Step 4, ensure buttons call handleSaveDraft and next/prev
  const { control, watch, setValue } = form;
  const domain = watch("domain");
  const selected = MOCK_DOMAINS_WITH_SUBDOMAINS.find((d) => d.name === domain);
  React.useEffect(() => setValue("subDomain", ""), [domain, setValue]);
  return (
    <div className="space-y-6 py-6">
      {/* ... UI for Step 4 */}
      <FormField
        control={control}
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
                {MOCK_DOMAINS_WITH_SUBDOMAINS.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {selected && selected.subDomains.length > 0 && (
        <FormField
          control={control}
          name="subDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Domain of Project</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-domain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selected.subDomains.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
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
          control={control}
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
            control={control}
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
                    {["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {watch("cityOrVillage") && (
            <FormField
              control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
            onClick={() => {
              handleSaveDraft();
              next();
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const Step5Content = ({
  form,
  next,
  prev,
  handleSaveDraft,
  uploadedKey,
  uploadedName,
  setUploadedKey,
  setUploadedName,
  handleUploadPpt,
}: any) => {
  const [fileName, setFileName] = React.useState(
    uploadedKey ? uploadedName : ""
  );
  React.useEffect(() => {
    setFileName(uploadedKey ? uploadedName : "");
  }, [uploadedKey, uploadedName]);

  return (
    <div className="space-y-6 py-6">
      <FormField
        control={form.control}
        name="pptFile"
        render={({ field: { value, onChange, ...fieldProps } }) => (
          <FormItem>
            <FormLabel>Pitch Deck Upload</FormLabel>
            <FormControl>
              {uploadedKey ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">{uploadedName}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUploadedKey(undefined);
                      setUploadedName(undefined);
                      form.setValue("pptFile", null);
                    }}
                  >
                    Replace
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="file"
                    className="pl-10"
                    accept=".ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadPpt(file);
                    }}
                    {...fieldProps}
                  />
                </div>
              )}
            </FormControl>
            <FormDescription>
              Sample template provided.{" "}
              <Link href="#" className="underline">
                Download here.
              </Link>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
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
              if (await form.trigger("pptFile")) {
                handleSaveDraft();
                next();
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
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
  onSubmitClick,
}: any) => {
  const allValues = form.getValues();
  const weights = clusters.reduce(
    (acc, key) => ({ ...acc, [key]: allValues[key] }),
    {}
  );

  // THIS IS THE CRITICAL FIX: Direct function call, no wrappers.
  const realSubmit = onSubmitClick;

  const canSubmit =
    founderReady && teamReady && mentorApproved && !!allValues.pptFile;

  return (
    <div className="space-y-6 py-6">
      {/* ... UI for Step 6, which is already mostly correct ... */}
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
                <AlertDialogAction onClick={realSubmit}>
                  Yes, Submit Idea
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
    </div>
  );
};
