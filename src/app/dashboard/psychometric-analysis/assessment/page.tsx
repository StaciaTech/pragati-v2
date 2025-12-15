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

interface QuestionData {
  question_id: string;
  question_text: string;
  dimension: string;
  question_type: string;
  options: Array<{
    option_id: string;
    text: string;
    score_profile: Record<string, number>;
  }>;
}

interface AssessmentData {
  assessment_id: string;
  title: string;
  description: string;
  total_questions: number;
  questions: QuestionData[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const { toast } = useToast();

  // State management
  const [assessmentData, setAssessmentData] =
    React.useState<AssessmentData | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [responses, setResponses] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get current question
  const currentQuestion = assessmentData?.questions[currentIndex];

  // Calculate progress
  const progress = assessmentData?.total_questions
    ? (Object.keys(responses).length / assessmentData.total_questions) * 100
    : 0;

  // Fetch questions on mount
  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Fetching questions from psychometric server...");

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("UserId"); // Ensure userId is stored
        console.log(token, userId);

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_PSYCHOMETRIC_URL}/api/psychometric/generate`,
          {
            num_questions: 20,
            user_id: userId || "anonymous",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Assessment data received:", response.data);

        if (response.data.success && response.data.questions?.length > 0) {
          setAssessmentData({
            assessment_id: response.data.assessment_id,
            title: response.data.title,
            description: response.data.description,
            total_questions: response.data.total_questions,
            questions: response.data.questions,
          });
          setResponses({});
          toast({
            title: "Assessment loaded",
            description: `${response.data.total_questions} questions ready`,
          });
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (error: any) {
        console.error("Failed to fetch questions:", error);
        toast({
          variant: "destructive",
          title: "Failed to Load Assessment",
          description:
            error?.response?.data?.error ||
            error?.message ||
            "Could not load questions",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  // Handle selecting an answer
  const handleAnswer = (optionId: string) => {
    if (!currentQuestion) return;

    const newResponses = { ...responses };
    newResponses[currentQuestion.question_id] = optionId;
    setResponses(newResponses);
  };

  // Handle next button
  const handleNext = () => {
    if (!currentQuestion) return;

    if (!responses[currentQuestion.question_id]) {
      toast({
        variant: "destructive",
        title: "Please select an answer",
      });
      return;
    }

    if (currentIndex < (assessmentData?.total_questions || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All questions answered, submit
      handleSubmit();
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit assessment
  const handleSubmit = async () => {
    console.log("clicked submission");

    if (!assessmentData || !currentQuestion) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("UserId");
      const userName = localStorage.getItem("userName");

      console.log(token, userId, userName);

      if (!token || !userId) {
        throw new Error("Missing authentication data");
      }

      console.log("Submitting assessment...", {
        assessment_id: assessmentData.assessment_id,
        user_id: userId,
        responses_count: Object.keys(responses).length,
      });

      // Call the new psychometric evaluate endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_PSYCHOMETRIC_URL}/api/psychometric/evaluate`,
        {
          assessment_id: assessmentData.assessment_id,
          user_id: userId,
          user_name: userName || "User",
          questions_data: {
            assessment_id: assessmentData.assessment_id,
            title: assessmentData.title,
            total_questions: assessmentData.total_questions,
            questions: assessmentData.questions,
          },
          responses: responses,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Evaluation response:", response.data);

      if (response.data.success) {
        const overallScore = response.data.overall_score || 0;
        const entrepreneurialFit =
          response.data.entrepreneurial_fit?.overall_fit || "Medium";

        // Store evaluation result for display on next page
        localStorage.setItem(
          "psychometricResult",
          JSON.stringify({
            evaluation_id: response.data.evaluation_id,
            overall_score: overallScore,
            dimension_scores: response.data.dimension_scores,
            personality_profile: response.data.personality_profile,
            entrepreneurial_fit: entrepreneurialFit,
            strengths: response.data.strengths,
            areas_for_development: response.data.areas_for_development,
            recommendations: response.data.recommendations,
            detailed_insights: response.data.detailed_insights,
          })
        );

        toast({
          title: "Assessment Complete!",
          description: `Your overall score: ${(overallScore * 10).toFixed(1)}%`,
        });

        // Redirect to results/analysis page
        router.push(
          `/dashboard/psychometric-analysis?evaluation_id=${
            response.data.evaluation_id
          }&role=${role || "entrepreneur"}`
        );
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          error?.response?.data?.error ||
          error?.message ||
          "Could not submit assessment",
      });
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading assessment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No questions loaded
  if (!assessmentData || assessmentData.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p>Failed to load assessment questions</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Current question not found
  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p>Question not found</p>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {assessmentData.total_questions}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedOptionId = responses[currentQuestion.question_id];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl text-center">
            {currentQuestion.question_text}
          </CardTitle>
          <CardDescription className="text-center">
            {currentQuestion.dimension} • Question {currentIndex + 1} of{" "}
            {assessmentData.total_questions}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[300px] flex items-center justify-center">
          <RadioGroup
            value={selectedOptionId || ""}
            onValueChange={handleAnswer}
          >
            <div className="w-full space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.option_id}
                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent ${
                    selectedOptionId === option.option_id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleAnswer(option.option_id)}
                >
                  <RadioGroupItem
                    value={option.option_id}
                    id={`option-${option.option_id}`}
                  />
                  <Label
                    htmlFor={`option-${option.option_id}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
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
          <div className="flex-1 text-center text-sm text-muted-foreground">
            {Object.keys(responses).length} / {assessmentData.total_questions}{" "}
            answered
          </div>
          <Button
            onClick={handleNext}
            disabled={isSubmitting || !selectedOptionId}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : currentIndex === assessmentData.total_questions - 1 ? (
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
