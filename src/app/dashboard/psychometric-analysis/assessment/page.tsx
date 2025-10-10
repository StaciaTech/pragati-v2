"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { ROLES } from "@/lib/constants";

interface Question {
  questionNumber: number;
  text: string;
  attribute: string;
  category: string;
  options: string[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const { toast } = useToast();

  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Starting to fetch questions...");

        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/psychometric/generate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Full API Response:", response);
        console.log("Response data:", response.data);
        console.log("Questions array:", response.data.questions);
        console.log("Questions length:", response.data.questions?.length);

        if (
          response.data.success &&
          response.data.questions &&
          response.data.questions.length > 0
        ) {
          console.log("Setting questions:", response.data.questions.length);
          setQuestions(response.data.questions);
          setAnswers(new Array(response.data.questions.length).fill(null));
          console.log("Questions state should be updated");
        } else {
          console.error("No questions in response");
          throw new Error("No questions returned from server");
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        toast({
          variant: "destructive",
          title: "Failed to Load",
          description: error?.response?.data?.error || error.message,
        });
      } finally {
        console.log("Setting loading to false");
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  // Add this debug useEffect
  React.useEffect(() => {
    console.log("Questions state changed:", questions.length);
    console.log("Current question:", questions[currentIndex]);
  }, [questions, currentIndex]);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0
      ? (answers.filter((a) => a !== null).length / questions.length) * 100
      : 0;

  console.log("Render state:", {
    isLoading,
    questionsLength: questions.length,
    currentIndex,
    hasCurrentQuestion: !!currentQuestion,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p>No questions loaded. Check console for details.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p>Question {currentIndex + 1} not found</p>
            <p className="text-sm text-muted-foreground">
              Total questions: {questions.length}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswer = (value: string) => {
    const optionIndex = currentQuestion.options.indexOf(value);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex + 1;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentIndex] === null) {
      toast({
        variant: "destructive",
        title: "Please select an answer",
      });
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Submit
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/psychometric/submit`,
        { responses: answers, model: "DINA" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Assessment Complete! 🎉",
          description: `Score: ${response.data.results.overallScore.toFixed(
            1
          )}%`,
        });
        router.push(`/dashboard/psychometric-analysis?role=${role}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error?.response?.data?.error || "Please try again",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl text-center">
            {currentQuestion.text}
          </CardTitle>
          <CardDescription className="text-center">
            {currentQuestion.category} • Question {currentIndex + 1} of{" "}
            {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <RadioGroup
            value={
              answers[currentIndex] !== null
                ? currentQuestion.options[answers[currentIndex] - 1]
                : undefined
            }
            onValueChange={handleAnswer}
            className="w-full space-y-3"
          >
            {currentQuestion.options?.map((option, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-3 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent ${
                  answers[currentIndex] === idx + 1
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleAnswer(option)}
              >
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting || answers[currentIndex] === null}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : currentIndex === questions.length - 1 ? (
              "Submit Assessment"
            ) : (
              "Next"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
