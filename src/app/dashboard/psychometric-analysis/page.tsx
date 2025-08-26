
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

const defaultValues: Partial<FullForm> = {
    age: 25,
    gender: "",
    maritalStatus: "",
    siblings: 1,
    hometownTier: "",
    familyBusiness: "",
    highestDegree: "",
    major: "",
    schoolTier: "",
    hobbies: "",
    essay: "",
    responses: {},
};

const sectionFields = [
    { name: "Background", fields: ["age", "gender", "maritalStatus", "siblings", "hometownTier", "familyBusiness"], schema: backgroundSchema },
    { name: "Education", fields: ["highestDegree", "major", "schoolTier"], schema: educationSchema },
    { name: "Questionnaire", fields: psychometricQuestions.map(q => `responses.${q.id}`), schema: z.object({ responses: z.record(z.string().min(1)) }) },
    { name: "Goals & Interests", fields: ["hobbies", "essay"], schema: interestsSchema },
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
    const answeredQuestions = 
        currentQuestionIndices.reduce((acc, curr, index) => acc + (index < currentStep ? sectionFields[index].fields.length : curr), 0);

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
             // Last question of the section, validate all fields in section before proceeding
             const allSectionFieldsValid = await form.trigger(currentSection.fields as any);
             if (allSectionFieldsValid) {
                 setHighestCompletedStep(prev => Math.max(prev, currentStep));
                 if (currentStep < sectionFields.length - 1) {
                     setCurrentStep(prev => prev + 1);
                 } else {
                     // This is the final submit button
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
            case 'age': return <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />;
            case 'gender': return <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'maritalStatus': return <FormField control={form.control} name="maritalStatus" render={({ field }) => ( <FormItem><FormLabel>Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'siblings': return <FormField control={form.control} name="siblings" render={({ field }) => ( <FormItem><FormLabel>Number of Siblings</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />;
            case 'hometownTier': return <FormField control={form.control} name="hometownTier" render={({ field }) => ( <FormItem><FormLabel>Hometown City Tier</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tier 1">Tier 1 (Major Metro)</SelectItem><SelectItem value="Tier 2">Tier 2 (Metro)</SelectItem><SelectItem value="Tier 3">Tier 3 (Town/Rural)</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'familyBusiness': return <FormField control={form.control} name="familyBusiness" render={({ field }) => ( <FormItem><FormLabel>Do you come from a family with a business background?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'highestDegree': return <FormField control={form.control} name="highestDegree" render={({ field }) => ( <FormItem><FormLabel>Highest Educational Qualification</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Technology" {...field} /></FormControl><FormMessage /></FormItem> )} />;
            case 'major': return <FormField control={form.control} name="major" render={({ field }) => ( <FormItem><FormLabel>Major/Field of Study</FormLabel><FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl><FormMessage /></FormItem> )} />;
            case 'schoolTier': return <FormField control={form.control} name="schoolTier" render={({ field }) => ( <FormItem><FormLabel>University/College Tier</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Tier 1">Tier 1 (e.g., IIT, IIM, AIIMS)</SelectItem><SelectItem value="Tier 2">Tier 2 (e.g., NIT, Top State Universities)</SelectItem><SelectItem value="Tier 3">Tier 3 (Other Colleges)</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />;
            case 'hobbies': return <FormField control={form.control} name="hobbies" render={({ field }) => ( <FormItem><FormLabel>Hobbies & Interests</FormLabel><FormDescription>List a few of your hobbies or interests outside of work/academics.</FormDescription><FormControl><Input placeholder="e.g., Reading, Trekking, Chess" {...field} /></FormControl><FormMessage /></FormItem> )} />;
            case 'essay': return <FormField control={form.control} name="essay" render={({ field }) => ( <FormItem><FormLabel>Your Motivation</FormLabel><FormDescription>Briefly describe what drives you to become an entrepreneur. Our AI will analyze this response to understand your core motivations. (Min. 50 characters)</FormDescription><FormControl><Textarea rows={5} placeholder="Tell us your story..." {...field} /></FormControl><FormMessage /></FormItem> )} />;
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
                             <Tabs value={String(currentStep)} onValueChange={(val) => setCurrentStep(Number(val))} className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    {sectionFields.map((tab, index) => (
                                        <TabsTrigger 
                                            key={tab.name} 
                                            value={String(index)} 
                                            disabled={index > highestCompletedStep + 1}
                                            onClick={() => {
                                                if (index <= highestCompletedStep + 1) {
                                                    setCurrentStep(index);
                                                }
                                            }}
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
