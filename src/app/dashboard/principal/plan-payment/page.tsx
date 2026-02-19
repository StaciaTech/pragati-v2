"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Loader2,
  CheckCircle2,
  Calendar,
  CreditCard,
  IndianRupee,
  Minus,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const zohoAccountId = process.env.NEXT_PUBLIC_ZOHO_ACCOUNT_ID;
const zohoDomain = process.env.NEXT_PUBLIC_ZOHO_DOMAIN || "IN";
const zohoApiKey = process.env.NEXT_PUBLIC_ZOHO_API_KEY;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

declare global {
  interface Window {
    ZPayments: any;
  }
}

interface Plan {
  _id: string;
  name: string;
  interval: "monthly" | "yearly";
  pricePerCredit: number;
  minCredits: number;
  totalAmount: number;
  features: string[];
  enabled: boolean;
}

interface Subscription {
  _id: string;
  planId: string;
  planName: string;
  interval: string;
  creditsAllocated: number;
  creditsUsed: number;
  creditsRemaining: number;
  totalAmount: number;
  status: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
}

export default function PlanPaymentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getToken();

  const [interval, setInterval] = React.useState<"monthly" | "yearly">(
    "monthly",
  );
  const [addonCredits, setAddonCredits] = React.useState(10);
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [purchaseResult, setPurchaseResult] = React.useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
  const [isPaymentWidgetOpen, setIsPaymentWidgetOpen] = React.useState(false);
  const zpInstanceRef = React.useRef<any>(null);

  React.useEffect(() => {
    console.log("[PAYMENT] Step 1: Injecting Zoho Payments script...");
    const script = document.createElement("script");
    script.src = "https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js";
    script.async = true;
    script.onload = () => {
      console.log("[PAYMENT] Step 2: Script loaded successfully");
      const zpayKeys = Object.keys(window).filter(
        (k) =>
          k.toLowerCase().includes("zpay") ||
          k.toLowerCase().includes("zoho") ||
          k.toLowerCase().includes("payment"),
      );
      console.log(
        "[PAYMENT] Step 3: Window keys with zpay/zoho/payment:",
        zpayKeys,
      );
      console.log(
        "[PAYMENT] Step 4: window.ZPayments =",
        typeof window.ZPayments,
        window.ZPayments,
      );
      setIsScriptLoaded(true);
      console.log("[PAYMENT] Step 5: isScriptLoaded set to true");
    };
    script.onerror = (e) => {
      console.error("[PAYMENT] ERROR: Script failed to load", e);
      toast({
        title: "Error",
        description: "Payment gateway failed to load.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/plans/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data);
      return data;
    },
    enabled: !!token,
  });

  const currentSubscription: Subscription | null = subscriptionData?.data;

  // Fetch available plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["available-plans", interval],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/plans/available`, {
        params: { interval },
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
  });

  const plans: Plan[] = plansData?.data || [];

  // Fetch user profile for credit balance
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

  // Purchase plan mutation
  const purchasePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await axios.post(
        `${apiUrl}/api/plans/purchase`,
        { planId, autoRenew: false },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["my-subscription"]);
      queryClient.invalidateQueries(["user-profile"]);
      setPurchaseResult(data);
      setShowPurchaseModal(false);
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description:
          error.response?.data?.error ||
          "Failed to purchase plan. Please try again.",
        variant: "destructive",
      });
      setShowPurchaseModal(false);
    },
  });

  // Purchase add-on credits mutation (using individual credit purchase endpoint)
  const purchaseAddonMutation = useMutation({
    mutationFn: async (quantity: number) => {
      const { data } = await axios.post(
        `${apiUrl}/api/plans/purchase-credits`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user-profile"]);
      toast({
        title: "Credits Purchased",
        description: `Successfully added ${addonCredits} credits to your account!`,
      });
      setAddonCredits(10); // Reset
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description:
          error.response?.data?.error || "Failed to purchase credits.",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (plan: Plan) => {
    if (plan.totalAmount === 0) {
      // Enterprise plan - contact us
      toast({
        title: "Contact Sales",
        description: "Please contact our sales team for enterprise pricing.",
      });
      return;
    }
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) {
      console.log("[PLAN PURCHASE] No plan selected, aborting");
      return;
    }
    console.log(
      "[PLAN PURCHASE] Step 1: Starting purchase for plan:",
      selectedPlan.name,
      "ID:",
      selectedPlan._id,
    );
    console.log(
      "[PLAN PURCHASE] Step 2: Token:",
      token ? `${token.substring(0, 20)}...` : "MISSING",
    );

    try {
      console.log(
        "[PLAN PURCHASE] Step 3: Calling /api/payment/initiate-purchase with:",
        {
          planId: selectedPlan._id,
          amount: selectedPlan.totalAmount,
          description: `Subscription for ${selectedPlan.name}`,
        },
      );

      const { data } = await axios.post(
        `${apiUrl}/api/payment/initiate-purchase`,
        {
          planId: selectedPlan._id,
          amount: selectedPlan.totalAmount,
          description: `Subscription for ${selectedPlan.name}`,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("[PLAN PURCHASE] Step 4: API response:", data);

      const sessionId = data.payments_session_id;
      console.log("[PLAN PURCHASE] Step 5: Session ID:", sessionId);

      if (!sessionId) {
        console.error("[PLAN PURCHASE] ERROR: No session ID in response");
        throw new Error("No session ID received from server");
      }

      console.log(
        "[PLAN PURCHASE] Step 6: window.ZPayments =",
        typeof window.ZPayments,
      );
      if (typeof window.ZPayments === "undefined") {
        console.error(
          "[PLAN PURCHASE] ERROR: ZPayments not available on window",
        );
        throw new Error(
          "Zoho Payments library not loaded. Please refresh the page.",
        );
      }

      console.log("[PLAN PURCHASE] Step 7: Creating ZPayments instance...");
      const zp = new window.ZPayments({
        account_id: zohoAccountId,
        domain: zohoDomain,
        otherOptions: { api_key: zohoApiKey },
      });
      zpInstanceRef.current = zp;
      setIsPaymentWidgetOpen(true);
      console.log("[PLAN PURCHASE] Step 7a: ZPayments instance:", zp);
      console.log(
        "[PLAN PURCHASE] Step 8: Calling requestPaymentMethod with sessionId:",
        sessionId,
      );

      try {
        const paymentResponse = await zp.requestPaymentMethod({
          payments_session_id: sessionId,
          amount: String(selectedPlan.totalAmount),
          currency_code: "INR",
          transaction_type: "authorization",
          redirect_url: `${window.location.origin}/dashboard/principal/plan-payment?role=college_admin`,
        });
        console.log(
          "[PLAN PURCHASE] Step 9: Payment COMPLETE",
          paymentResponse,
        );
        zp.close();
        zpInstanceRef.current = null;
        setIsPaymentWidgetOpen(false);
        setPurchaseResult(paymentResponse);
        setShowPurchaseModal(false);
        setShowSuccessModal(true);
        queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } catch (paymentError: any) {
        console.error("[PLAN PURCHASE] Step 9: Payment REJECTED", paymentError);
        console.error(
          "[PLAN PURCHASE] Payment error JSON:",
          JSON.stringify(paymentError, null, 2),
        );
        toast({
          title: "Payment Failed",
          description:
            paymentError?.message ||
            paymentError?.error_message ||
            JSON.stringify(paymentError) ||
            "Transaction failed.",
          variant: "destructive",
        });
        zpInstanceRef.current = null;
        setIsPaymentWidgetOpen(false);
        setShowPurchaseModal(false);
      }
    } catch (error: any) {
      console.error("[PLAN PURCHASE] CATCH ERROR:", error);
      console.error("[PLAN PURCHASE] Error response:", error.response?.data);
      console.error("[PLAN PURCHASE] Error status:", error.response?.status);
      toast({
        title: "Connection Error",
        description:
          error.response?.data?.error ||
          error.message ||
          "Could not reach payment server.",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseAddon = async () => {
    console.log(
      "[ADDON PURCHASE] Step 1: Starting addon purchase, credits:",
      addonCredits,
    );
    if (addonCredits < 1) {
      console.log("[ADDON PURCHASE] Invalid quantity, aborting");
      toast({
        title: "Invalid Quantity",
        description: "Please enter at least 1 credit.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(
        "[ADDON PURCHASE] Step 2: Token:",
        token ? `${token.substring(0, 20)}...` : "MISSING",
      );
      console.log(
        "[ADDON PURCHASE] Step 3: Calling /api/payment/initiate-purchase with:",
        {
          amount: addonCredits * 800,
          description: `Purchase of ${addonCredits} credits`,
        },
      );

      const { data } = await axios.post(
        `${apiUrl}/api/payment/initiate-purchase`,
        {
          amount: addonCredits * 800,
          description: `Purchase of ${addonCredits} credits`,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("[ADDON PURCHASE] Step 4: API response:", data);

      const sessionId =
        data.payments_session_id || data.payments_session?.payments_session_id;
      console.log("[ADDON PURCHASE] Step 5: Extracted sessionId:", sessionId);

      if (!sessionId) {
        console.error(
          "[ADDON PURCHASE] ERROR: Missing Session ID. Full data:",
          JSON.stringify(data, null, 2),
        );
        throw new Error("Invalid session ID received from server");
      }

      console.log("[ADDON PURCHASE] Step 6: Checking window.ZPayments...");
      console.log(
        "[ADDON PURCHASE] Step 6a: typeof window.ZPayments =",
        typeof window.ZPayments,
      );
      console.log("[ADDON PURCHASE] Step 6b: isScriptLoaded =", isScriptLoaded);

      if (typeof window.ZPayments === "undefined") {
        console.error(
          "[ADDON PURCHASE] ERROR: ZPayments not on window. All window keys with zpay/zoho:",
          Object.keys(window).filter(
            (k) =>
              k.toLowerCase().includes("zpay") ||
              k.toLowerCase().includes("zoho"),
          ),
        );
        throw new Error(
          "Zoho Payments library not loaded. Please refresh the page.",
        );
      }

      console.log("[ADDON PURCHASE] Step 7: Creating ZPayments instance...");
      const zp = new window.ZPayments({
        account_id: zohoAccountId,
        domain: zohoDomain,
        otherOptions: { api_key: zohoApiKey },
      });
      zpInstanceRef.current = zp;
      setIsPaymentWidgetOpen(true);
      console.log("[ADDON PURCHASE] Step 8: ZPayments instance created:", zp);
      console.log(
        "[ADDON PURCHASE] Step 9: Calling requestPaymentMethod with sessionId:",
        sessionId,
      );

      try {
        const paymentResponse = await zp.requestPaymentMethod({
          payments_session_id: data.payments_session_id || sessionId,
          amount: String(addonCredits * 800),
          currency_code: "INR",
          transaction_type: "authorization",
          redirect_url: `${window.location.origin}/dashboard/principal/plan-payment?role=college_admin`,
        });
        console.log(
          "[ADDON PURCHASE] Step 10: Payment COMPLETE",
          paymentResponse,
        );
        zp.close();
        zpInstanceRef.current = null;
        setIsPaymentWidgetOpen(false);
        toast({
          title: "Credits Purchased",
          description: "Successfully added credits to your account!",
        });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } catch (paymentError: any) {
        console.error(
          "[ADDON PURCHASE] Step 10: Payment REJECTED",
          paymentError,
        );
        console.error(
          "[ADDON PURCHASE] Payment error JSON:",
          JSON.stringify(paymentError, null, 2),
        );
        toast({
          title: "Payment Failed",
          description:
            paymentError?.message ||
            paymentError?.error_message ||
            JSON.stringify(paymentError) ||
            "Credits purchase failed.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("[ADDON PURCHASE] CATCH ERROR:", error);
      console.error("[ADDON PURCHASE] Error response:", error.response?.data);
      console.error("[ADDON PURCHASE] Error status:", error.response?.status);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment.",
        variant: "destructive",
      });
    }
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-96 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Current Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              {currentSubscription
                ? "Manage your active subscription plan"
                : "Custom Plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSubscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan Name</p>
                    <p className="text-lg font-semibold text-primary">
                      {currentSubscription.planName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Credits Remaining
                    </p>
                    <p className="text-lg font-semibold">
                      {currentSubscription.creditsRemaining} /{" "}
                      {currentSubscription.creditsAllocated}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        currentSubscription.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentSubscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expires On</p>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(
                        currentSubscription.expiryDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount Paid
                    </p>
                    <p className="text-xl font-bold">
                      ₹{currentSubscription.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Credits in Account
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {currentCredits}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>
                  You are currently subscribed to a{" "}
                  <strong>Custom Monthly Plan</strong>. This plan includes 50
                  credits for ₹10,000 and consultation services for ₹75,000.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add-On Credits Card */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Additional Credits</CardTitle>
            <CardDescription>
              Need more credits? Purchase add-on credits anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAddonCredits(Math.max(1, addonCredits - 1))}
                  disabled={purchaseAddonMutation.isLoading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={addonCredits}
                  onChange={(e) =>
                    setAddonCredits(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  disabled={purchaseAddonMutation.isLoading}
                  className="w-32 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAddonCredits(addonCredits + 1)}
                  disabled={purchaseAddonMutation.isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Total: ₹{(addonCredits * 800).toLocaleString()}
                </p>
                {!isScriptLoaded && (
                  <p className="text-xs text-amber-500">
                    Loading payment gateway...
                  </p>
                )}
              </div>
              <Button
                onClick={handlePurchaseAddon}
                // disabled={!isScriptLoaded || purchaseAddonMutation.isLoading}
                disabled={true}
              >
                {purchaseAddonMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Purchase Credits"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Available Plans</h3>
            <Tabs
              value={interval}
              onValueChange={(v) => setInterval(v as "monthly" | "yearly")}
            >
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <p>No plans available for {interval} interval</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = currentSubscription?.planId === plan._id;
                const isEnterprise = plan.totalAmount === 0;

                return (
                  <Card
                    key={plan._id}
                    className={`flex flex-col ${
                      isCurrentPlan ? "border-primary ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        {isCurrentPlan && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold">
                        {isEnterprise ? (
                          <span>Custom Pricing</span>
                        ) : (
                          <span className="flex items-center">
                            <IndianRupee className="h-5 w-5" />
                            {plan.totalAmount.toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                      {!isEnterprise && (
                        <p className="text-xs text-muted-foreground">
                          {plan.minCredits} credits @ ₹{plan.pricePerCredit}
                          /credit
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrentPlan ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handlePlanSelect(plan)}
                          disabled={!!currentSubscription} // Can't buy if already have subscription
                        >
                          {isEnterprise ? "Contact Us" : "Purchase Plan"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Review your plan purchase details
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="font-semibold">
                    {selectedPlan.minCredits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Interval
                  </span>
                  <span className="font-semibold capitalize">
                    {selectedPlan.interval}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold text-lg">
                    ₹{selectedPlan.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Credits will be added to your account immediately after payment
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPurchaseModal(false)}
              disabled={purchasePlanMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPurchase}
              disabled={purchasePlanMutation.isLoading}
            >
              {purchasePlanMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Plan Purchased Successfully! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Your subscription is now active
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">
                  {purchaseResult?.subscription?.planName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits Allocated</span>
                <span className="font-semibold">
                  {purchaseResult?.subscription?.creditsAllocated}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">
                  ₹{purchaseResult?.subscription?.totalAmount?.toLocaleString()}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium">Valid Until</span>
                <span className="font-bold">
                  {purchaseResult?.subscription?.expiryDate &&
                    new Date(
                      purchaseResult.subscription.expiryDate,
                    ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
