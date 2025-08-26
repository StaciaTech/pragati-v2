
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { MOCK_INNOVATOR_USER } from '@/lib/mock-data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

const psychometricQuestions = [
    { category: 'Opportunity Orientation', question: "I regularly talk to potential users/customers before building." },
    { category: 'Opportunity Orientation', question: "I can reframe problems to uncover hidden needs." },
    { category: 'Opportunity Orientation', question: "I validate assumptions with small experiments." },
    { category: 'Opportunity Orientation', question: "I track competitors and analog markets for ideas." },

    { category: 'Execution Discipline', question: "I break goals into weekly, measurable tasks." },
    { category: 'Execution Discipline', question: "My teammates would call me reliable." },
    { category: 'Execution Discipline', question: "I hit deadlines even under pressure." },
    { category: 'Execution Discipline', question: "I maintain operating cadences (standups, reviews)." },

    { category: 'Resilience', question: "Setbacks energize me to try again." },
    { category: 'Resilience', question: "I persist when results are slow." },
    { category: 'Resilience', question: "I can work through prolonged uncertainty." },
    { category: 'Resilience', question: "I recover quickly from tough feedback." },

    { category: 'Learning Agility', question: "I seek feedback even when uncomfortable." },
    { category: 'Learning Agility', question: "I can learn a new skill within weeks when needed." },
    { category: 'Learning Agility', question: "I run frequent postmortems on my work." },
    { category: 'Learning Agility', question: "I adjust direction quickly based on new data." },

    { category: 'Ambiguity Tolerance', question: "I’m comfortable deciding with incomplete information." },
    { category: 'Ambiguity Tolerance', question: "I can hold multiple hypotheses at once." },
    { category: 'Ambiguity Tolerance', question: "I treat ambiguity as a creative space." },
    { category: 'Ambiguity Tolerance', question: "I avoid over-analysis before taking first steps." },
    
    { category: 'Risk Calibration', question: "I take calculated risks with clear downside plans." },
    { category: 'Risk Calibration', question: "I cap exposure via budget/time limits." },
    { category: 'Risk Calibration', question: "I run pre-mortems to anticipate failure modes." },
    { category: 'Risk Calibration', question: "I diversify bets instead of all-in." },
];

export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [answers, setAnswers] = React.useState<Record<number, string>>({});

    const handleAnswerChange = (value: string) => {
        setAnswers(prev => ({...prev, [currentQuestionIndex]: value}));
    };

    const handleNext = () => {
        if (currentQuestionIndex < psychometricQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        if (Object.keys(answers).length !== psychometricQuestions.length) {
            toast({
                variant: 'destructive',
                title: "Incomplete",
                description: "Please answer all questions before submitting."
            });
            return;
        }

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
            setCurrentQuestionIndex(0);
            setAnswers({});
            toast({ title: "Request Approved", description: "1 credit has been used. You can now retake the analysis." });
        } else {
            toast({ variant: "destructive", title: "Insufficient Credits", description: "You do not have enough credits to request a retest." });
        }
    }
    
    if (isCompleted) {
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

    const currentQuestion = psychometricQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / psychometricQuestions.length) * 100;

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Founder Psychometric Analysis</CardTitle>
                    <CardDescription>Answer the following questions to help us understand your strengths. The first attempt is free.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 min-h-[300px]">
                    <Progress value={progress} className="w-full" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{currentQuestion.category}</p>
                        <Label className="text-lg mt-2 block">{currentQuestionIndex + 1}. {currentQuestion.question}</Label>
                        <RadioGroup 
                            required 
                            className="flex flex-col sm:flex-row gap-4 mt-4"
                            value={answers[currentQuestionIndex]}
                            onValueChange={handleAnswerChange}
                        >
                            <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="q-1" /><Label htmlFor="q-1">Strongly Disagree</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="q-2" /><Label htmlFor="q-2">Disagree</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="q-3" /><Label htmlFor="q-3">Neutral</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="4" id="q-4" /><Label htmlFor="q-4">Agree</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="5" id="q-5" /><Label htmlFor="q-5">Strongly Agree</Label></div>
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                       <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    {currentQuestionIndex < psychometricQuestions.length - 1 ? (
                        <Button type="button" onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                         <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Analysis
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}
