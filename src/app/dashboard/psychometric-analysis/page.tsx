
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
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
    essay: z.string().min(50, "Essay must be at least 50 characters long."),
});

const psychometricQuestions = [
    // Opportunity Orientation
    { id: 'O1', category: 'Opportunity Orientation', question: "I regularly talk to potential users/customers before building." },
    { id: 'O2', category: 'Opportunity Orientation', question: "I can reframe problems to uncover hidden needs." },
    { id: 'O3', category: 'Opportunity Orientation', question: "I validate assumptions with small experiments." },
    { id: 'O4', category: 'Opportunity Orientation', question: "I track competitors and analog markets for ideas." },

    // Execution Discipline
    { id: 'E1', category: 'Execution Discipline', question: "I break goals into weekly, measurable tasks." },
    { id: 'E2', category: 'Execution Discipline', question: "My teammates would call me reliable." },
    { id: 'E3', category: 'Execution Discipline', question: "I hit deadlines even under pressure." },
    { id: 'E4', category: 'Execution Discipline', question: "I maintain operating cadences (standups, reviews)." },

    // Resilience
    { id: 'R1', category: 'Resilience', question: "Setbacks energize me to try again." },
    { id: 'R2', category: 'Resilience', question: "I persist when results are slow." },
    { id: 'R3', category: 'Resilience', question: "I can work through prolonged uncertainty." },
    { id: 'R4', category: 'Resilience', question: "I recover quickly from tough feedback." },

    // Learning Agility
    { id: 'L1', category: 'Learning Agility', question: "I seek feedback even when uncomfortable." },
    { id: 'L2', category: 'Learning Agility', question: "I can learn a new skill within weeks when needed." },
    { id: 'L3', category: 'Learning Agility', question: "I run frequent postmortems on my work." },
    { id: 'L4', category: 'Learning Agility', question: "I adjust direction quickly based on new data." },
    
    // Ambiguity Tolerance
    { id: 'A1', category: 'Ambiguity Tolerance', question: "I’m comfortable deciding with incomplete information." },
    { id: 'A2', category: 'Ambiguity Tolerance', question: "I can hold multiple hypotheses at once." },
    { id: 'A3', category: 'Ambiguity Tolerance', question: "I treat ambiguity as a creative space." },
    { id: 'A4', category: 'Ambiguity Tolerance', question: "I avoid over‑analysis before taking first steps." },
    
     // Risk Calibration
    { id: 'K1', category: 'Risk Calibration', question: "I take calculated risks with clear downside plans." },
    { id: 'K2', category: 'Risk Calibration', question: "I cap exposure via budget/time limits." },
    { id: 'K3', category: 'Risk Calibration', question: "I run pre‑mortems to anticipate failure modes." },
    { id: 'K4', category: 'Risk Calibration', question: "I diversify bets instead of all‑in." },

    // Founder-Market Fit
    { id: 'F1', category: 'Founder-Market Fit', question: "I have deep domain knowledge relevant to my idea." },
    { id: 'F2', category: 'Founder-Market Fit', question: "I possess or can reach key decision-makers in the space." },
    { id: 'F3', category: 'Founder-Market Fit', question: "My track record grants me credibility with customers/investors." },
    { id: 'F4', category: 'Founder-Market Fit', question: "I enjoy spending time with this user/problem group." },

    // Leadership & Influence
    { id: 'D1', category: 'Leadership & Influence', question: "I can attract strong people to work with me." },
    { id: 'D2', category: 'Leadership & Influence', question: "I give clear, motivating direction." },
    { id: 'D3', category: 'Leadership & Influence', question: "I handle conflict quickly and fairly." },
    { id: 'D4', category: 'Leadership & Influence', question: "I coach people to grow." },

    // Ethics & Integrity
    { id: 'H1', category: 'Ethics & Integrity', question: "I refuse deals that compromise my core values." },
    { id: 'H2', category: 'Ethics & Integrity', question: "I prioritize establishing basic compliance (data, finance, labor) early." },
    { id: 'H3', category: 'Ethics & Integrity', question: "I am transparent with stakeholders about risks and tradeoffs." },
    { id: 'H4', category: 'Ethics & Integrity', question: "I make it a point to keep promises to users and partners." },

    // Focus & Prioritization
    { id: 'C1', category: 'Focus & Prioritization', question: "I am comfortable saying no to good ideas to protect great ones." },
    { id: 'C2', category: 'Focus & Prioritization', question: "I prefer to operate with a single 'North Star' metric." },
    { id: 'C3', category: 'Focus & Prioritization', question: "I can quickly drop initiatives that don’t move the needle." },
    { id: 'C4', category: 'Focus & Prioritization', question: "I time‑box my exploration of new ideas before committing fully." },
];

const fullSchema = backgroundSchema.merge(educationSchema).merge(interestsSchema).extend({
    responses: z.record(z.string().min(1, "Please select an answer.")).refine(val => Object.keys(val).length === psychometricQuestions.length, {
        message: "Please answer all questions.",
    }),
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

    const handlePsychNext = async () => {
        const currentQuestion = psychometricQuestions[currentQuestionIndex];
        const isValid = await form.trigger(`responses.${currentQuestion.id}`);
        if(!isValid) return;

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
        <div className="space-y-4 min-h-[350px] flex flex-col justify-between">
            <div>
                <Progress value={progress} className="w-full mb-4" />
                <p className="text-center text-sm text-muted-foreground mb-4">{currentQuestion.category} - Question {currentQuestionIndex + 1} of {psychometricQuestions.length}</p>
                <Card className="bg-background/80 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-center text-foreground leading-relaxed">{currentQuestion.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name={`responses.${currentQuestion.id}`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup 
                                            className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
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
                                    <FormMessage className="text-center pt-2" />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-between mt-4">
                <Button type="button" variant="outline" onClick={handlePsychPrev}>
                   <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button type="button" onClick={handlePsychNext}>
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
                <FormItem><FormLabel>Your Motivation</FormLabel><FormDescription>Briefly describe what drives you to become an entrepreneur. Our AI will analyze this response to understand your core motivations. (Min. 50 characters)</FormDescription><FormControl><Textarea rows={5} placeholder="Tell us your story..." {...field} /></FormControl><FormMessage /></FormItem>
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
    const [activeStep, setActiveStep] = React.useState(0);

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
            setActiveStep(0);
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

    const steps = [
        { label: "Background", content: <Step1 form={form} onNext={() => setActiveStep(1)} /> },
        { label: "Education", content: <Step2 form={form} onNext={() => setActiveStep(2)} onPrev={() => setActiveStep(0)} /> },
        { label: "Questionnaire", content: <Step3 form={form} onNext={() => setActiveStep(3)} onPrev={() => setActiveStep(1)} /> },
        { label: "Goals & Interests", content: <Step4 form={form} onPrev={() => setActiveStep(2)} /> },
    ];

    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 animate-background-pan -z-10" />

            <Card className="w-full max-w-4xl bg-background/80 backdrop-blur-lg border-white/20 shadow-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Founder Psychometric Analysis</CardTitle>
                            <CardDescription>This comprehensive analysis helps us understand your unique strengths. The first attempt is free.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {steps.map((step, index) => (
                                    <StepperItem key={index} index={index}>
                                        <StepperTrigger>
                                            <h3 className="font-semibold">{step.label}</h3>
                                        </StepperTrigger>
                                        <StepperContent>
                                            {step.content}
                                        </StepperContent>
                                    </StepperItem>
                                ))}
                            </Stepper>
                        </CardContent>
                    </form>
                </Form>
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                )}
            </Card>
        </div>
    );
}
