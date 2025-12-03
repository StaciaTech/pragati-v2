"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
  Loader2,
  Clock,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Lottie from "lottie-react";
import { v4 as uuidv4 } from "uuid";

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
import { useAvailableMentors } from "@/hooks/useAvailableMentors";
import { AnimatePresence, motion } from "framer-motion";
import { useUserProfile } from "@/hooks/useUserProfile";

// --- SCHEMA PRESETS ---
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

export type SubmitIdeaForm = z.infer<typeof submitIdeaSchema>;

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

  const [sessionKey] = React.useState(() => {
    // Try to get existing sessionKey from localStorage
    const existing = localStorage.getItem("ideaDraftSessionKey");
    if (existing) return existing;

    // Generate new one if not exists
    const newKey = uuidv4();
    localStorage.setItem("ideaDraftSessionKey", newKey);
    return newKey;
  });

  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false); // <-- NEW: Loading state for upload
  const [mentorApproved, setMentorApproved] = React.useState(false);
  const [animationData, setAnimationData] = React.useState(null);
  const [draftId, setDraftId] = React.useState<string | undefined>(undefined);
  const [founderReady, setFounderReady] = React.useState(false);
  const [teamReady, setTeamReady] = React.useState(true);
  const [pendingMembers, setPendingMembers] = React.useState<string[]>([]);
  // const { data: serverDraft, isLoading: draftLoading } = useMyDraft();
  const [serverDraft, setServerDraft] = React.useState({});
  const [draftLoading, setDraftLoading] = React.useState(false);
  const { data: profile } = useUserProfile();
  console.log(profile);

  // console.log(serverDraft);

  const serverDraftData = serverDraft?.draft;
  const [uploadedKey, setUploadedKey] = React.useState<string | undefined>();
  const [uploadedName, setUploadedName] = React.useState<string | undefined>();

  const { mutate: saveDraft } = useSaveDraft();
  const { mutate: inviteTeam } = useInviteTeam();
  const { mutate: assignMentor } = useAssignMentor();
  const { mutate: uploadPpt } = useUploadPpt();

  const [fetchedDraftData, setFetchedDraftData] = React.useState({});
  // const { data: mentorsResp } = useMentors();
  // const mentors = mentorsResp?.data;

  // When server draft arrives
  React.useEffect(() => {
    setDraftLoading(true);
    const token = localStorage.getItem("token");

    const fetchDraft = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ideas/draft/my-latest`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(response.data);

        if (response.data.success && response.data.draft) {
          const draft = response.data.draft;

          // ✅ Store draftId
          setDraftId(draft._id);
          setFetchedDraftData(response.data.draft);

          // ✅ FIX: Include ALL fields in form.reset()
          form.reset({
            title: draft.title || "",
            concept: draft.concept || "",
            domain: draft.domain || "",
            subDomain: draft.subDomain || "",
            otherDomain: draft.otherDomain || "",
            cityOrVillage: draft.cityOrVillage || "",
            locality: draft.locality || "",
            trl: draft.trl || "TRL 1",

            // ✅ CRITICAL FIX: Add background field
            background: draft.background || "",

            mentorId: draft.mentorId || "",
            invitedTeam: draft.invitedTeam || [],
            coreTeam: "", // Empty for new input

            // ✅ Add preset
            preset: draft.preset || "Balanced",

            // ✅ Add cluster weights
            "Core Idea & Innovation": draft["Core Idea & Innovation"] || 20,
            "Market & Commercial Opportunity":
              draft["Market & Commercial Opportunity"] || 25,
            "Execution & Operations": draft["Execution & Operations"] || 15,
            "Business Model & Strategy":
              draft["Business Model & Strategy"] || 15,
            "Team & Organizational Health":
              draft["Team & Organizational Health"] || 10,
            "External Environment & Compliance":
              draft["External Environment & Compliance"] || 10,
            "Risk & Future Outlook": draft["Risk & Future Outlook"] || 5,
          });

          // ✅ FIX: Check mentorRequestStatus instead of mentorStatus
          if (draft.mentorRequestStatus === "accepted") {
            setMentorApproved(true);
          }

          if (draft.pptFileKey && draft.pptFileName) {
            setUploadedKey(draft.pptFileKey);
            setUploadedName(draft.pptFileName);
          }

          toast({
            title: "Draft Loaded",
            description: "Your previous progress has been restored.",
          });
        }
      } catch (error: any) {
        console.error("Failed to load draft:", error);
      } finally {
        setDraftLoading(false);
      }
    };

    fetchDraft();
  }, []);

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        if (res.data.success) {
          setFounderReady(res.data.isPsychometricAnalysisDone);
        }
      })
      .catch(() => {});
  }, []);

  // Form setup
  const form = useForm<SubmitIdeaForm>({
    resolver: zodResolver(submitIdeaSchema),
    defaultValues,
  });

  const stickyToast = (props: Parameters<typeof toast>[0]) => {
    const { id } = toast({
      duration: Infinity,
      ...props,
    });
    return id;
  };

  const handleSaveDraft = () => {
    console.log("=".repeat(80));
    console.log("🚀 [handleSaveDraft] Starting draft save...");
    console.log("📝 Current sessionKey:", sessionKey);
    console.log("📝 Current draftId:", draftId);
    console.log("📝 Uploaded PPT Key:", uploadedKey);
    console.log("📝 Uploaded PPT Name:", uploadedName);
    console.log("📝 Fetched Draft Data:", fetchedDraftData ? "EXISTS" : "NULL");

    const formValues = form.getValues();

    // 🔍 DEBUG: Check form values
    console.log("\n[FORM VALUES]");
    console.log("  ├─ Title:", formValues.title?.substring(0, 50));
    console.log("  ├─ Background:", formValues.background?.substring(0, 50));
    console.log("  ├─ Domain:", formValues.domain);
    console.log("  └─ Concept:", formValues.concept?.substring(0, 50));

    // ✅ Build base body with form values
    const body: any = {
      ...formValues,
      sessionKey: sessionKey,
      background: formValues.background || "", // Explicit background
      invitedTeam: formValues.invitedTeam || [],
      coreTeamIds: [],
    };

    // ✅ Add draftId if updating existing draft
    if (draftId) {
      body.draftId = draftId;
    }

    // ✅ CRITICAL FIX: Only include PPT fields if they have values
    const pptKey = uploadedKey || fetchedDraftData?.pptFileKey;
    const pptName = uploadedName || fetchedDraftData?.pptFileName;

    if (pptKey && pptName) {
      body.pptFileKey = pptKey;
      body.pptFileName = pptName;
      body.pptFileUrl = fetchedDraftData?.pptFileUrl;
      body.pptFileSize = fetchedDraftData?.pptFileSize;
      body.pptUploadedAt = fetchedDraftData?.pptUploadedAt;
      console.log("\n[PPT] ✅ Including PPT in save:");
      console.log("  ├─ pptFileKey:", pptKey);
      console.log("  ├─ pptFileName:", pptName);
      console.log(
        "  └─ pptFileSize:",
        fetchedDraftData?.pptFileSize || "unknown"
      );
    } else {
      console.log(
        "\n[PPT] ⚠️ No PPT to include - backend will preserve existing"
      );
    }

    // ✅ Only include mentor fields if they exist
    if (formValues.mentorId) {
      body.mentorId = formValues.mentorId;
    }

    // ✅ CRITICAL: Remove undefined/null fields to prevent backend issues
    Object.keys(body).forEach((key) => {
      if (body[key] === undefined || body[key] === null) {
        console.log(`  ⚠️ Removing undefined field: ${key}`);
        delete body[key];
      }
    });

    console.log("\n[REQUEST BODY]");
    console.log("  ├─ sessionKey:", body.sessionKey);
    console.log("  ├─ draftId:", body.draftId || "NEW DRAFT");
    console.log("  ├─ title:", body.title?.substring(0, 30));
    console.log(
      "  ├─ background:",
      body.background ? `${body.background.length} chars` : "empty"
    );
    console.log("  ├─ hasPPT:", !!body.pptFileKey);
    console.log("  ├─ pptFileKey:", body.pptFileKey || "NOT INCLUDED");
    console.log("  ├─ pptFileName:", body.pptFileName || "NOT INCLUDED");
    console.log("  ├─ mentorId:", body.mentorId || "none");
    console.log("  └─ Total fields:", Object.keys(body).length);

    // Make the API call
    saveDraft(body, {
      onSuccess: (res: any) => {
        console.log("\n" + "=".repeat(80));
        console.log("✅ [SUCCESS] Draft saved successfully!");
        console.log("Response:", res);

        // Update draftId for new drafts
        if (!draftId && res.draftId) {
          setDraftId(res.draftId);
          console.log("✅ Updated draftId state:", res.draftId);
        }

        // Update PPT info if returned
        if (res.pptInfo) {
          console.log("✅ PPT info in response:");
          console.log("  ├─ pptFileKey:", res.pptInfo.pptFileKey);
          console.log("  └─ pptFileName:", res.pptInfo.pptFileName);
        }

        toast({
          title: "Draft Saved",
          description: "Your progress has been stored successfully.",
        });
        console.log("=".repeat(80));
      },
      onError: (err: any) => {
        console.log("\n" + "=".repeat(80));
        console.error("❌ [ERROR] Draft save failed!");
        console.error("Error details:", err);
        console.error("Response data:", err?.response?.data);

        const msg = err?.response?.data?.error || "Failed to save draft.";

        toast({
          variant: "destructive",
          title: "Save Failed",
          description: msg,
        });
        console.log("=".repeat(80));
      },
    });
  };

  // 2. Function to UPLOAD PPT and then save draft
  // 1. Update the handleUploadPpt function
  const handleUploadPpt = (file: File) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "The presentation file must be smaller than 10MB.",
      });
      return;
    }

    setIsUploading(true);

    uploadPpt(
      {
        draftId: draftId || undefined,
        file,
        sessionKey,
      },
      {
        onSuccess: (res: any) => {
          console.log("✅ Upload response:", res);

          const uploadedDraftId = res.data?.draftId || res.draftId;
          const uploadedKey = res.data?.pptFileKey || res.pptFileKey;
          const uploadedFileName = res.data?.pptFileName || res.pptFileName;

          if (uploadedDraftId && !draftId) {
            setDraftId(uploadedDraftId);
          }

          setUploadedKey(uploadedKey);
          setUploadedName(uploadedFileName);

          form.setValue("pptFile", [file] as any);
          form.trigger("pptFile");

          toast({
            title: "File Uploaded",
            description: "Pitch deck uploaded successfully!",
          });

          // ❌ REMOVE THIS - Backend already saved the draft
          // setTimeout(() => {
          //   handleSaveDraft();
          // }, 500);
        },
        onError: (err: any) => {
          console.error("❌ Upload error:", err);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: err?.response?.data?.error || "Failed to upload file.",
          });
        },
        onSettled: () => {
          setIsUploading(false);
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
        sessionKey: sessionKey,
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
      localStorage.removeItem("ideaDraftSessionKey");

      toast({
        title: "Success!",
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

  // CORRECTED LOGIC ENDS HERE
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Stepper initialStep={0} orientation="vertical">
              <SubmitIdeaForm
                form={form}
                setMentorApproved={setMentorApproved}
                mentorApproved={mentorApproved}
                isSubmitting={isSubmitting}
                isUploading={isUploading} // <-- NEW: Pass down isUploading
                founderReady={founderReady}
                teamReady={teamReady}
                pendingMembers={pendingMembers}
                uploadedKey={uploadedKey}
                uploadedName={uploadedName}
                setUploadedKey={setUploadedKey}
                setUploadedName={setUploadedName}
                handleSaveDraft={handleSaveDraft}
                handleFinalSubmit={handleFinalSubmit}
                handleUploadPpt={handleUploadPpt}
                draftId={draftId}
                draftData={fetchedDraftData}
                profile={profile}
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
  isUploading, // <-- NEW: Receive isUploading
  founderReady,
  teamReady,
  pendingMembers,
  uploadedKey,
  uploadedName,
  setUploadedKey,
  setUploadedName,
  handleSaveDraft,
  handleFinalSubmit,
  handleUploadPpt,
  draftId,
  draftData,
  profile,
}: {
  form: any;
  setMentorApproved: (isApproved: boolean) => void;
  mentorApproved: boolean;
  isSubmitting: boolean;
  isUploading: boolean; // <-- NEW: Add prop type
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
  draftId: string | undefined; // ✅ Add type
  draftData: any;
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
            draftId={draftId}
            draftData={draftData}
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
            draftData={draftData}
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
            draftData={draftData}
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
            isUploading={isUploading} // <-- NEW: Pass down isUploading
            draftData={draftData}
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
            founderReady={profile?.isPsychometricAnalysisDone}
            teamReady={teamReady}
            pendingMembers={pendingMembers}
            onSubmitClick={handleFinalSubmit}
            draftData={draftData}
          />
        </StepperContent>
      </StepperItem>
    </>
  );
}

// --- STEPS UI remains unchanged, only logic in handlers is affected ---
const Step1Content = ({ form, next, handleSaveDraft }: any) => {
  const { toast } = useToast();

  const handleNextClick = async () => {
    // Require idea title before proceeding
    const ok = await form.trigger("title");
    if (!ok || !form.getValues("title")?.trim()) {
      toast({
        variant: "destructive",
        title: "Add idea title",
        description: "Please enter your idea title to continue.",
      });
      return;
    }

    // Persist current data as draft (optional but recommended)
    handleSaveDraft();
    next();
  };

  return (
    <div className="space-y-6 py-6">
      {/* Idea Title */}
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

      {/* Optional: other basic Step 1 fields, if any */}
      {/* Example placeholders (uncomment and wire up if needed):
      <FormField name="domain" ... />
      <FormField name="subDomain" ... />
      <FormField name="cityOrVillage" ... />
      <FormField name="locality" ... />
      <FormField name="trl" ... />
      */}

      {/* Navigation */}
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
  draftId,
  draftData,
}: any) => {
  const { toast } = useToast();
  const [isInviting, setIsInviting] = React.useState(false);
  const [isRequestingMentor, setIsRequestingMentor] = React.useState(false);
  const [selectedMentorId, setSelectedMentorId] = React.useState(
    draftData?.mentorId || ""
  );
  const [mentorRequestStatus, setMentorRequestStatus] = React.useState(
    draftData?.mentorRequestStatus || "none"
  );
  const [mentorDetails, setMentorDetails] = React.useState({
    name: draftData?.mentorName || "",
    email: draftData?.mentorEmail || "",
  });

  // Fetch available mentors
  const { data: mentorsResp, isLoading: mentorsLoading } =
    useAvailableMentors();
  const mentors = mentorsResp?.data || [];

  // Pre-fill mentor data from draft
  React.useEffect(() => {
    if (draftData?.mentorId) {
      setSelectedMentorId(draftData.mentorId);
      form.setValue("mentorId", draftData.mentorId);
    }
    if (draftData?.mentorRequestStatus) {
      setMentorRequestStatus(draftData.mentorRequestStatus);
      if (draftData.mentorRequestStatus === "accepted") {
        setMentorApproved(true);
      }
    }
    if (draftData?.mentorName && draftData?.mentorEmail) {
      setMentorDetails({
        name: draftData.mentorName,
        email: draftData.mentorEmail,
      });
    }
  }, [draftData, form, setMentorApproved]);

  // ✅ Handle mentor request with proper API call
  // Handle mentor request with proper API call
  const handleMentorRequest = async (mentorId: string) => {
    if (!draftId) {
      toast({
        variant: "destructive",
        title: "Save Draft First",
        description: "Please save your draft before requesting a mentor.",
      });
      return;
    }

    // Find mentor details from the list
    const selectedMentor = mentors.find((m: any) => m._id === mentorId);
    if (!selectedMentor) {
      toast({
        variant: "destructive",
        title: "Mentor Not Found",
        description: "Please select a valid mentor.",
      });
      return;
    }

    console.log("📤 Requesting mentor:", {
      draftId,
      mentorId,
      mentorName: selectedMentor.name,
      mentorEmail: selectedMentor.email,
    });

    setIsRequestingMentor(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ Step 1: Call mentor request API - this updates the draft
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mentors/request`,
        {
          draftId,
          mentorId,
          message: "Please review and approve my idea.", // Optional message
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Mentor request API response:", response.data);

      if (response.data.success) {
        // ✅ Step 2: Update local state
        setSelectedMentorId(mentorId);
        setMentorRequestStatus("pending");
        setMentorDetails({
          name: selectedMentor.name,
          email: selectedMentor.email,
        });

        form.setValue("mentorId", mentorId);

        toast({
          title: "Request Sent",
          description: `Mentor approval request sent to ${selectedMentor.name}.`,
        });

        // ✅ Step 3: NO NEED TO SAVE DRAFT AGAIN
        // The backend already updated the draft in /api/mentors/request
        // Just reload the draft to get the updated status

        // Optional: Fetch the updated draft to sync state
        try {
          const draftResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/ideas/draft/my-latest`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (draftResponse.data.success && draftResponse.data.draft) {
            console.log(
              "✅ Draft reloaded with mentor status:",
              draftResponse.data.draft.mentorRequestStatus
            );
          }
        } catch (err) {
          console.warn("⚠️ Failed to reload draft:", err);
        }
      }
    } catch (error: any) {
      console.error("❌ Mentor request failed:", error);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description:
          error?.response?.data?.error || "Failed to send mentor request.",
      });
    } finally {
      setIsRequestingMentor(false);
    }
  };

  // Team invitation handler (unchanged)
  const handleInviteTeam = async () => {
    const emails = form.getValues("coreTeam");
    if (!emails || !emails.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter at least one email address.",
      });
      return;
    }

    if (!draftId) {
      toast({
        variant: "destructive",
        title: "Save Draft First",
        description: "Please save your draft before inviting team members.",
      });
      return;
    }

    setIsInviting(true);

    try {
      const emailArray = emails.split(",").map((e: string) => e.trim());
      const token = localStorage.getItem("token");
      console.log();

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/invite`,
        {
          draftId,
          emails: emailArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      form.setValue("coreTeam", "");
      form.setValue("invitedTeam", [
        ...(draftData?.invitedTeam || []),
        ...emailArray,
      ]);

      toast({
        title: "Invitations Sent",
        description: `Sent invitations to ${emailArray.length} team member(s).`,
      });

      handleSaveDraft();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description:
          error?.response?.data?.error || "Failed to send invitations.",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleNext = () => {
    // ✅ FIX: Show warning but ALLOW navigation
    if (mentorRequestStatus !== "accepted") {
      toast({
        title: "⚠️ Mentor Approval Pending",
        description:
          "You can continue filling the form, but submission requires mentor approval.",
        // ✅ Changed from 'destructive' to 'default' (info toast)
      });
    }

    handleSaveDraft();
    next(); // ✅ ALWAYS allow next - don't return early
  };

  const teamInvites = draftData?.invitedTeam || [];

  const getInviteStatus = (email: string) => {
    const invite = draftData?.teamInvitations?.find(
      (inv: any) => inv.email === email
    );
    return invite?.status || "pending";
  };

  return (
    <div className="space-y-6 py-6">
      {/* ========== MENTOR SECTION (REQUIRED) ========== */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Internal Mentor Assignment <span className="text-red-500">*</span>
        </h3>

        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Mentor Required</AlertTitle>
          <AlertDescription className="text-blue-700">
            You must select an internal mentor and get their approval before
            submitting your idea. This is a mandatory step.
          </AlertDescription>
        </Alert>

        {/* Show mentor status if already selected */}
        {mentorDetails.name && (
          <Alert
            className={cn(
              "mb-4",
              mentorRequestStatus === "accepted"
                ? "bg-green-50 border-green-200"
                : mentorRequestStatus === "pending"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            )}
          >
            {mentorRequestStatus === "accepted" ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : mentorRequestStatus === "pending" ? (
              <Clock className="h-4 w-4 text-yellow-600" />
            ) : (
              <X className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle
              className={
                mentorRequestStatus === "accepted"
                  ? "text-green-800"
                  : mentorRequestStatus === "pending"
                  ? "text-yellow-800"
                  : "text-red-800"
              }
            >
              {mentorRequestStatus === "accepted"
                ? "Mentor Approved ✓"
                : mentorRequestStatus === "pending"
                ? "Approval Pending"
                : "Request Rejected"}
            </AlertTitle>
            <AlertDescription
              className={
                mentorRequestStatus === "accepted"
                  ? "text-green-700"
                  : mentorRequestStatus === "pending"
                  ? "text-yellow-700"
                  : "text-red-700"
              }
            >
              <strong>{mentorDetails.name}</strong> ({mentorDetails.email})
              {mentorRequestStatus === "pending" &&
                " is reviewing your request."}
              {mentorRequestStatus === "rejected" &&
                " Please select a different mentor."}
            </AlertDescription>
          </Alert>
        )}

        {/* Mentor Selection */}
        <FormField
          control={form.control}
          name="mentorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Internal Mentor</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedMentorId(value);
                  }}
                  value={field.value}
                  disabled={mentorRequestStatus === "accepted"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a mentor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mentorsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading mentors...
                      </SelectItem>
                    ) : mentors.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No mentors available
                      </SelectItem>
                    ) : (
                      mentors.map((mentor: any) => (
                        <SelectItem key={mentor._id} value={mentor._id}>
                          {mentor.name} - {mentor.expertise || "General"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Select a mentor to guide you through the validation process.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Request Mentor Button */}
        {selectedMentorId &&
          mentorRequestStatus !== "accepted" &&
          mentorRequestStatus !== "pending" && (
            <Button
              type="button"
              onClick={() => handleMentorRequest(selectedMentorId)}
              disabled={isRequestingMentor}
              className="mt-4"
            >
              {isRequestingMentor ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request Mentor Approval
                </>
              )}
            </Button>
          )}

        {/* Change Mentor (if rejected) */}
        {mentorRequestStatus === "rejected" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setMentorRequestStatus("none");
              setSelectedMentorId("");
              setMentorDetails({ name: "", email: "" });
              form.setValue("mentorId", "");
            }}
            className="mt-4"
          >
            Select Different Mentor
          </Button>
        )}
      </div>

      {/* ========== TEAM SECTION (OPTIONAL) ========== */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Team Members <span className="text-muted-foreground">(Optional)</span>
        </h3>

        <Alert className="mb-4 bg-gray-50 border-gray-200">
          <UserPlus className="h-4 w-4 text-gray-600" />
          <AlertTitle className="text-gray-800">Invite Team Members</AlertTitle>
          <AlertDescription className="text-gray-700">
            You can invite team members to collaborate on this idea. This is
            optional.
          </AlertDescription>
        </Alert>

        {/* Show invited team members */}
        {teamInvites.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-sm font-medium">Invited Members:</p>
            {teamInvites.map((email: string) => (
              <div
                key={email}
                className="flex items-center gap-2 p-2 bg-muted rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">{email}</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {getInviteStatus(email)}
                  </p>
                </div>
                <Badge
                  variant={
                    getInviteStatus(email) === "accepted"
                      ? "default"
                      : "secondary"
                  }
                >
                  {getInviteStatus(email)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Team Invitation Input */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="coreTeam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Invite Team Members (comma-separated emails)
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="email1@example.com, email2@example.com"
                      {...field}
                      disabled={isInviting}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={handleInviteTeam}
                    disabled={isInviting || !field.value?.trim()}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Invite
                      </>
                    )}
                  </Button>
                </div>
                <FormDescription>
                  Separate multiple email addresses with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ========== NAVIGATION ========== */}
      <div className="flex justify-between mt-6">
        <Button type="button" variant="secondary" onClick={prev}>
          Previous
        </Button>
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" onClick={handleNext}>
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

const Step3Content = ({
  form,
  next,
  prev,
  handleSaveDraft,
  draftData,
}: {
  form: any;
  next: () => void;
  prev: () => void;
  handleSaveDraft: () => void;
  draftData?: any;
}) => {
  const { toast } = useToast();
  const preset = form.watch("preset");
  const totalWeight = clusters.reduce(
    (acc, cluster) => acc + Math.round(form.getValues(cluster) || 0),
    0
  );

  // ✅ Pre-fill cluster weights from draftData on mount
  React.useEffect(() => {
    if (draftData) {
      // Pre-fill preset
      if (draftData.preset) {
        form.setValue("preset", draftData.preset);
      }

      // Pre-fill all cluster weights
      clusters.forEach((cluster) => {
        if (draftData[cluster] !== undefined) {
          form.setValue(cluster, draftData[cluster]);
        }
      });

      console.log("✅ Step 3 weights pre-filled:", {
        preset: draftData.preset,
        totalWeight: clusters.reduce((sum, c) => sum + (draftData[c] || 0), 0),
      });
    }
  }, [draftData, form]);

  const handlePresetChange = (presetKey: keyof typeof presets | "Manual") => {
    form.setValue("preset", presetKey);
    if (presetKey !== "Manual") {
      const presetValues = presets[presetKey as keyof typeof presets];
      Object.entries(presetValues).forEach(([key, value]) => {
        form.setValue(key, value);
      });
      toast({
        title: `Preset Applied: ${presetKey}`,
        description: "Cluster weights have been updated.",
      });
    } else {
      toast({
        title: "Manual Mode Activated",
        description: "You can now adjust weights manually.",
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

    // Save draft before moving to next step
    handleSaveDraft();
    next();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
        <div className="w-full space-y-6">
          {/* Preset Buttons */}
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

          {/* Draft Restored Alert */}
          {draftData?.preset && (
            <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950">
              <Check className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">
                Weights Restored
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Your previous cluster weights (
                <strong>{draftData.preset}</strong>) have been restored.
              </AlertDescription>
            </Alert>
          )}

          {/* Manual Mode Alert */}
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

          {/* Cluster Weight Sliders */}
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
                          className="flex-1"
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

          {/* Total Weight Display */}
          <div
            className={cn(
              "relative text-sm font-medium p-3 border rounded-lg flex justify-between items-center",
              totalWeight === 100
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950"
            )}
          >
            <span
              className={
                totalWeight === 100
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }
            >
              Total Weight:
            </span>
            <span
              className={cn(
                "font-bold text-xl",
                totalWeight === 100
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {totalWeight}%
            </span>
          </div>

          {/* Warning if total is not 100 */}
          {totalWeight !== 100 && preset === "Manual" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invalid Total Weight</AlertTitle>
              <AlertDescription>
                Total weight must equal 100% to proceed. Current total:{" "}
                <strong>{totalWeight}%</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Spider Chart */}
        <div className="w-full h-[500px] bg-background rounded-lg p-4 flex items-center justify-center border">
          <SpiderChart data={form.getValues()} size={500} />
        </div>
      </div>

      {/* Navigation Buttons */}
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
            onClick={handleNext}
            disabled={preset === "Manual" && totalWeight !== 100}
          >
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
  draftData,
}: any) => {
  const { control, watch, setValue } = form;
  const domain = watch("domain");
  const subDomain = watch("subDomain");
  const selected = MOCK_DOMAINS_WITH_SUBDOMAINS.find((d) => d.name === domain);

  // ✅ REMOVE THE CLEARING USEEFFECT COMPLETELY
  // React.useEffect(() => {
  //   setValue("subDomain", ""); // ❌ This was wiping out your pre-filled value
  // }, [domain, setValue]);

  // ✅ NEW: Only clear subdomain when domain changes AND subdomain is no longer valid
  const prevDomainRef = React.useRef(domain);

  React.useEffect(() => {
    // Only run if domain actually changed (not on initial mount)
    if (prevDomainRef.current && prevDomainRef.current !== domain) {
      // Check if current subdomain is valid for new domain
      const newSelected = MOCK_DOMAINS_WITH_SUBDOMAINS.find(
        (d) => d.name === domain
      );
      if (
        newSelected &&
        subDomain &&
        !newSelected.subDomains.includes(subDomain)
      ) {
        setValue("subDomain", ""); // Only clear if subdomain is invalid for new domain
      }
    }
    prevDomainRef.current = domain;
  }, [domain, subDomain, setValue]);

  return (
    <div className="space-y-6 py-6">
      {/* Domain Selection */}
      <FormField
        control={control}
        name="domain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Domain of Project</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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

      {/* Sub Domain Selection */}
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

      {/* Other Domain Input */}
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

      {/* City/Village Selection */}
      {domain === "Retail" && (
        <FormField
          control={control}
          name="cityOrVillage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City or village</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
      )}

      {/* Locality Input */}
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

      {/* Core Concept */}
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

      {/* TRL Selection */}
      <FormField
        control={control}
        name="trl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current TRL (Technology Readiness Level)</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
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

      {/* Background & Validation */}
      <FormField
        control={control}
        name="background"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background & Validation</FormLabel>
            <FormControl>
              <Textarea
                placeholder="How did your personal background, skills, or experiences inspire this specific idea?"
                value={field.value || ""} // ✅ Explicit value
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Debug Info - Remove after testing */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="p-4 bg-gray-100 rounded text-xs">
          <p>
            <strong>Debug:</strong>
          </p>
          <p>Domain: {domain || "none"}</p>
          <p>SubDomain: {subDomain || "none"}</p>
          <p>DraftData SubDomain: {draftData?.subDomain || "none"}</p>
        </div>
      )} */}

      {/* Navigation Buttons */}
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
  isUploading,
  draftData,
}: any) => {
  // ✅ Initialize from draftData if exists
  const { toast } = useToast();
  const [fileName, setFileName] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState("");

  // ✅ Pre-fill PPT file info from draftData on mount
  React.useEffect(() => {
    if (draftData) {
      if (draftData.pptFileName && draftData.pptFileKey) {
        setUploadedKey(draftData.pptFileKey);
        setUploadedName(draftData.pptFileName);
        setFileName(draftData.pptFileName);
        setFileUrl(draftData.pptFileUrl || "");

        console.log("✅ PPT file restored from draft:", {
          name: draftData.pptFileName,
          size: draftData.pptFileSize,
          uploaded: draftData.pptUploadedAt,
        });
      }
    }
  }, [draftData, setUploadedKey, setUploadedName]);

  // Update fileName when uploadedKey changes (after new upload)
  React.useEffect(() => {
    if (uploadedKey && uploadedName) {
      setFileName(uploadedName);
    }
  }, [uploadedKey, uploadedName]);

  // ✅ Check if file exists (either uploaded now or from draft)
  const hasFile = uploadedKey || draftData?.pptFileKey;
  const displayFileName = uploadedName || draftData?.pptFileName || "";

  return (
    <div className="space-y-6 py-6">
      {/* ✅ Show success alert if file exists */}
      {hasFile && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            Presentation Uploaded ✓
          </AlertTitle>
          <AlertDescription className="text-green-700">
            <p className="font-medium">{displayFileName}</p>
            {draftData?.pptFileSize && (
              <p className="text-xs mt-1">
                Size: {(draftData.pptFileSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            {draftData?.pptUploadedAt && (
              <p className="text-xs">
                Uploaded:{" "}
                {new Date(draftData.pptUploadedAt).toLocaleDateString()}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <FormField
        control={form.control}
        name="pptFile"
        render={({ field: { value, onChange, ...fieldProps } }) => (
          <FormItem>
            <FormLabel>Pitch Deck Upload</FormLabel>
            <FormControl>
              {hasFile ? (
                <div className="space-y-3">
                  {/* Show uploaded file info */}
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {displayFileName}
                      </p>
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View file →
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUploadedKey(undefined);
                        setUploadedName(undefined);
                        setFileName("");
                        setFileUrl("");
                        form.setValue("pptFile", null);
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      type="file"
                      className="pl-10"
                      accept=".ppt,.pptx"
                      disabled={isUploading}
                      {...fieldProps}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (max 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            toast({
                              variant: "destructive",
                              title: "File too large",
                              description:
                                "Please upload a file smaller than 10MB",
                            });
                            return;
                          }
                          handleUploadPpt(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: .ppt, .pptx (max 10MB)
                  </p>
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

      {/* ✅ Show uploading indicator */}
      {isUploading && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertTitle className="text-blue-800">Uploading...</AlertTitle>
          <AlertDescription className="text-blue-700">
            Please wait while your presentation is being uploaded.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prev}
          disabled={isUploading}
        >
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isUploading}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={async () => {
              // ✅ Check if file exists before proceeding
              if (!hasFile) {
                toast({
                  variant: "destructive",
                  title: "PPT Required",
                  description:
                    "Please upload your presentation before proceeding.",
                });
                return;
              }

              await handleSaveDraft();
              next();
            }}
            disabled={isUploading || !hasFile}
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
  draftData,
}: any) => {
  const allValues = form.getValues();
  const weights = clusters.reduce(
    (acc, key) => ({ ...acc, [key]: allValues[key] }),
    {}
  );
  const realSubmit = onSubmitClick;

  // ✅ Validate based on draftData
  const hasPPT = !!(draftData?.pptFileName || draftData?.pptFileKey);
  const mentorStatus = draftData?.mentorRequestStatus === "accepted";

  const canSubmit = founderReady && teamReady && mentorStatus && hasPPT;

  return (
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

      {!mentorStatus && (
        <p className="text-sm text-yellow-500 text-right mt-2">
          Mentor approval is required before submission.
        </p>
      )}

      {!hasPPT && (
        <p className="text-sm text-red-500 text-right mt-2">
          Presentation upload is required before submission.
        </p>
      )}
    </div>
  );
};
