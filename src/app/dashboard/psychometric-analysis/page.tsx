
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperTrigger,
  useStepper,
} from '@/components/ui/stepper';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, ArrowLeft, ArrowRight, TriangleAlert } from 'lucide-react';
import { MOCK_INNOVATOR_USER } from '@/lib/mock-data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const backgroundSchema = z.object({
  age: z.coerce.number().min(18, "Must be at least 18").max(100),
  gender: z.string().min(1, "Gender is required."),
  maritalStatus: z.string().min(1, "Marital status is required."),
  siblings: z.coerce.number().min(0).max(20),
  hometownTier: z.string().min(1, "Hometown tier is required."),
  familyBusiness: z.string().min(1, "This field is required."),
});

const educationSchema = z.object({
    highestDegree: z.string().min(1, "Highest degree is required."),
    major: z.string().min(1, "Major is required."),
    schoolTier: z.string().min(1, "School tier is required."),
});

const interestsSchema = z.object({
    hobbies: z.string().min(1, "Please list at least one hobby."),
    essay: z.string().min(50, "Essay must be at least 50 characters."),
});

const psychometricQuestions = [
    { id: 'O1', category: 'Opportunity Orientation', question: "I regularly talk to potential users/customers before building." },
    { id: 'O2', category: 'Opportunity Orientation', question: "I can reframe problems to uncover hidden needs." },
    { id: 'O3', category: 'Opportunity Orientation', question: "I validate assumptions with small experiments." },
    { id: 'O4', category: 'Opportunity Orientation', question: "I track competitors and analog markets for ideas." },

    { id: 'E1', category: 'Execution Discipline', question: "I break goals into weekly, measurable tasks." },
    { id: 'E2', category: 'Execution Discipline', question: "My teammates would call me reliable." },
    { id: 'E3', category: 'Execution Discipline', question: "I hit deadlines even under pressure." },
    { id: 'E4', category: 'Execution Discipline', question: "I maintain operating cadences (standups, reviews)." },

    { id: 'R1', category: 'Resilience', question: "Setbacks energize me to try again." },
    { id: 'R2', category: 'Resilience', question: "I persist when results are slow." },
    { id: 'R3', category: 'Resilience', question: "I can work through prolonged uncertainty." },
    { id: 'R4', category: 'Resilience', question: "I recover quickly from tough feedback." },
];

const fullSchema = backgroundSchema.merge(educationSchema).merge(interestsSchema).extend({
    responses: z.record(z.string().min(1, "Please select an answer.")),
});

type FullForm = z.infer<typeof fullSchema>;

const Step1 = ({ form, onNext }: { form: any, onNext: () => void }) => {
    const handleNext = async () => {
        const isValid = await form.trigger(["age", "gender", "maritalStatus", "siblings", "hometownTier", "familyBusiness"]);
        if (isValid) {
            onNext();
        }
    };
    return (
        <div className="space-y-6">
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                <FormItem><FormLabel>Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="siblings" render={({ field }) => (
                <FormItem><FormLabel>Number of Siblings</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="hometownTier" render={({ field }) => (
                <FormItem><FormLabel>Hometown City Tier</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tier 1">Tier 1 (Major Metro)</SelectItem><SelectItem value="Tier 2">Tier 2 (Metro)</SelectItem><SelectItem value="Tier 3">Tier 3 (Town/Rural)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="familyBusiness" render={({ field }) => (
                <FormItem><FormLabel>Do you come from a family with a business background?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end">
                <Button type="button" onClick={handleNext}>Next</Button>
            </div>
        </div>
    )
}

const Step2 = ({ form, onNext, onPrev }: { form: any, onNext: () => void, onPrev: () => void }) => {
     const handleNext = async () => {
        const isValid = await form.trigger(["highestDegree", "major", "schoolTier"]);
        if (isValid) {
            onNext();
        }
    };
    return (
        <div className="space-y-6">
            <FormField control={form.control} name="highestDegree" render={({ field }) => (
                <FormItem><FormLabel>Highest Educational Qualification</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Technology" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="major" render={({ field }) => (
                <FormItem><FormLabel>Major/Field of Study</FormLabel><FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="schoolTier" render={({ field }) => (
                <FormItem><FormLabel>University/College Tier</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tier 1">Tier 1 (e.g., IIT, IIM, AIIMS)</SelectItem><SelectItem value="Tier 2">Tier 2 (e.g., NIT, Top State Universities)</SelectItem><SelectItem value="Tier 3">Tier 3 (Other Colleges)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onPrev}>Previous</Button>
                <Button type="button" onClick={handleNext}>Next</Button>
            </div>
        </div>
    )
}

const Step3 = ({ form, onNext, onPrev }: { form: any, onNext: () => void, onPrev: () => void }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const progress = ((currentQuestionIndex + 1) / psychometricQuestions.length) * 100;

    const handlePsychNext = () => {
        if (currentQuestionIndex < psychometricQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            onNext();
        }
    };

    const handlePsychPrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            onPrev();
        }
    }
    
    const currentQuestion = psychometricQuestions[currentQuestionIndex];

    return (
        <div className="space-y-8 min-h-[300px]">
            <Progress value={progress} className="w-full" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">{currentQuestion.category}</p>
                <Label className="text-lg mt-2 block">{currentQuestionIndex + 1}. {currentQuestion.question}</Label>
                <FormField
                    control={form.control}
                    name={`responses.${currentQuestion.id}`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup 
                                    className="flex flex-col sm:flex-row gap-4 mt-4"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="1" /></FormControl><FormLabel>Strongly Disagree</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="2" /></FormControl><FormLabel>Disagree</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="3" /></FormControl><FormLabel>Neutral</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="4" /></FormControl><FormLabel>Agree</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="5" /></FormControl><FormLabel>Strongly Agree</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePsychPrev}>
                   <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button type="button" onClick={handlePsychNext} disabled={!form.getValues(`responses.${currentQuestion.id}`)}>
                    {currentQuestionIndex < psychometricQuestions.length - 1 ? 'Next' : 'Next Section'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

const Step4 = ({ form, onPrev }: { form: any, onPrev: () => void }) => {
    return (
        <div className="space-y-6">
            <FormField control={form.control} name="hobbies" render={({ field }) => (
                <FormItem><FormLabel>Hobbies & Interests</FormLabel><FormDescription>List a few of your hobbies or interests outside of work/academics.</FormDescription><FormControl><Input placeholder="e.g., Reading, Trekking, Chess" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="essay" render={({ field }) => (
                <FormItem><FormLabel>Your Motivation</FormLabel><FormDescription>Briefly describe what drives you to become an entrepreneur. (Min. 50 characters)</FormDescription><FormControl><Textarea rows={5} placeholder="Tell us your story..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onPrev}>Previous</Button>
                <Button type="submit">Submit Analysis</Button>
            </div>
        </div>
    )
}


export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);

    const form = useForm<FullForm>({
        resolver: zodResolver(fullSchema),
        defaultValues: {
            responses: {},
        }
    });

    const onSubmit = (data: FullForm) => {
        setIsLoading(true);
        toast({ title: "Submitting Analysis...", description: "Please wait while we process your results." });

        setTimeout(() => {
            MOCK_INNOVATOR_USER.hasPsychometricAnalysis = true; 
            setIsLoading(false);
            setIsCompleted(true);
            toast({ title: "Analysis Complete!", description: "Your psychometric profile has been generated." });
            router.push('/dashboard/psychometric-analysis/report?role=Innovator');
        }, 2000);
    };

    const handleRetest = () => {
        if (MOCK_INNOVATOR_USER.credits > 0) {
            MOCK_INNOVATOR_USER.credits -= 1;
            setIsCompleted(false);
            form.reset();
            toast({ title: "Request Approved", description: "1 credit has been used. You can now retake the analysis." });
        } else {
            toast({ variant: "destructive", title: "Insufficient Credits", description: "You do not have enough credits to request a retest." });
        }
    }
    
    if (isCompleted && !isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Analysis Complete</CardTitle>
                    <CardDescription>Your psychometric profile has been generated. You can view your report or request a retest.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-8">
                     <Check className="w-16 h-16 text-green-500 mb-4" />
                     <p className="text-muted-foreground">You can view your detailed profile and upskilling plan on your personal report page.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Button variant="outline" onClick={handleRetest}>Request Retest (1 Credit)</Button>
                     <div className="flex gap-2">
                        <Button asChild variant="secondary"><Link href="/dashboard/psychometric-analysis/report?role=Innovator">View Report</Link></Button>
                        <Button asChild><Link href="/dashboard/submit?role=Innovator">Submit an Idea</Link></Button>
                     </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Founder Psychometric Analysis</CardTitle>
                        <CardDescription>This comprehensive analysis helps us understand your unique strengths. The first attempt is free.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Stepper>
                            <StepperItem index={0}>
                                <StepperTrigger><CardTitle>Background</CardTitle></StepperTrigger>
                                <StepperContent><Step1 form={form} onNext={() => form.setValue('stepper', 1)} /></StepperContent>
                            </StepperItem>
                            <StepperItem index={1}>
                                <StepperTrigger><CardTitle>Education</CardTitle></StepperTrigger>
                                <StepperContent><Step2 form={form} onNext={() => form.setValue('stepper', 2)} onPrev={() => form.setValue('stepper', 0)}/></StepperContent>
                            </StepperItem>
                            <StepperItem index={2}>
                                <StepperTrigger><CardTitle>Questionnaire</CardTitle></StepperTrigger>
                                <StepperContent><Step3 form={form} onNext={() => form.setValue('stepper', 3)} onPrev={() => form.setValue('stepper', 1)} /></StepperContent>
                            </StepperItem>
                             <StepperItem index={3}>
                                <StepperTrigger><CardTitle>Interests & Goals</CardTitle></StepperTrigger>
                                <StepperContent><Step4 form={form} onPrev={() => form.setValue('stepper', 2)} /></StepperContent>
                            </StepperItem>
                        </Stepper>
                    </CardContent>
                </form>
            </Form>
             {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            )}
        </Card>
    );
}
