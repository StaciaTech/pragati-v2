
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const psychometricQuestions = [
    // Section: Personal Information (D, E, F)
    { id: 'S0Q1', section: 'Personal Information', question: "What is your highest educational qualification?", type: 'select', options: ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "Other"] },
    { id: 'S0Q2', section: 'Personal Information', question: "Did your school curriculum primarily encourage creative projects, competitive exams, or rote learning?", type: 'radio', options: ["Creative Projects", "Competitive Exams", "Rote Learning", "A mix of all"] },
    { id: 'S0Q3', section: 'Personal Information', question: "Which statement best describes your family's professional background?", type: 'radio', options: ["Primarily business/entrepreneurial", "Primarily salaried professionals", "Primarily government service", "Primarily agriculture/skilled trades", "Mixed or other"] },
    { id: 'S0Q4', section: 'Personal Information', question: "How would you describe your family's attitude towards taking career or financial risks?", type: 'radio', options: ["Highly encouraged", "Tolerated but not encouraged", "Discouraged in favor of stability", "Not discussed"] },
    { id: 'S0Q5', section: 'Personal Information', question: "What part of the country did you grow up in?", type: 'select', options: ["Metropolitan City (Tier 1)", "Small City (Tier 2)", "Town or Rural Area (Tier 3+)"] },
    { id: 'S0Q6', section: 'Personal Information', question: "Was entrepreneurship or innovation a common topic of celebration or discussion in your local community growing up?", type: 'radio', options: ["Yes, very common", "Sometimes", "Rarely", "Never"] },

    // Section: Personality & Mindset (B, C, G)
    { id: 'S1Q1', section: 'Personality & Mindset', question: "Your last three strategic decisions for a project have failed. What is your most likely next step?", type: 'radio', options: ["Analyze the failures for patterns and pivot", "Continue with the same strategy, believing in persistence", "Seek external advice before making another move", "Scrap the project and start something new"] },
    { id: 'S1Q2', section: 'Personality & Mindset', question: "You're presented with a high-stakes opportunity that has a 30% chance of great success and a 70% chance of total failure. What do you do?", type: 'radio', options: ["Take the risk, the potential reward is worth it", "Try to find a way to reduce the risk before deciding", "Look for a safer opportunity with a higher chance of moderate success", "Avoid it, the odds are too poor"] },
    { id: 'S1Q3', section: 'Personality & Mindset', question: "When multiple project deadlines are approaching, how do you typically manage the pressure?", type: 'radio', options: ["Prioritize ruthlessly and focus on one task at a time", "Work longer hours to try and get everything done", "Delegate some tasks to others if possible", "Feel overwhelmed and struggle to start"] },
    { id: 'S1Q4', section: 'Personality & Mindset', question: "Which work style do you naturally prefer?", type: 'radio', options: ["Working independently on a task from start to finish", "Collaborating closely with a team throughout a project", "Leading a team and delegating tasks", "A mix of independent and collaborative work"] },
    { id: 'S1Q5', section: 'Personality & Mindset', question: "Have you ever turned a hobby or side-project into a source of income, even a small one?", type: 'radio', options: ["Yes, successfully", "Yes, but it wasn't successful", "I've thought about it but never tried", "No, my hobbies are just for relaxation"] },

    // Section: Abilities & Vision (A, I)
    { id: 'S2Q1', section: 'Abilities & Vision', question: "When you encounter a completely new technology, what is your first instinct?", type: 'radio', options: ["Start experimenting with it hands-on", "Read articles and documentation to understand it conceptually", "Talk to experts who are already using it", "Wait and see how it develops before investing time"] },
    { id: 'S2Q2', section: 'Abilities & Vision', question: "Describe a time you solved a complex problem with very limited resources. What was your approach?", type: 'textarea' },
    { id: 'S2Q3', section: 'Abilities & Vision', question: "Which of these is the most compelling reason for you to dedicate the next 10 years to an idea?", type: 'radio', options: ["Solving a problem that personally affects you or your loved ones", "The potential for significant financial return and wealth creation", "The opportunity to build a famous brand and legacy", "The intellectual challenge of solving a very difficult problem"] },
    { id: 'S2Q4', section: 'Abilities & Vision', question: "If a major competitor copied your core product, what would be your most likely reaction?", type: 'radio', options: ["Out-innovate them by releasing better features faster", "Focus on building a stronger brand and community", "Try to compete on price", "Consider pivoting to a different market"] },
];


const questionIds = psychometricQuestions.map(q => q.id);

const formSchema = z.object({
    ...psychometricQuestions.reduce((acc, q) => {
        if (q.type === 'radio' || q.type === 'select') {
            acc[q.id] = z.string({ required_error: "Please select an option." });
        } else if (q.type === 'text') {
            acc[q.id] = z.string().min(1, "This field is required.");
        } else if (q.type === 'number') {
            acc[q.id] = z.coerce.number().min(0, "Please enter a valid number.");
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
    { name: "Personal Information", fields: psychometricQuestions.filter(q => q.section === 'Personal Information').map(q => q.id) },
    { name: "Personality & Mindset", fields: psychometricQuestions.filter(q => q.section === 'Personality & Mindset').map(q => q.id) },
    { name: "Abilities & Vision", fields: psychometricQuestions.filter(q => q.section === 'Abilities & Vision').map(q => q.id) },
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

    const totalQuestions = psychometricQuestions.length;
    
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
            form.reset(defaultValues);
            setActiveTab("0");
            setCurrentQuestionIndices(Array(sectionFields.length).fill(0));
            setHighestCompletedTab(-1);
            setIsCompleted(false); // This is key
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
                         <FormDescription className="text-center pb-4">{question.section}</FormDescription>
                        <FormLabel className="text-2xl font-semibold text-center text-foreground leading-relaxed block">{question.question}</FormLabel>
                        <FormControl>
                            <div className="pt-8">
                            {question.type === 'radio' ? (
                                <RadioGroup
                                    className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center pt-4"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    {question.options?.map(opt => (
                                        <FormItem key={opt} className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value={opt} id={`${question.id}-${opt}`} /></FormControl>
                                            <FormLabel htmlFor={`${question.id}-${opt}`}>{opt}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            ) : question.type === 'select' ? (
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
                            ) : question.type === 'textarea' ? (
                                <Textarea className="max-w-lg mx-auto" rows={6} placeholder="Your detailed response..." {...field} />
                            ) : (
                                <Input className="max-w-md mx-auto" type={question.type} placeholder={question.placeholder} {...field} />
                            )}
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
                                {sectionFields.map((section, index) => {
                                    const currentQuestionIndex = currentQuestionIndices[index];
                                    const fieldName = section.fields[currentQuestionIndex];
                                    return (
                                        <TabsContent key={section.name} value={String(index)}>
                                            <div className="py-12 min-h-[300px] flex flex-col justify-center text-center">
                                                {renderField(fieldName)}
                                            </div>
                                        </TabsContent>
                                    );
                                })}
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

    