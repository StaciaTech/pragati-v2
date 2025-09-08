
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_PLANS } from '@/lib/data/platform';
import { MOCK_COLLEGES } from '@/lib/data/organization';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PlanPaymentPage() {
    const { toast } = useToast();
    const currentPlanId = MOCK_COLLEGES[0].currentPlanId;
    const currentPlan = MOCK_PLANS.find(p => p.id === currentPlanId);
    const [interval, setInterval] = React.useState(currentPlan?.interval || 'monthly');

    const handlePurchase = (planName: string) => {
        toast({
            title: "Purchase Confirmation",
            description: `Simulating payment for the ${planName} plan.`,
        });
    }
    
    const handlePurchaseCredits = () => {
         toast({
            title: "Credits Purchased",
            description: `Simulating payment for add-on credits.`,
        });
    }
    
    const filteredPlans = MOCK_PLANS.filter(p => p.interval === interval);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Plan & Payment</CardTitle>
                <CardDescription>Manage your subscription plan and view payment history.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Your current plan is <span className="font-bold text-primary">{currentPlan?.name}</span>.</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Add-On Credits</CardTitle>
                <CardDescription>Purchase additional credits as needed. Price: ₹500 per credit.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Input type="number" defaultValue="10" className="w-32" />
                <Button onClick={handlePurchaseCredits}>Purchase Credits</Button>
            </CardContent>
        </Card>

        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Available Plans</h3>
                 <Tabs value={interval} onValueChange={setInterval}>
                    <TabsList>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlans.map(plan => (
                    <Card key={plan.id} className={`flex flex-col ${plan.id === currentPlanId ? 'border-primary ring-2 ring-primary' : ''}`}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription className="text-2xl font-bold">₹{plan.totalAmount > 0 ? plan.totalAmount.toLocaleString() : 'Custom'}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                {plan.features.map((feature, i) => <li key={i}>{feature}</li>)}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {plan.id === currentPlanId ? (
                                <Button disabled className="w-full">Current Plan</Button>
                            ) : (
                                <Button className="w-full" onClick={() => handlePurchase(plan.name)}>
                                    {plan.name.includes('Enterprises') ? 'Contact Us' : 'Upgrade'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>

    </div>
  );
}
