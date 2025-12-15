"use client";

import * as React from "react";
import {
  CreditCard,
  IndianRupee,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const CREDIT_COST = 800;
const MIN_CREDITS = 1;
const MAX_CREDITS = 100;

export default function PlanPaymentPage() {
  const [credits, setCredits] = React.useState<number>(1);
  const { toast } = useToast();

  const handleCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setCredits(Math.min(Math.max(value, MIN_CREDITS), MAX_CREDITS));
    } else if (e.target.value === "") {
      setCredits(0);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setCredits(value[0]);
  };

  const incrementCredits = () => {
    setCredits((prev) => Math.min(prev + 1, MAX_CREDITS));
  };

  const decrementCredits = () => {
    setCredits((prev) => Math.max(prev - 1, MIN_CREDITS));
  };

  const totalCost = credits * CREDIT_COST;

  const handlePayment = () => {
    toast({
      title: "Processing Payment",
      description: `Initiating payment for ₹${totalCost.toLocaleString()}`,
    });
    // Payment integration logic would go here
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buy Credits</h1>
            <p className="text-muted-foreground mt-2">
              Purchase credits to submit more ideas and access premium features.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Your transaction is protected with industry-standard
                  encryption.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Access</h3>
                <p className="text-sm text-muted-foreground">
                  Credits are added to your account immediately after successful
                  payment.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Adjust the number of credits you want to purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="credits" className="text-base font-medium">
                  Number of Credits
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={decrementCredits}
                    disabled={credits <= MIN_CREDITS}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="credits"
                    type="number"
                    min={MIN_CREDITS}
                    max={MAX_CREDITS}
                    value={credits || ""}
                    onChange={handleCreditsChange}
                    className="w-20 text-center h-8"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={incrementCredits}
                    disabled={credits >= MAX_CREDITS}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Slider
                value={[credits]}
                min={MIN_CREDITS}
                max={MAX_CREDITS}
                step={1}
                onValueChange={handleSliderChange}
                className="py-4"
              />
            </div>

            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost per credit</span>
                <span>₹{CREDIT_COST}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span>{credits}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount</span>
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full text-lg"
              size="lg"
              onClick={handlePayment}
              disabled={credits < 1}
            >
              Proceed to Pay ₹{totalCost.toLocaleString()}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
