"use client";

import * as React from "react";
import {
  CreditCard,
  IndianRupee,
  Minus,
  Plus,
  ShieldCheck,
  Loader2,
  CheckCircle2,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const MIN_CREDITS = 1;
const MAX_CREDITS = 100;

export default function PlanPaymentPage() {
  const [credits, setCredits] = React.useState<number>(1);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [purchaseDetails, setPurchaseDetails] = React.useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getToken();

  // Fetch individual credit price
  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ["individual-credit-price"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/plans/individual-price`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
  });

  // Fetch user profile for current credit balance
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
  });

  const currentCredits = profileData?.user?.creditQuota || 0;
  const creditPrice = priceData?.pricePerCredit || 800;

  // Purchase credits mutation
  const purchaseMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const { data } = await axios.post(
        `${apiUrl}/api/plans/purchase-credits`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["user-profile"]);
      queryClient.invalidateQueries(["purchase-history"]);

      // Show success modal
      setPurchaseDetails(data);
      setShowSuccessModal(true);

      // Reset credits to 1
      setCredits(1);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description:
          error.response?.data?.error ||
          "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const totalCost = credits * creditPrice;

  const handlePayment = () => {
    if (credits < 1) {
      toast({
        title: "Invalid Quantity",
        description: "Please select at least 1 credit to purchase.",
        variant: "destructive",
      });
      return;
    }

    // Initiate purchase
    purchaseMutation.mutate(credits);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setPurchaseDetails(null);
  };

  if (priceLoading) {
    return (
      <div className="flex items-center justify-center h-96 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-4xl py-10">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Section - Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Buy Credits</h1>
              <p className="text-muted-foreground mt-2">
                Purchase credits to submit more ideas and access premium
                features.
              </p>
            </div>

            {/* Current Balance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Available Credits
                  </span>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {currentCredits}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
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
                    Credits are added to your account immediately after
                    successful payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Price per Credit
                    </p>
                    <p className="text-2xl font-bold flex items-center mt-1">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {creditPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Your New Balance
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {currentCredits + credits}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Order Summary */}
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
                      disabled={
                        credits <= MIN_CREDITS || purchaseMutation.isLoading
                      }
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
                      disabled={purchaseMutation.isLoading}
                      className="w-20 text-center h-8"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={incrementCredits}
                      disabled={
                        credits >= MAX_CREDITS || purchaseMutation.isLoading
                      }
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
                  disabled={purchaseMutation.isLoading}
                  className="py-4"
                />
              </div>

              <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost per credit</span>
                  <span>₹{creditPrice}</span>
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
                disabled={credits < 1 || purchaseMutation.isLoading}
              >
                {purchaseMutation.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>Proceed to Pay ₹{totalCost.toLocaleString()}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Payment Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Your credits have been added to your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits Purchased</span>
                <span className="font-semibold">
                  {purchaseDetails?.purchase?.quantity || credits}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">
                  ₹
                  {purchaseDetails?.purchase?.totalAmount?.toLocaleString() ||
                    totalCost.toLocaleString()}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium">New Balance</span>
                <span className="font-bold text-primary text-lg">
                  {purchaseDetails?.newCreditBalance ||
                    currentCredits + credits}{" "}
                  Credits
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Transaction ID:{" "}
                {purchaseDetails?.purchase?.transactionId || "N/A"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseSuccessModal}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleCloseSuccessModal();
                router.push("/dashboard?role=individual_innovator");
              }}
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
