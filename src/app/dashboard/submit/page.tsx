
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { FileUp, ArrowRight, TriangleAlert, UserPlus, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperPrevious,
  StepperTrigger,
  useStepper,
} from '@/components/ui/stepper';

import { MOCK_INNOVATOR_USER, MOCK_INNOVATORS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { ROLES } from '@/lib/constants';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Lottie from 'lottie-react';
import { Badge } from '@/components/ui/badge';


const teamMemberSchema = z.object({
    email: z.string().email("Invalid email address."),
});

const submitIdeaSchema = z.object({
  teamName: z.string().min(1, 'Team Name is required.'),
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  pptFile: z
    .any()
    .refine((files) => files?.[0], 'PPT file is required.')
    .refine(
      (files) => files?.[0]?.name?.endsWith('.ppt') || files?.[0]?.name?.endsWith('.pptx'),
      'Please upload a .ppt or .pptx file.'
    ),
  domain: z.string().min(1, 'Project domain is required.'),
  otherDomain: z.string().optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
}).refine(data => {
    if (data.domain === 'Other') {
        return !!data.otherDomain && data.otherDomain.length > 0;
    }
    return true;
}, {
    message: 'Please specify your domain',
    path: ['otherDomain'],
});

type SubmitIdeaForm = z.infer<typeof submitIdeaSchema>;

const defaultValues: Partial<SubmitIdeaForm> = {
  teamName: '',
  title: '',
  description: '',
  domain: '',
  otherDomain: '',
  teamMembers: [],
};


function Step1({ form }: { form: any }) {
  const { setActiveStep, activeStep } = useStepper();
  const domain = form.watch('domain');

  const handleNext = async () => {
    const isValid = await form.trigger(["teamName", "title", "description", "pptFile", "domain", "otherDomain"]);
    if (isValid) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <StepperItem index={0}>
      <StepperTrigger>
        <CardTitle>Team & Idea Details</CardTitle>
        <CardDescription>Define your team and the core concept of your idea.</CardDescription>
      </StepperTrigger>
      <StepperContent>
        <div className="space-y-6 py-6">
            <FormField control={form.control} name="teamName" render={({ field }) => (
                <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl><Input placeholder="e.g., The Visionaries" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                    <FormLabel>Idea Title</FormLabel>
                    <FormControl><Input placeholder="e.g., AI-Powered Crop Disease Detection" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Briefly describe the core concept of your idea.</FormLabel>
                  <FormControl><Textarea placeholder="Describe the problem you're solving and your proposed solution..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
             <FormField control={form.control} name="pptFile" render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Please upload your Pitch Deck.</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="file" className="pl-10" accept=".ppt, .pptx" 
                        onChange={(e) => onChange(e.target.files)}
                       {...rest}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Please adhere to the provided PPT format guidelines.</FormDescription>
                  <FormMessage />
                </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="domain" render={({ field }) => (
                    <FormItem>
                    <FormLabel>What is the domain of your project?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a domain" /></SelectTrigger></FormControl>
                        <SelectContent>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="EdTech">EdTech</SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Smart Cities">Smart Cities</SelectItem>
                        <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                        <SelectItem value="SpaceTech">SpaceTech</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />
                {domain === 'Other' && (
                    <FormField control={form.control} name="otherDomain" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Please specify the domain</FormLabel>
                            <FormControl><Input placeholder="e.g., Sustainable Fashion" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                )}
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleNext}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
        </div>
      </StepperContent>
    </StepperItem>
  );
}

function Step2({ form }: { form: any }) {
    const { setActiveStep, activeStep } = useStepper();
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "teamMembers",
    });
    const { toast } = useToast();

    // Mock analysis status check
    const checkStatus = (email: string) => {
        const innovator = MOCK_INNOVATORS.find(inv => inv.email.toLowerCase() === email.toLowerCase());
        return innovator?.hasPsychometricAnalysis;
    }

    const handleInvite = (index: number) => {
        const email = form.getValues(`teamMembers.${index}.email`);
        toast({
            title: "Invite Sent!",
            description: `An invitation has been sent to ${email}.`,
        });
    };

    return (
        <StepperItem index={1}>
        <StepperTrigger>
          <CardTitle>Invite Co-Founders</CardTitle>
          <CardDescription>Add your team members to proceed. Each member must complete their psychometric analysis.</CardDescription>
        </StepperTrigger>
        <StepperContent>
            <div className="space-y-4 py-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-lg">
                       <FormField
                            control={form.control}
                            name={`teamMembers.${index}.email`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input {...field} placeholder="cofounder@example.com" />
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" onClick={() => handleInvite(index)}><Send className="h-4 w-4 mr-2" /> Invite</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                        {form.getValues(`teamMembers.${index}.email`) && (
                            checkStatus(form.getValues(`teamMembers.${index}.email`)) 
                            ? <Badge className="bg-green-500">Analysis Complete</Badge>
                            : <Badge variant="secondary">Pending Analysis</Badge>
                        )}
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => append({ email: "" })}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
            </div>

            <div className="flex justify-between">
                <StepperPrevious variant="outline" />
                <Button onClick={() => setActiveStep(activeStep + 1)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </StepperContent>
      </StepperItem>
    );
}

function Step3({ form, isSubmitting }: { form: any, isSubmitting: boolean }) {
    const allValues = form.getValues();
    
    const teamEmails = [MOCK_INNOVATOR_USER.email, ...(allValues.teamMembers?.map((m: any) => m.email).filter((e: string) => e) || [])];
    const allCompleted = teamEmails.every((email: string) => {
        const member = MOCK_INNOVATORS.find(inv => inv.email.toLowerCase() === email.toLowerCase());
        return member ? member.hasPsychometricAnalysis : false;
    });

    return (
         <StepperItem index={2}>
         <StepperTrigger>
          <CardTitle>Review and Submit</CardTitle>
          <CardDescription>Review your details before final submission.</CardDescription>
        </StepperTrigger>
         <StepperContent>
            <div className="space-y-6 py-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Team & Idea Details</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><span className="font-medium text-muted-foreground">Team Name:</span> {allValues.teamName}</p>
                        <p><span className="font-medium text-muted-foreground">Title:</span> {allValues.title}</p>
                        <p><span className="font-medium text-muted-foreground">Description:</span> {allValues.description}</p>
                        <p><span className="font-medium text-muted-foreground">PPT File:</span> {allValues.pptFile?.[0]?.name || 'Not provided'}</p>
                        <p><span className="font-medium text-muted-foreground">Domain:</span> {allValues.domain === 'Other' ? allValues.otherDomain : allValues.domain}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Team Members & Status</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center">
                            <span>{MOCK_INNOVATOR_USER.email} (Owner)</span>
                            <Badge className="bg-green-500">Analysis Complete</Badge>
                          </li>
                          {allValues.teamMembers?.map((member: any, index: number) => (
                              <li key={index} className="flex justify-between items-center">
                                  <span>{member.email}</span>
                                   {MOCK_INNOVATORS.find(inv => inv.email.toLowerCase() === member.email.toLowerCase())?.hasPsychometricAnalysis 
                                    ? <Badge className="bg-green-500">Analysis Complete</Badge>
                                    : <Badge variant="secondary">Pending Analysis</Badge>
                                }
                              </li>
                          ))}
                        </ul>
                         {!allCompleted && (
                            <p className="text-destructive text-sm mt-4">All team members must complete their psychometric analysis before you can submit.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-between">
              <StepperPrevious variant="outline" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button disabled={isSubmitting || !allCompleted} aria-label="Submit Idea (1 Credit)">
                        {isSubmitting ? 'Validating...' : 'Submit Idea (1 Credit)'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will use 1 credit from your account. Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => form.handleSubmit(form.onSubmit)()}>
                        Yes, Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

          </div>
        </StepperContent>
      </StepperItem>
    )
}

export default function SubmitIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [animationData, setAnimationData] = React.useState(null);

  React.useEffect(() => {
    fetch('https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json')
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);


  const form = useForm<SubmitIdeaForm>({
    resolver: zodResolver(submitIdeaSchema),
    defaultValues,
  });

  const onSubmit = async (data: SubmitIdeaForm) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting Idea...",
      description: "The AI is validating your idea. This may take a moment.",
    });

    const finalDomain = data.domain === 'Other' ? data.otherDomain : data.domain;

    try {
      const response = await fetch('/api/ideas/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          domain: finalDomain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to validate idea');
      }

      const result = await response.json();
      const newIdeaId = result.idea.id;
      const validationOutcome = result.idea.report.validationOutcome;

      toast({
        title: "Validation Complete!",
        description: `Your idea "${data.title}" has been evaluated with a status of: ${validationOutcome}`,
      });
      
      router.push(`/dashboard/ideas/${newIdeaId}?role=${ROLES.INNOVATOR}`);

    } catch (error) {
      console.error("Validation failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `There was an error validating your idea: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if founder has completed analysis
  if (!MOCK_INNOVATOR_USER.hasPsychometricAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
           <TriangleAlert className="mx-auto h-12 w-12 text-destructive" />
           <p className="mt-4 text-muted-foreground">You must complete your Founder Psychometric Analysis before you can submit an idea.</p>
        </CardContent>
        <CardFooter className="justify-center">
            <Button asChild>
                <Link href="/dashboard/psychometric-analysis?role=Innovator">Take Analysis</Link>
            </Button>
        </CardFooter>
      </Card>
    )
  }

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
              <Step1 form={form} />
              <Step2 form={form} />
              <Step3 form={form} isSubmitting={isSubmitting} />
            </Stepper>
          </form>
        </Form>
      </CardContent>
       {isSubmitting && animationData && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
            <div className="w-48 h-48">
              <Lottie animationData={animationData} loop={true} autoplay={true} />
            </div>
             <p className="text-muted-foreground mt-2 font-medium">AI is validating your idea...</p>
             <p className="text-muted-foreground text-sm">Please wait, this may take a moment.</p>
        </div>
      )}
    </Card>
  );
}
