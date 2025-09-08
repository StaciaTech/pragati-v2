
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_QUESTION_BANK } from '@/lib/data/psychometric';
import { MOCK_INNOVATOR_USER, MOCK_MENTORS } from '@/lib/data/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { ROLES } from '@/lib/constants';

const allQuestions = MOCK_QUESTION_BANK.domains.flatMap(domain => domain.questions);

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const { toast } = useToast();
  const [currentQuestionId, setCurrentQuestionId] = React.useState('ep_start');
  const [answers, setAnswers] = React.useState<Record<string, any>>({});
  const [history, setHistory] = React.useState<string[]>([]);
  
  const totalQuestions = allQuestions.length;
  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  const currentQuestion = allQuestions.find(q => q.id === currentQuestionId);

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestionId]: value }));
  };

  const findNextQuestionId = (currentAnswer: any) => {
    if (!currentQuestion) return 'end_of_assessment';

    if (currentQuestion.next_question_id) {
      return currentQuestion.next_question_id;
    }

    if (currentQuestion.next_question_logic) {
      const score = typeof currentAnswer === 'object' ? currentAnswer.score : parseInt(currentAnswer);
      for (const logic of currentQuestion.next_question_logic) {
        // Super simplified logic for demo, doesn't handle complex expressions
        if (logic.condition.includes('>=')) {
          if (score >= parseInt(logic.condition.split('>=')[1].trim())) {
            return logic.next_question_id;
          }
        } else if (logic.condition.includes('<')) {
          if (score < parseInt(logic.condition.split('<')[1].trim())) {
            return logic.next_question_id;
          }
        }
      }
    }

    if (currentQuestion.type === 'multiple_choice' && typeof currentAnswer === 'object') {
      return currentAnswer.next_question;
    }

    return 'end_of_assessment';
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestionId];
    if (currentAnswer === undefined || currentAnswer === null || currentAnswer === '') {
        toast({
            variant: 'destructive',
            title: 'Please select an answer',
            description: 'You must provide an answer to continue.',
        });
        return;
    }
    
    setHistory(prev => [...prev, currentQuestionId]);
    const nextId = findNextQuestionId(currentAnswer);
    
    if (nextId === 'end_of_assessment' || !allQuestions.find(q => q.id === nextId)) {
        toast({
            title: 'Assessment Complete!',
            description: 'Thank you for completing the assessment. Your profile is being generated.',
        });
        // Simulate completion based on role
        if (role === ROLES.MENTOR) {
          const mentor = MOCK_MENTORS.find(m => m.id === 'MENTOR_001'); // Assuming a logged-in mentor
          if(mentor) mentor.hasPsychometricAnalysis = true;
        } else {
          MOCK_INNOVATOR_USER.hasPsychometricAnalysis = true;
        }
        router.push(`/dashboard/psychometric-analysis?role=${role}`);
    } else {
        setCurrentQuestionId(nextId);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const lastQuestionId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentQuestionId(lastQuestionId);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return <p>Loading question...</p>;

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            {currentQuestion.options.map(option => (
              <Button
                key={option.label}
                variant={answers[currentQuestionId]?.label === option.label ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleAnswer(option)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        );
      case 'scale':
        return (
          <RadioGroup
            value={answers[currentQuestionId]}
            onValueChange={(val) => handleAnswer(val)}
            className="flex items-center justify-center gap-4 py-4"
          >
            {[...Array(currentQuestion.scale_max)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <RadioGroupItem value={`${i + 1}`} id={`r${i + 1}`} />
                <Label htmlFor={`r${i + 1}`}>{i + 1}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'open_text':
        return (
          <Textarea
            value={answers[currentQuestionId] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            rows={6}
            placeholder="Type your answer here..."
          />
        );
      default:
        return <p>Unknown question type.</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          {currentQuestion && (
            <>
                <CardTitle className="text-2xl text-center">
                    {currentQuestion.text}
                </CardTitle>
                <CardDescription className="text-center">
                    {MOCK_QUESTION_BANK.domains.find(d => d.questions.some(q => q.id === currentQuestionId))?.name}
                </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
            {renderQuestion()}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={history.length === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
