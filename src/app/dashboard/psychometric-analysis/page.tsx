
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

const psychometricQuestions = [
    // Section 1: Background & Experience
    { id: 'S1Q1', section: 'Background & Experience', question: "Which statement best describes your family's professional background?", type: 'radio', options: ["Primarily business/entrepreneurial", "Primarily salaried professionals (doctors, engineers)", "Primarily government service", "Primarily agriculture/skilled trades", "Mixed or other"] },
    { id: 'S1Q2', section: 'Background & Experience', question: "Growing up, how was failure generally viewed in your household?", type: 'radio', options: ["As a valuable learning opportunity", "As something to be avoided but was understood", "As a significant disappointment", "It was not openly discussed"] },
    { id: 'S1Q3', section: 'Background & Experience', question: "Describe a significant non-academic project or hobby you were passionate about during your school or college years. What did you learn from it?", type: 'textarea' },

    // Section 2: Personality & Mindset
    { id: 'S2Q1', section: 'Personality & Mindset', question: "A promising new technology emerges, but it's completely outside your area of expertise. What is your most likely first reaction?", type: 'radio', options: ["Dive in and start learning it immediately", "Wait to see how it develops and is used by others", "Find an expert to explain its potential to me", "Ignore it unless it becomes directly relevant to my work"] },
    { id: 'S2Q2', section: 'Personality & Mindset', question: "You've been working on a difficult project for months with little progress. What's your next move?", type: 'radio', options: ["Double down on my current approach, believing persistence is key", "Take a step back to analyze what's not working and pivot", "Seek advice from a mentor or expert", "Move on to a different, more promising project"] },
    
    // Section 3: Motivation & Values
    { id: 'S3Q1', section: 'Motivation & Values', question: "Which of these outcomes for your startup would make you the most proud?", type: 'radio', options: ["Creating a highly profitable, market-leading company", "Solving a major social or environmental problem", "Building a beloved product used by millions", "Gaining recognition as a top innovator in your field"] },
    { id: 'S3Q2', section: 'Motivation & Values', question: "You discover a legal loophole that could significantly increase your profits but sits in a morally grey area. How do you proceed?", type: 'radio', options: ["Exploit it; it's business", "Consult lawyers to understand the risks, then decide", "Avoid it, as it doesn't align with my values", "Try to find a different way to achieve the same result ethically"] },
    
    // Section 4: Abilities & Skills
    { id: 'S4Q1', section: 'Abilities & Skills', question: "You are given data sets from three unrelated industries: farming, e-commerce, and healthcare. What is your approach to finding a potential business opportunity?", type: 'radio', options: ["Look for a common problem or inefficiency across all three", "Focus on the industry I know best", "Analyze the market with the highest growth potential", "Try to combine elements from each to create a new service"] },
    { id: 'S4Q2', section: 'Abilities & Skills', question: "A key team member comes to you with a personal problem that's affecting their work. What is your first step?", type: 'radio', options: ["Listen actively and express empathy for their situation", "Offer practical solutions to solve their problem quickly", "Refer them to HR or a professional for support", "Give them space and time off to handle it"] },
    
    // Section 5: Situational Judgement
    { id: 'S5Q1', section: 'Situational Judgement', question: "Your initial product launch gets a lukewarm response. Your team is demoralized. What message do you deliver?", type: 'radio', options: ["'We failed, but we will learn and do better next time.'", "'The market isn't ready for our vision; we need to educate them.'", "'Let's celebrate the launch and focus on the small wins and positive feedback.'", "'We need to analyze the data objectively and iterate immediately.'"] },
    { id: 'S5Q2', section: 'Situational Judgement', question: "A major competitor just launched a feature you've been developing for six months. What do you do?", type: 'radio', options: ["Scrap our version and go back to the drawing board", "Rush our version to market to compete head-on", "Analyze their feature, identify its weaknesses, and build a superior version", "Ignore them and stick to our original product roadmap"] },

    // Section 6: Goals & Aspirations (Essay)
    { id: 'S6Q1', section: 'Goals & Aspirations', question: "Beyond financial success, what is the single most important legacy you want to create with your entrepreneurial journey?", type: 'textarea' },
];

const questionIds = psychometricQuestions.map(q => q.id);

const formSchema = z.object({
    ...psychometricQuestions.reduce((acc, q) => {
        if (q.type === 'radio') {
            acc[q.id] = z.string({ required_error: "Please select an option." });
        } else if (q.type === 'text') {
            acc[q.id] = z.string().min(1, "This field is required.");
        } else {
            acc[q.id] = z.string().min(50, "Please provide a more detailed answer (min. 50 characters).");
        }
        return acc;
    }, {} as Record<string, z.ZodType<any, any>>),
});

type FullForm = z.infer<typeof formSchema>;

const defaultValues = questionIds.reduce((acc, id) => {
    acc[id] = "";
    return acc;
}, {} as any);

const sectionFields = [
    { name: "Background & Experience", fields: psychometricQuestions.filter(q => q.section === 'Background & Experience').map(q => q.id) },
    { name: "Personality & Mindset", fields: psychometricQuestions.filter(q => q.section === 'Personality & Mindset').map(q => q.id) },
    { name: "Motivation & Values", fields: psychometricQuestions.filter(q => q.section === 'Motivation & Values').map(q => q.id) },
    { name: "Abilities & Skills", fields: psychometricQuestions.filter(q => q.section === 'Abilities & Skills').map(q => q.id) },
    { name: "Situational Judgement", fields: psychometricQuestions.filter(q => q.section === 'Situational Judgement').map(q => q.id) },
    { name: "Goals & Aspirations", fields: psychometricQuestions.filter(q => q.section === 'Goals & Aspirations').map(q => q.id) },
];


export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);
    
    const [activeTab, setActiveTab] = React.useState("0");
    const [currentQuestionIndices, setCurrentQuestionIndices] = React.useState(Array(sectionFields.length).fill(0));
    const [highestCompletedTab, setHighestCompletedTab] = React.useState(-1);

    const form = useForm<FullForm>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onChange',
    });

    const totalQuestions = psychometricQuestions.length;
    
    const answeredQuestions = React.useMemo(() => {
        const formData = form.getValues();
        return Object.values(formData).filter(value => value && value !== "").length;
    }, [form.watch()]);
    
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
            MOCK_INNOVATOR_USER.hasPsychometricAnalysis = false; // Reset mock data as well
            setIsCompleted(false);
            form.reset(defaultValues);
            setActiveTab("0");
            setCurrentQuestionIndices(Array(sectionFields.length).fill(0));
            setHighestCompletedTab(-1);
            toast({ title: "Request Approved", description: "1 credit has been used. You can now retake the analysis." });
        } else {
            toast({ variant: "destructive", title: "Insufficient Credits", description: "You do not have enough credits to request a retest." });
        }
    }
    
    const handleNext = async () => {
        const activeTabIndex = parseInt(activeTab);
        const currentSection = sectionFields[activeTabIndex];
        const currentQuestionIndex = currentQuestionIndices[activeTabIndex];
        const fieldName = currentSection.fields[currentQuestionIndex];
        
        const isValid = await form.trigger(fieldName as any);
        if (!isValid) return;

        if (currentQuestionIndex < currentSection.fields.length - 1) {
            setCurrentQuestionIndices(prev => {
                const newIndices = [...prev];
                newIndices[activeTabIndex]++;
                return newIndices;
            });
        } else {
             const allSectionFieldsValid = await form.trigger(currentSection.fields as any);
             if (allSectionFieldsValid) {
                 setHighestCompletedTab(prev => Math.max(prev, activeTabIndex));
                 if (activeTabIndex < sectionFields.length - 1) {
                     setActiveTab(String(activeTabIndex + 1));
                 } else {
                     form.handleSubmit(onSubmit)();
                 }
             }
        }
    }

    const handlePrevious = () => {
        const activeTabIndex = parseInt(activeTab);
        const currentQuestionIndex = currentQuestionIndices[activeTabIndex];
        if (currentQuestionIndex > 0) {
             setCurrentQuestionIndices(prev => {
                const newIndices = [...prev];
                newIndices[activeTabIndex]--;
                return newIndices;
            });
        } else {
            if (activeTabIndex > 0) {
                setActiveTab(String(activeTabIndex - 1));
            }
        }
    }
    
    const renderField = (questionId: string) => {
        const question = psychometricQuestions.find(q => q.id === questionId);
        if (!question) return null;

        const baseField = (
            <FormField
                control={form.control}
                name={question.id as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xl font-semibold text-center text-foreground leading-relaxed block">{question.question}</FormLabel>
                         <FormDescription className="text-center pb-4">{question.section}</FormDescription>
                        <FormControl>
                            {question.type === 'radio' ? (
                                <RadioGroup
                                    className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    {question.options?.map(opt => (
                                        <FormItem key={opt} className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value={opt} /></FormControl>
                                            <FormLabel>{opt}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            ) : question.type === 'textarea' ? (
                                <Textarea rows={6} placeholder="Your detailed response..." {...field} />
                            ) : (
                                <Input placeholder={question.placeholder} {...field} />
                            )}
                        </FormControl>
                        <FormMessage className="text-center pt-2" />
                    </FormItem>
                )}
            />
        );
        return baseField;
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
    
    // This now correctly uses the state `isCompleted` which is mutable, instead of the mock data.
    if (!isCompleted && MOCK_INNOVATOR_USER.credits === undefined) { // A stand-in for a real check
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
                <Button onClick={() => setIsCompleted(true)}>Take Analysis (Free)</Button>
            </CardFooter>
          </Card>
        )
    }

    const activeTabIndex = parseInt(activeTab);
    const isFinalStep = activeTabIndex === sectionFields.length - 1 && currentQuestionIndices[activeTabIndex] === sectionFields[activeTabIndex].fields.length - 1;


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
                             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
                                    {sectionFields.map((tab, index) => (
                                        <TabsTrigger 
                                            key={tab.name} 
                                            value={String(index)} 
                                            disabled={index > highestCompletedTab + 1}
                                            onClick={(e) => {
                                                if (index > highestCompletedTab + 1) e.preventDefault();
                                            }}
                                        >
                                            {tab.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {sectionFields.map((section, index) => {
                                    const currentQuestionIndex = currentQuestionIndices[index];
                                    const fieldName = section.fields[currentQuestionIndex];
                                    return (
                                        <TabsContent key={section.name} value={String(index)}>
                                            <div className="py-6 min-h-[300px] flex flex-col justify-center">
                                                <Card className="bg-transparent border-0 shadow-none">
                                                    <CardContent>
                                                        {renderField(fieldName)}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </CardContent>
                         <CardFooter className="flex justify-between">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handlePrevious}
                                disabled={activeTabIndex === 0 && currentQuestionIndices[0] === 0}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                           
                            <Button type="button" onClick={handleNext}>
                                {isFinalStep ? 'Submit Analysis' : 'Next'} 
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
