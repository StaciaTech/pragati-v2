"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Plus, IndianRupee } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface Plan {
  _id: string;
  id?: string;
  name: string;
  interval: "monthly" | "yearly";
  pricePerCredit: number;
  minCredits: number;
  totalAmount: number;
  features: string[];
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function PlanConfigurationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getToken();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCreateMode, setIsCreateMode] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<Plan | null>(null);
  const [interval, setInterval] = React.useState<"monthly" | "yearly">(
    "monthly"
  );
  const [individualCreditPrice, setIndividualCreditPrice] = React.useState(800);
  const [isPriceModalOpen, setIsPriceModalOpen] = React.useState(false);

  // Fetch all plans
  const { data: plansData, isLoading } = useQuery({
    queryKey: ["admin-plans", interval],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/plans/admin/all`, {
        params: { interval },
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
  });

  const plans: Plan[] = plansData?.data || [];

  // Fetch individual credit price
  const { data: priceData } = useQuery({
    queryKey: ["individual-credit-price"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/plans/admin/individual-credit-price`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!token,
    onSuccess: (data) => {
      setIndividualCreditPrice(data.price);
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (planData: { planId: string; data: Partial<Plan> }) => {
      const { data } = await axios.put(
        `${apiUrl}/api/plans/admin/update/${planData.planId}`,
        planData.data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-plans"]);
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update plan",
        variant: "destructive",
      });
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: Omit<Plan, "_id">) => {
      const { data } = await axios.post(
        `${apiUrl}/api/plans/admin/create`,
        planData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-plans"]);
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create plan",
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await axios.delete(
        `${apiUrl}/api/plans/admin/delete/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-plans"]);
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });

  // Update individual credit price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async (price: number) => {
      const { data } = await axios.put(
        `${apiUrl}/api/plans/admin/individual-credit-price`,
        { price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["individual-credit-price"]);
      toast({
        title: "Success",
        description: "Individual credit price updated successfully",
      });
      setIsPriceModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update price",
        variant: "destructive",
      });
    },
  });

  const handleCreatePlan = () => {
    setIsCreateMode(true);
    setCurrentPlan({
      _id: "",
      name: "",
      interval: interval,
      pricePerCredit: 0,
      minCredits: 0,
      totalAmount: 0,
      features: [],
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setIsCreateMode(false);
    setCurrentPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePlanMutation.mutate(planId);
    }
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const planData = {
      name: formData.get("name") as string,
      pricePerCredit: parseFloat(formData.get("pricePerCredit") as string),
      minCredits: parseInt(formData.get("minCredits") as string),
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      features: (formData.get("features") as string)
        .split(",")
        .map((f) => f.trim()),
      enabled: formData.get("enabled") === "on",
      interval: interval,
    };

    if (isCreateMode) {
      createPlanMutation.mutate(planData);
    } else if (currentPlan) {
      updatePlanMutation.mutate({
        planId: currentPlan._id,
        data: planData,
      });
    }
  };

  const handleUpdatePrice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPrice = parseFloat(formData.get("price") as string);
    updatePriceMutation.mutate(newPrice);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Individual Credit Price Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Individual Credit Price
              </CardTitle>
              <CardDescription>
                Price per credit for individual innovators (not part of any
                college)
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">₹{priceData?.price || 800}</p>
              </div>
              <Button onClick={() => setIsPriceModalOpen(true)}>
                Update Price
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Define and edit subscription tiers for college admins
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Tabs
              value={interval}
              onValueChange={(v) => setInterval(v as "monthly" | "yearly")}
            >
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleCreatePlan}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No plans found for {interval} interval</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleCreatePlan}
              >
                Create First Plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price/Credit (₹)</TableHead>
                  <TableHead>Min Credits</TableHead>
                  <TableHead>Total Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      {plan.pricePerCredit > 0
                        ? `₹${plan.pricePerCredit}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {plan.minCredits > 0 ? plan.minCredits : "N/A"}
                    </TableCell>
                    <TableCell>
                      {plan.totalAmount > 0
                        ? `₹${plan.totalAmount.toLocaleString()}`
                        : "Custom"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.enabled ? "default" : "destructive"}>
                        {plan.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePlan(plan._id)}
                        disabled={deletePlanMutation.isLoading}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Plan Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode
                ? "Create New Plan"
                : `Edit Plan: ${currentPlan?.name}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentPlan?.name}
                  placeholder="e.g., Essential Monthly"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerCredit">Price/Credit (₹)</Label>
                  <Input
                    id="pricePerCredit"
                    name="pricePerCredit"
                    type="number"
                    step="0.01"
                    defaultValue={currentPlan?.pricePerCredit}
                    placeholder="500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minCredits">Min Credits</Label>
                  <Input
                    id="minCredits"
                    name="minCredits"
                    type="number"
                    defaultValue={currentPlan?.minCredits}
                    placeholder="20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                  <Input
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    step="0.01"
                    defaultValue={currentPlan?.totalAmount}
                    placeholder="10000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  name="features"
                  defaultValue={currentPlan?.features?.join(", ")}
                  placeholder="20 Idea Submissions, Basic Feedback, 5 TTCs"
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Separate each feature with a comma
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  name="enabled"
                  defaultChecked={currentPlan?.enabled}
                />
                <Label htmlFor="enabled">Plan Enabled</Label>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Interval: {interval}</p>
                <p className="text-xs text-muted-foreground">
                  This plan will be available for {interval} subscriptions
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  updatePlanMutation.isLoading || createPlanMutation.isLoading
                }
              >
                {(updatePlanMutation.isLoading ||
                  createPlanMutation.isLoading) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isCreateMode ? "Create Plan" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Individual Price Modal */}
      <Dialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Individual Credit Price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePrice}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Credit (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={priceData?.price || 800}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This price applies to individual innovators purchasing single
                  credits
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={updatePriceMutation.isLoading}>
                {updatePriceMutation.isLoading && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Update Price
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
