
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
import { MOCK_QUESTION_BANK } from '@/lib/psychometric-questions';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const { questions } = MOCK_QUESTION_BANK;

// Helper function to prevent gibberish input
const isNotGibberish = (value: string) => {
    if (value.length < 10) return true; // Don't apply to very short strings
    // Check for repetitive characters (e.g., "aaaaaa" or "ababab")
    const repetitiveCharsRegex = /(.+?)\1{4,}/;
    if (repetitiveCharsRegex.test(value)) return false;
    // Check for lack of spaces in long strings
    if (value.length > 50 && !/\s/.test(value)) return false;
    return true;
};

// Dynamically generate Zod schema from question bank
const generateFormSchema = () => {
    const schemaShape: Record<string, z.ZodType<any, any>> = {};
    questions.forEach(q => {
        switch (q.type) {
            case 'likert':
                schemaShape[q.id] = z.string({ required_error: "Please select a rating." });
                break;
            case 'categorical':
                 schemaShape[q.id] = z.string({ required_error: "Please select an option." });
                break;
            case 'numeric':
                schemaShape[q.id] = z.coerce.number().min(0, "Please enter a valid number.");
                break;
            case 'free_text':
                 schemaShape[q.id] = z.string()
                    .min(10, "Please provide a more detailed answer (at least 10 characters).")
                    .refine(isNotGibberish, { message: "Please provide a more meaningful answer." });
                 break;
            default:
                schemaShape[q.id] = z.string().min(1, "This field is required.");
        }
    });
    
    return z.object(schemaShape);
};

const formSchema = generateFormSchema();
type FullForm = z.infer<typeof formSchema>;

const defaultValues = questions.reduce((acc, q) => {
    acc[q.id] = '';
    return acc;
}, {} as any);

const personalInfoQuestions = questions.filter(q => q.construct === 'CTX_EDU' || q.construct === 'CTX_SOCIO');
const coreQuestions = questions.filter(q => !personalInfoQuestions.map(pi => pi.id).includes(q.id));

const sectionFields = [
    { name: "Personal Information", fields: personalInfoQuestions.map(q => q.id) },
    { name: "Background & Experience", fields: coreQuestions.filter(q => ['FMF', 'LEAD', 'NETWORK'].includes(q.construct!)).map(q => q.id) },
    { name: "Personality & Mindset", fields: coreQuestions.filter(q => ['RES', 'RISK', 'AMBIG', 'FOCUS'].includes(q.construct!)).map(q => q.id) },
    { name: "Motivation & Values", fields: coreQuestions.filter(q => ['MOTIVATION', 'ETHICS'].includes(q.construct!)).map(q => q.id) },
    { name: "Abilities & Skills", fields: coreQuestions.filter(q => ['OPP', 'EXEC', 'LEARN', 'COGNITIVE', 'EQ', 'FINANCE'].includes(q.construct!)).map(q => q.id) },
    { name: "Goals & Aspirations", fields: ["Q068", "Q069"] },
];


export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);
    
    const [activeTab, setActiveTab] = React.useState("0");
    const [currentQuestionIndices, setCurrentQuestionIndices] = React.useState(Array(sectionFields.length).fill(0));
    const [highestCompletedTab, setHighestCompletedTab] = React.useState(-1);
    const [questionQueue, setQuestionQueue] = React.useState<string[]>(sectionFields.flatMap(s => s.fields));


    React.useEffect(() => {
        setIsCompleted(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);
    }, []);

    const form = useForm<FullForm>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onChange',
    });
    
    const totalQuestionsInQueue = questionQueue.length;
    const watchedValues = form.watch();
    const answeredQuestions = React.useMemo(() => {
        return Object.values(watchedValues).filter(value => {
            if (typeof value === 'number') return true;
            return !!value;
        }).length;
    }, [watchedValues]);
    
    const overallProgress = (answeredQuestions / totalQuestionsInQueue) * 100;
    
    const onSubmit = (data: FullForm) => {
        setIsLoading(true);
        toast({ title: "Submitting Analysis...", description: "Please wait while we process your results." });

        setTimeout(() => {
            const finalScore = Math.floor(Math.random() * (95 - 65 + 1)) + 65; 
            
            MOCK_INNOVATOR_USER.hasPsychometricAnalysis = true; 
            setIsLoading(false);
            toast({ title: "Analysis Complete!", description: `Your readiness score is ${finalScore}.` });
            
             const reportData = { score: finalScore, level: finalScore >= 85 ? 'Founder-ready' : 'Promising' };
             const params = new URLSearchParams({ role: 'Innovator', results: JSON.stringify(reportData) });
             router.push(`/dashboard/psychometric-analysis/report?${params.toString()}`);

        }, 2000);
    };

    const handleRetest = () => {
        if (MOCK_INNOVATOR_USER.credits > 0) {
            MOCK_INNOVATOR_USER.credits -= 1;
            form.reset(defaultValues);
            setActiveTab("0");
            setCurrentQuestionIndices(Array(sectionFields.length).fill(0));
            setHighestCompletedTab(-1);
            setQuestionQueue(sectionFields.flatMap(s => s.fields));
            setIsCompleted(false);
            toast({ title: "Request Approved", description: "1 credit has been used. You can now retake the analysis." });
        } else {
            toast({ variant: "destructive", title: "Insufficient Credits", description: "You do not have enough credits to request a retest." });
        }
    }

    const checkBranching = (questionId: string, value: any) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.branch_on) return;

        const { condition, value: targetValue, enqueue } = question.branch_on;
        let shouldBranch = false;
        
        switch (condition) {
            case '<': shouldBranch = Number(value) < Number(targetValue); break;
            case '==': shouldBranch = value === targetValue; break;
            // Add other conditions as needed
        }

        if (shouldBranch) {
            setQuestionQueue(prevQueue => {
                const currentQuestionIndex = prevQueue.indexOf(questionId);
                const newQueue = [...prevQueue];
                // Insert new questions right after the current one
                newQueue.splice(currentQuestionIndex + 1, 0, ...enqueue);
                return newQueue;
            });
        }
    }
    
    const handleNext = async () => {
        const activeTabIndex = parseInt(activeTab);
        const currentSection = sectionFields[activeTabIndex];
        const currentQuestionId = currentSection.fields[currentQuestionIndices[activeTabIndex]];
        
        if (!currentQuestionId) return;
        
        const isValid = await form.trigger(currentQuestionId as any);
        if (!isValid) return;

        const currentValue = form.getValues(currentQuestionId as any);
        checkBranching(currentQuestionId, currentValue);

        // Reset radio group value to avoid flicker on next question
        const currentQuestion = questions.find(q => q.id === currentQuestionId);
        if (currentQuestion?.type === 'likert') {
            form.resetField(currentQuestionId as any, { defaultValue: '' });
        }

        if (currentQuestionIndices[activeTabIndex] < currentSection.fields.length - 1) {
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
        const question = questions.find(q => q.id === questionId);
        if (!question) return null;

        const baseField = (
            <FormField
                control={form.control}
                name={question.id as any}
                render={({ field }) => (
                    <FormItem>
                         <FormLabel className="text-2xl font-semibold text-center text-foreground leading-relaxed block">{question.text}</FormLabel>
                         <FormDescription className="text-center pb-4">
                            {sectionFields.find(s => s.fields.includes(questionId))?.name}
                         </FormDescription>
                        <FormControl>
                            <div className="pt-8">
                            {question.type === 'likert' ? (
                                <RadioGroup
                                    className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center pt-4"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    {Array.isArray(question.scale) && [...Array(question.scale[1])].map((_, i) => (
                                        <FormItem key={i} className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value={String(i + 1)} id={`${question.id}-${i}`} /></FormControl>
                                            <FormLabel htmlFor={`${question.id}-${i}`}>{i + 1}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            ) : question.type === 'categorical' ? (
                                <div className="max-w-md mx-auto">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Array.isArray(question.scale) && question.scale?.map(opt => <SelectItem key={opt as string} value={opt as string}>{opt as string}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : question.type === 'numeric' ? (
                                 <Input className="max-w-md mx-auto" type="number" {...field} />
                            ) : question.type === 'free_text' ? (
                                <Textarea className="max-w-lg mx-auto" rows={6} placeholder="Your detailed response..." {...field} />
                            ) : null}
                            </div>
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
    
    const activeTabIndex = parseInt(activeTab);
    const activeSection = sectionFields[activeTabIndex];
    const currentQuestionId = activeSection ? activeSection.fields[currentQuestionIndices[activeTabIndex]] : null;
    const currentValue = currentQuestionId ? form.watch(currentQuestionId as any) : null;
    const isNextDisabled = !currentValue && typeof currentValue !== 'number';

    const isFinalStep = activeTabIndex === sectionFields.length - 1 && currentQuestionIndices[activeTabIndex] === activeSection?.fields.length - 1;


    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 animate-background-pan -z-10" />

            <Card className="w-full max-w-4xl bg-background/80 backdrop-blur-lg border-white/20 shadow-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle className="text-center">Founder Psychometric Analysis</CardTitle>
                            <CardDescription className="text-center">This comprehensive analysis helps us understand your unique strengths. The first attempt is free.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="flex flex-wrap h-auto bg-transparent p-0 justify-center">
                                    {sectionFields.map((tab, index) => (
                                        <TabsTrigger 
                                            key={tab.name} 
                                            value={String(index)} 
                                            disabled={index > highestCompletedTab + 1}
                                            onClick={(e) => {
                                                if (index > highestCompletedTab + 1) e.preventDefault();
                                            }}
                                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-none rounded-sm"
                                        >
                                            {tab.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                 <div className="py-12 min-h-[300px] flex flex-col justify-center text-center">
                                    {currentQuestionId ? renderField(currentQuestionId) : (
                                        <p>Loading question...</p>
                                    )}
                                </div>
                            </Tabs>
                        </CardContent>
                         <CardFooter className="flex justify-between items-center">
                           <div>
                              <Progress value={overallProgress} className="w-48"/>
                              <p className="text-xs text-muted-foreground mt-1">{Math.round(overallProgress)}% Complete</p>
                           </div>
                           <div className="flex gap-2">
                              <Button 
                                  type="button" 
                                  variant="secondary" 
                                  onClick={handlePrevious}
                                  disabled={activeTabIndex === 0 && currentQuestionIndices[0] === 0}
                              >
                                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                              </Button>
                           
                              <Button type="button" onClick={handleNext} disabled={isNextDisabled}>
                                  {isFinalStep ? 'Submit Analysis' : 'Next'} 
                                  <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                           </div>
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
