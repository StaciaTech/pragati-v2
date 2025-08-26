
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from 'lucide-react';
import { MOCK_INNOVATOR_USER } from '@/lib/mock-data';
import Link from 'next/link';

const psychometricQuestions = {
    OPP: { label: "Opportunity Orientation", questions: ["I regularly talk to potential users/customers before building.", "I can reframe problems to uncover hidden needs.", "I validate assumptions with small experiments.", "I track competitors and analog markets for ideas."] },
    EXEC: { label: "Execution Discipline", questions: ["I break goals into weekly, measurable tasks.", "My teammates would call me reliable.", "I hit deadlines even under pressure.", "I maintain operating cadences (standups, reviews)."] },
    RES: { label: "Resilience", questions: ["Setbacks energize me to try again.", "I persist when results are slow.", "I can work through prolonged uncertainty.", "I recover quickly from tough feedback."] },
};

export default function PsychometricAnalysisPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(MOCK_INNOVATOR_USER.hasPsychometricAnalysis);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        toast({ title: "Submitting Analysis...", description: "Please wait while we process your results." });

        setTimeout(() => {
            // In a real app, you'd save this to the backend.
            MOCK_INNOVATOR_USER.hasPsychometricAnalysis = true; 
            setIsLoading(false);
            setIsCompleted(true);
            toast({ title: "Analysis Complete!", description: "Your psychometric profile has been generated." });
        }, 2000);
    };
    
    if (isCompleted) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Analysis Complete</CardTitle>
                    <CardDescription>Your psychometric profile has been generated. You can now proceed to submit an idea.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-8">
                     <Check className="w-16 h-16 text-green-500 mb-4" />
                     <p className="text-muted-foreground">You can view your detailed profile and upskilling plan on your profile page.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Button variant="outline">Request Retest (1 Credit)</Button>
                     <Button asChild><Link href="/dashboard/submit?role=Innovator">Submit an Idea</Link></Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Founder Psychometric Analysis</CardTitle>
                    <CardDescription>Answer the following questions to help us understand your strengths. (1 Credit)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {Object.entries(psychometricQuestions).map(([key, value]) => (
                        <div key={key}>
                            <h3 className="font-semibold mb-4">{value.label}</h3>
                            <div className="space-y-4">
                            {value.questions.map((q, i) => (
                                <div key={i} className="space-y-2">
                                    <Label>{q}</Label>
                                    <RadioGroup required className="flex gap-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`${key}-${i}-1`} /><Label htmlFor={`${key}-${i}-1`}>Strongly Disagree</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`${key}-${i}-2`} /><Label htmlFor={`${key}-${i}-2`}>Disagree</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="3" id={`${key}-${i}-3`} /><Label htmlFor={`${key}-${i}-3`}>Neutral</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="4" id={`${key}-${i}-4`} /><Label htmlFor={`${key}-${i}-4`}>Agree</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="5" id={`${key}-${i}-5`} /><Label htmlFor={`${key}-${i}-5`}>Strongly Agree</Label></div>
                                    </RadioGroup>
                                </div>
                            ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Analysis
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
