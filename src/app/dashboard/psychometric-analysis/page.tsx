
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
                 schemaShape[q.id] = z.string().min(1, "This field is required.");
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

const sectionFields = [
    { name: "Core Profile", fields: questions.filter(q => q.construct === 'CTX_EDU' || q.construct === 'CTX_SOCIO').map(q => q.id) },
    { name: "Personality", fields: questions.filter(q => q.construct === 'OPP' || q.construct === 'EXEC' || q.construct === 'RES' || q.construct === 'LEARN' || q.construct === 'AMBIG' || q.construct === 'RISK' || q.construct === 'FOCUS').map(q => q.id) },
    { name: "Motivation & Abilities", fields: questions.filter(q => q.construct === 'MOTIVATION' || q.construct === 'COGNITIVE' || q.construct === 'LEAD').map(q => q.id) },
    { name: "Founder Fit", fields: questions.filter(q => q.construct === 'FMF').map(q => q.id) },
    { name: "Ethics & EQ", fields: questions.filter(q => q.construct === 'ETHICS' || q.construct === 'EQ').map(q => q.id) },
];


export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);
    
    const [activeTab, setActiveTab] = React.useState("0");
    const [currentQuestionIndices, setCurrentQuestionIndices] = React.useState(Array(sectionFields.length).fill(0));
    const [highestCompletedTab, setHighestCompletedTab] = React.useState(-1);

    React.useEffect(() => {
        setIsCompleted(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);
    }, []);

    const form = useForm<FullForm>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onChange',
    });

    const totalQuestions = questions.length;
    
    const watchedValues = form.watch();
    const answeredQuestions = React.useMemo(() => {
        return Object.values(watchedValues).filter(value => {
            if (typeof value === 'number') return true; // 0 is a valid answer
            return !!value;
        }).length;
    }, [watchedValues]);
    
    const overallProgress = (answeredQuestions / totalQuestions) * 100;
    
    const onSubmit = (data: FullForm) => {
        setIsLoading(true);
        toast({ title: "Submitting Analysis...", description: "Please wait while we process your results." });

        setTimeout(() => {
            // Here you would implement the detailed scoring logic from the prompt
            // For now, we'll simulate a score and completion
            const finalScore = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // Random score between 65-95
            
            MOCK_INNOVATOR_USER.hasPsychometricAnalysis = true; 
            setIsLoading(false);
            setIsCompleted(true);
            toast({ title: "Analysis Complete!", description: `Your readiness score is ${finalScore}.` });
            
            // Navigate to report page with results
             const reportData = { score: finalScore, level: finalScore >= 85 ? 'Founder-ready' : 'Promising' };
             const params = new URLSearchParams({ role: 'Innovator', results: JSON.stringify(reportData) });
             router.push(`/dashboard/psychometric-analysis/report?${params.toString()}`);

        }, 2000);
    };

    const handleRetest = () => {
        if (MOCK_INNOVATOR_USER.credits > 0) {
            MOCK_INNOVATOR_USER.credits -= 1; // This should be a state update in a real app
            form.reset(defaultValues);
            setActiveTab("0");
            setCurrentQuestionIndices(Array(sectionFields.length).fill(0));
            setHighestCompletedTab(-1);
            setIsCompleted(false);
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
        
        if (!fieldName) return;
        
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
        const question = questions.find(q => q.id === questionId);
        if (!question) return null;

        const baseField = (
            <FormField
                control={form.control}
                name={question.id as any}
                render={({ field }) => (
                    <FormItem>
                         <FormDescription className="text-center pb-4">{question.construct}</FormDescription>
                        <FormLabel className="text-2xl font-semibold text-center text-foreground leading-relaxed block">{question.text}</FormLabel>
                        <FormControl>
                            <div className="pt-8">
                            {question.type === 'likert' ? (
                                <RadioGroup
                                    className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center pt-4"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    {[...Array(question.scale![1])].map((_, i) => (
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
                                            {question.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
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
                <Button onClick={() => {
                     setIsCompleted(false);
                }}>Take Analysis (Free)</Button>
            </CardFooter>
          </Card>
        )
    }

    const activeTabIndex = parseInt(activeTab);
    const activeSection = sectionFields[activeTabIndex];
    const isFinalStep = activeTabIndex === sectionFields.length - 1 && currentQuestionIndices[activeTabIndex] === activeSection.fields.length - 1;


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
                             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="flex flex-wrap h-auto bg-transparent p-0">
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
                                    {sectionFields.map((section, index) => {
                                        if (index.toString() !== activeTab) return null;
                                        const currentQuestionIndex = currentQuestionIndices[index];
                                        const fieldName = section.fields[currentQuestionIndex];
                                        return renderField(fieldName);
                                    })}
                                </div>
                            </Tabs>
                        </CardContent>
                         <CardFooter className="flex justify-between">
                           <div>
                              <Progress value={overallProgress} className="w-48"/>
                              <p className="text-xs text-muted-foreground mt-1">{Math.round(overallProgress)}% Complete</p>
                           </div>
                           <div className="flex gap-2">
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

    