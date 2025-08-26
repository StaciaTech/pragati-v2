
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, ArrowLeft, ArrowRight, TriangleAlert } from 'lucide-react';
import { MOCK_INNOVATOR_USER } from '@/lib/mock-data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

// Schemas for each section
const backgroundSchema = z.object({
  age: z.coerce.number().min(18, "Must be at least 18").max(100),
  hometownTier: z.string().min(1, "Hometown tier is required."),
  familyBusiness: z.string().min(1, "This field is required."),
});

const educationSchema = z.object({
  highestDegree: z.string().min(1, "Highest degree is required."),
  major: z.string().min(1, "Major is required."),
  schoolTier: z.string().min(1, "School tier is required."),
});

const goalsAndInterestsSchema = z.object({
    essay: z.string().min(100, "Essay must be at least 100 characters long to allow for meaningful analysis."),
});

const psychometricQuestions = [
    // Section 1: Personality & Mindset
    { id: 'S1Q1', section: 'Personality & Mindset', question: "After a significant setback, I'm usually the first to start exploring what can be learned from the experience." },
    { id: 'S1Q2', section: 'Personality & Mindset', question: "I'm more drawn to a project with a 30% chance of a 10x return than one with an 80% chance of a 2x return." },
    { id: 'S1Q3', section: 'Personality & Mindset', question: "I prefer to have a well-defined plan before starting, rather than adapting as I go." },
    
    // Section 2: Motivation & Values
    { id: 'S2Q1', section: 'Motivation & Values', question: "The primary driver for my professional ambitions is solving a problem I find deeply meaningful." },
    { id: 'S2Q2', section: 'Motivation & Values', question: "Building something that benefits a large community is more appealing than building something that generates maximum personal wealth." },
    
    // Section 3: Abilities & Skills
    { id: 'S3Q1', section: 'Abilities & Skills', question: "I can quickly identify underlying patterns and connections in complex, unfamiliar information." },
    { id: 'S3Q2', section: 'Abilities & Skills', question: "When faced with an unexpected obstacle, my first instinct is to brainstorm multiple, distinct solutions." },
    { id: 'S3Q3', section: 'Abilities & Skills', question: "I actively maintain a network of professional contacts, even when I don't need anything from them." },

    // Section 4: Situational Judgement
    { id: 'S4Q1', section: 'Situational Judgement', question: "If a key team member strongly disagrees with a strategic decision I've made, my first step is to fully understand their perspective before moving forward." },
    { id: 'S4Q2', section: 'Situational Judgement', question: "If I discovered a flaw in my product that could be exploited but would be hard for customers to notice, I would prioritize fixing it immediately, even if it delays a launch." },
];

const fullSchema = backgroundSchema.merge(educationSchema).merge(goalsAndInterestsSchema).extend({
    responses: z.record(z.string().min(1, "Please select an answer.")).refine(val => Object.keys(val).length === psychometricQuestions.length, {
        message: "Please answer all questions.",
    }),
});

type FullForm = z.infer<typeof fullSchema>;

const defaultValues: Partial<FullForm> = {
    age: 25,
    gender: "",
    hometownTier: "",
    familyBusiness: "",
    highestDegree: "",
    major: "",
    schoolTier: "",
    essay: "",
    responses: {},
};


const sectionFields = [
    { name: "Background", fields: ["age", "hometownTier", "familyBusiness"], schema: backgroundSchema },
    { name: "Education", fields: ["highestDegree", "major", "schoolTier"], schema: educationSchema },
    { name: "Questionnaire", fields: psychometricQuestions.map(q => `responses.${q.id}`), schema: z.object({ responses: z.record(z.string().min(1)) }) },
    { name: "Goals & Interests", fields: ["essay"], schema: goalsAndInterestsSchema },
];


export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);
    
    const [currentStep, setCurrentStep] = React.useState(0);
    const [currentQuestionIndices, setCurrentQuestionIndices] = React.useState<number[]>(Array(sectionFields.length).fill(0));
    const [highestCompletedStep, setHighestCompletedStep] = React.useState(-1);

    const form = useForm<FullForm>({
        resolver: zodResolver(fullSchema),
        defaultValues,
        mode: 'onChange',
    });

    const totalQuestions = sectionFields.reduce((acc, section) => acc + section.fields.length, 0);
    const answeredQuestions = currentQuestionIndices.reduce((total, sectionCurrentIndex, sectionIndex) => {
        if (sectionIndex < currentStep) {
            return total + sectionFields[sectionIndex].fields.length;
        }
        if (sectionIndex === currentStep) {
            return total + sectionCurrentIndex;
        }
        return total;
    }, 0);
    
    const overallProgress = (answeredQuestions / totalQuestions) * 100;
    
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
            form.reset(defaultValues);
            setCurrentStep(0);
            setCurrentQuestionIndices(Array(sectionFields.length).fill(0));
            setHighestCompletedStep(-1);
            toast({ title: "Request Approved", description: "1 credit has been used. You can now retake the analysis." });
        } else {
            toast({ variant: "destructive", title: "Insufficient Credits", description: "You do not have enough credits to request a retest." });
        }
    }
    
    const handleNext = async () => {
        const currentSection = sectionFields[currentStep];
        const currentQuestionIndex = currentQuestionIndices[currentStep];
        const fieldName = currentSection.fields[currentQuestionIndex];
        
        const isValid = await form.trigger(fieldName as any);
        if (!isValid) return;

        if (currentQuestionIndex < currentSection.fields.length - 1) {
            setCurrentQuestionIndices(prev => {
                const newIndices = [...prev];
                newIndices[currentStep]++;
                return newIndices;
            });
        } else {
             const allSectionFieldsValid = await form.trigger(currentSection.fields as any);
             if (allSectionFieldsValid) {
                 setHighestCompletedStep(prev => Math.max(prev, currentStep));
                 if (currentStep < sectionFields.length - 1) {
                     setCurrentStep(prev => prev + 1);
                 } else {
                     form.handleSubmit(onSubmit)();
                 }
             }
        }
    }

    const handlePrevious = () => {
        const currentQuestionIndex = currentQuestionIndices[currentStep];
        if (currentQuestionIndex > 0) {
             setCurrentQuestionIndices(prev => {
                const newIndices = [...prev];
                newIndices[currentStep]--;
                return newIndices;
            });
        } else {
            if (currentStep > 0) {
                setCurrentStep(prev => prev - 1);
            }
        }
    }
    
    const renderField = (fieldName: string) => {
        switch(fieldName) {
            case 'age': return <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>What is your age?</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />;
            case 'hometownTier': return <FormField control={form.control} name="hometownTier" render={({ field }) => ( <FormItem><FormLabel>Which category best describes your hometown?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tier 1">Tier 1 (Major Metro)</SelectItem><SelectItem value="Tier 2">Tier 2 (Metro)</SelectItem><SelectItem value="Tier 3">Tier 3 (Town/Rural)</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'familyBusiness': return <FormField control={form.control} name="familyBusiness" render={({ field }) => ( <FormItem><FormLabel>Do you come from a family with a business background?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'highestDegree': return <FormField control={form.control} name="highestDegree" render={({ field }) => ( <FormItem><FormLabel>What is your highest educational qualification?</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Technology" {...field} /></FormControl><FormMessage /></FormItem> )} />;
            case 'major': return <FormField control={form.control} name="major" render={({ field }) => ( <FormItem><FormLabel>What was your major/field of study?</FormLabel><FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl><FormMessage /></FormItem> )} />;
            case 'schoolTier': return <FormField control={form.control} name="schoolTier" render={({ field }) => ( <FormItem><FormLabel>Which tier best describes your university/college?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tier 1">Tier 1 (e.g., IIT, IIM, AIIMS)</SelectItem><SelectItem value="Tier 2">Tier 2 (e.g., NIT, Top State Universities)</SelectItem><SelectItem value="Tier 3">Tier 3 (Other Colleges)</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'essay': return <FormField control={form.control} name="essay" render={({ field }) => ( <FormItem><FormLabel>Why do you want to be an entrepreneur?</FormLabel><FormDescription>Describe what drives you. Our AI will analyze this response to understand your core motivations. (Min. 100 characters)</FormDescription><FormControl><Textarea rows={8} placeholder="Tell us your story, your vision, and what you hope to achieve..." {...field} /></FormControl><FormMessage /></FormItem> )} />;
            default:
                if (fieldName.startsWith('responses.')) {
                    const questionId = fieldName.split('.')[1];
                    const question = psychometricQuestions.find(q => q.id === questionId);
                    if (!question) return null;
                     return (
                        <FormField
                            control={form.control}
                            name={fieldName as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl font-semibold text-center text-foreground leading-relaxed block">{question.question}</FormLabel>
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
                     )
                }
                return null;
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
    
    if (!MOCK_INNOVATOR_USER.hasPsychometricAnalysis && !isCompleted) {
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
                <Button onClick={() => setIsCompleted(true)}>Take Analysis</Button>
            </CardFooter>
          </Card>
        )
    }

    const currentSection = sectionFields[currentStep];
    const currentQuestionIndex = currentQuestionIndices[currentStep];
    const fieldName = currentSection.fields[currentQuestionIndex];
    const isLastQuestionInSection = currentQuestionIndex === currentSection.fields.length - 1;
    const isFinalStep = currentStep === sectionFields.length - 1 && isLastQuestionInSection;


    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 animate-background-pan -z-10" />

            <Card className="w-full max-w-4xl bg-background/80 backdrop-blur-lg border-white/20 shadow-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Founder Psychometric Analysis</CardTitle>
                            <CardDescription>This comprehensive analysis helps us understand your unique strengths. The first attempt is free.</CardDescription>
                            <Progress value={overallProgress} className="mt-4"/>
                            <p className="text-right text-xs text-muted-foreground mt-1">{Math.round(overallProgress)}% Complete</p>
                        </CardHeader>
                        <CardContent>
                             <Tabs value={String(currentStep)} className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    {sectionFields.map((tab, index) => (
                                        <TabsTrigger 
                                            key={tab.name} 
                                            value={String(index)} 
                                            disabled={index > highestCompletedStep + 1}
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            {tab.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                 <div className="py-6 min-h-[300px] flex flex-col justify-center">
                                     <Card className="bg-transparent border-0 shadow-none">
                                        <CardContent>
                                            {renderField(fieldName)}
                                        </CardContent>
                                     </Card>
                                 </div>
                            </Tabs>
                        </CardContent>
                         <CardFooter className="flex justify-between">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handlePrevious}
                                disabled={currentStep === 0 && currentQuestionIndex === 0}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                           
                            <Button type="button" onClick={handleNext}>
                                {isFinalStep ? 'Submit Analysis' : (isLastQuestionInSection ? 'Next Section' : 'Next')} 
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                           
                         </CardFooter>
                    </form>
                </Form>
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Analyzing your responses...</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
