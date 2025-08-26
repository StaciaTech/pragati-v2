
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

const backgroundSchema = z.object({
  age: z.coerce.number().min(18, "Must be at least 18").max(100),
  gender: z.string().min(1, "Gender is required."),
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
    // Personality & Traits
    { id: 'P1', category: 'Personality & Traits', question: "When a project fails, my first instinct is to analyze what I can learn from it." },
    { id: 'P2', category: 'Personality & Traits', question: "I am more drawn to situations with high potential rewards, even if they come with significant risk." },
    { id: 'P3', category: 'Personality & Traits', question: "I often find myself starting new projects or initiatives without being asked." },
    { id: 'P4', category: 'Personality & Traits', question: "I prefer having full control over the final outcome of my work." },

    // Cognitive & Analytical Abilities
    { id: 'C1', category: 'Cognitive & Analytical Abilities', question: "I can quickly identify underlying patterns in complex information." },
    { id: 'C2', category: 'Cognitive & Analytical Abilities', question: "When faced with a new, unfamiliar problem, I feel energized rather than intimidated." },
    { id: 'C3', category: 'Cognitive & Analytical Abilities', question: "I am adept at generating multiple, distinct solutions to a single problem." },
    
    // Socio-Cultural & Background Factors
    { id: 'B1', category: 'Socio-Cultural & Background Factors', question: "My upbringing emphasized stability and following a set career path." },
    { id: 'B2', category: 'Socio-Cultural & Background Factors', question: "I have had significant exposure to people from different cultures and socio-economic backgrounds." },
    
    // Motivational Drivers
    { id: 'M1', category: 'Motivational Drivers', question: "The main reason I want to start a business is to solve a problem I am passionate about, regardless of the financial outcome." },
    { id: 'M2', category: 'Motivational Drivers', question: "Building something that impacts a large community is more appealing than building something that makes a lot of money for a few." },
    
    // Interpersonal & Team Dynamics
    { id: 'T1', category: 'Interpersonal & Team Dynamics', question: "When a team member disagrees with my direction, I make it a priority to understand their perspective fully before deciding on a path forward." },
    { id: 'T2', category: 'Interpersonal & Team Dynamics', question: "I am comfortable giving direct, constructive feedback to a colleague, even if it might be uncomfortable." },
    
    // Mental State & Well-being
    { id: 'W1', category: 'Mental State & Well-being', question: "Under high pressure, I am able to remain calm and make logical decisions." },
    { id: 'W2', category: 'Mental State & Well-being', question: "I believe that fundamental abilities can be significantly developed through dedication and hard work." },
    
    // Entrepreneurial & Domain-Specific Factors
    { id: 'E1', category: 'Entrepreneurial & Domain-Specific Factors', question: "I am more of a 'doer' who likes to build and test things, rather than an 'ideas person' who prefers to strategize." },
    { id: 'E2', category: 'Entrepreneurial & Domain-Specific Factors', question: "I actively maintain a network of professional contacts." },
    
    // Creativity & Innovation Potential
    { id: 'I1', category: 'Creativity & Innovation Potential', question: "I often connect ideas from different, unrelated fields to create something new." },
    { id: 'I2', category: 'Creativity & Innovation Potential', question: "I would rather launch a product that is 80% perfect and get feedback, than wait until it is 100% perfect." },

    // Ethical & Value Systems
    { id: 'V1', category: 'Ethical & Value Systems', question: "I would walk away from a highly profitable opportunity if it conflicted with my core values." },
    { id: 'V2', category: 'Ethical & Value Systems', question: "It is important to be completely transparent with stakeholders, even when the news is bad." },
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
    { name: "Background", fields: ["age", "gender", "hometownTier", "familyBusiness"], schema: backgroundSchema },
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

    const answeredQuestions = currentQuestionIndices.reduce((total, sectionCurrentIndex, sectionIndex) => {
        const section = sectionFields[sectionIndex];
        if (sectionIndex < currentStep) {
            return total + section.fields.length;
        }
        if (sectionIndex === currentStep) {
            return total + sectionCurrentIndex;
        }
        return total;
    }, 0);
    
    const totalQuestions = sectionFields.reduce((acc, section) => acc + section.fields.length, 0);
    
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
            form.reset();
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
            case 'gender': return <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>What is your gender?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
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
    
    if (!MOCK_INNOVATOR_USER.hasPsychometricAnalysis && isCompleted) {
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

    