
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
import { NEW_QUESTION_BANK } from '@/lib/psychometric-questions';
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

const { domains } = NEW_QUESTION_BANK;

// Helper function to prevent gibberish input
const isNotGibberish = (value: string) => {
    if (value.length < 10) return true; 
    const repetitiveCharsRegex = /(.+?)\1{4,}/;
    if (repetitiveCharsRegex.test(value)) return false;
    if (value.length > 50 && !/\s/.test(value)) return false;
    return true;
};

// Dynamically generate Zod schema from the new question bank structure
const generateFormSchema = () => {
    const schemaShape: Record<string, z.ZodType<any, any>> = {};
    domains.forEach(domain => {
      domain.questions.forEach(q => {
          switch (q.type) {
              case 'multiple_choice':
                  schemaShape[q.id] = z.string({ required_error: "Please select an option." });
                  break;
              case 'scale':
                  schemaShape[q.id] = z.string({ required_error: "Please select a rating." });
                  break;
              case 'open_text':
                   schemaShape[q.id] = z.string()
                      .min(10, "Please provide a more detailed answer (at least 10 characters).")
                      .refine(isNotGibberish, { message: "Please provide a more meaningful answer." });
                   break;
          }
      });
    });
    
    return z.object(schemaShape);
};

const formSchema = generateFormSchema();
type FullForm = z.infer<typeof formSchema>;

const allQuestions = domains.flatMap(d => d.questions);

const defaultValues = allQuestions.reduce((acc, q) => {
    acc[q.id] = '';
    return acc;
}, {} as any);


export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    
    const form = useForm<FullForm>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onChange',
    });
    
    const overallProgress = (currentQuestionIndex / allQuestions.length) * 100;
    
    const onSubmit = (data: FullForm) => {
        setIsLoading(true);
        toast({ title: "Submitting Analysis...", description: "Please wait while we process your results." });

        setTimeout(() => {
            MOCK_INNOVATOR_USER.hasPsychometricAnalysis = true; 
            setIsLoading(false);
            
            // Simplified Scoring Simulation
            const scores: Record<string, number> = {};
            domains.forEach(domain => {
                let domainScore = 0;
                let maxScore = 0;
                domain.questions.forEach(q => {
                    const response = data[q.id as keyof FullForm];
                    let questionScore = 0;
                    if(q.type === 'multiple_choice') {
                        questionScore = q.options.find(opt => opt.label === response)?.score || 0;
                    } else if (q.type === 'scale') {
                        let scaleValue = parseInt(response, 10);
                        if (q.reverse_scoring) {
                            scaleValue = (q.scale_max + q.scale_min) - scaleValue;
                        }
                        questionScore = scaleValue;
                    } else {
                        questionScore = 3; // Mock score for open text
                    }
                    domainScore += questionScore * q.weight;
                    maxScore += (q.type === 'open_text' ? 5 : q.scale_max || 5) * q.weight;
                });
                scores[domain.id] = (domainScore / maxScore) * 100;
            });
            
            const finalScore = (scores['entrepreneurial_potential'] * 0.6) + (scores['psychological_resilience'] * 0.4);

            toast({ title: "Analysis Complete!", description: `Your readiness score is ${finalScore.toFixed(0)}.` });
            
             const reportData = { 
                score: finalScore, 
                level: finalScore >= 65 ? (finalScore >= 85 ? 'High Potential' : 'Promising') : 'Needs Development',
                domainScores: scores 
            };
             const params = new URLSearchParams({ role: 'Innovator', results: JSON.stringify(reportData) });
             router.push(`/dashboard/psychometric-analysis/report?${params.toString()}`);

        }, 2000);
    };

    const handleRetest = () => {
        if (MOCK_INNOVATOR_USER.credits > 0) {
            MOCK_INNOVATOR_USER.credits -= 1;
            form.reset(defaultValues);
            setCurrentQuestionIndex(0);
            setIsCompleted(false);
            toast({ title: "Request Approved", description: "1 credit has been used. You can now retake the analysis." });
        } else {
            toast({ variant: "destructive", title: "Insufficient Credits", description: "You do not have enough credits to request a retest." });
        }
    }

    const handleNext = async () => {
        const currentQuestion = allQuestions[currentQuestionIndex];
        if (!currentQuestion) return;

        const isValid = await form.trigger(currentQuestion.id as any);
        if (!isValid) return;

        // Reset radio group value to avoid flicker on next question
        if (currentQuestion.type === 'scale') {
          form.resetField(currentQuestion.id as any, { defaultValue: '' });
        }
        
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            form.handleSubmit(onSubmit)();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    }
    
    const renderField = (question: any) => {
        if (!question) return null;
        
        const currentDomain = domains.find(d => d.questions.some(q => q.id === question.id));

        return (
            <FormField
                control={form.control}
                name={question.id as any}
                render={({ field }) => (
                    <FormItem>
                         <FormLabel className="text-2xl font-semibold text-center text-foreground leading-relaxed block">{question.text}</FormLabel>
                         <FormDescription className="text-center pb-4">
                            {currentDomain?.name}
                         </FormDescription>
                        <FormControl>
                            <div className="pt-8">
                            {question.type === 'scale' ? (
                                <RadioGroup
                                    className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center pt-4"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    {[...Array(question.scale_max)].map((_, i) => (
                                        <FormItem key={i} className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value={String(i + 1)} id={`${question.id}-${i}`} /></FormControl>
                                            <FormLabel htmlFor={`${question.id}-${i}`}>{i + 1}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            ) : question.type === 'multiple_choice' ? (
                                <div className="max-w-md mx-auto">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {question.options?.map((opt: any) => <SelectItem key={opt.label} value={opt.label}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : question.type === 'open_text' ? (
                                <Textarea className="max-w-lg mx-auto" rows={6} placeholder="Your detailed response..." {...field} />
                            ) : null}
                            </div>
                        </FormControl>
                        <FormMessage className="text-center pt-2" />
                    </FormItem>
                )}
            />
        );
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
    
    const currentQuestion = allQuestions[currentQuestionIndex];
    const currentValue = currentQuestion ? form.watch(currentQuestion.id as any) : null;
    const isNextDisabled = !currentValue && typeof currentValue !== 'number';

    const isFinalStep = currentQuestionIndex === allQuestions.length - 1;


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
                            <div className="py-12 min-h-[300px] flex flex-col justify-center text-center">
                                {currentQuestion ? renderField(currentQuestion) : <p>Loading question...</p>}
                            </div>
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
                                  disabled={currentQuestionIndex === 0}
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
