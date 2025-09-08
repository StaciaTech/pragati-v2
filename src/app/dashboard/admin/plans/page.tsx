
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PLANS } from '@/lib/data/platform';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PlanConfigurationPage() {
    const { toast } = useToast();
    const [plans, setPlans] = React.useState(MOCK_PLANS);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentPlan, setCurrentPlan] = React.useState<(typeof MOCK_PLANS)[0] | null>(null);
    const [interval, setInterval] = React.useState('monthly');

    const handleEditPlan = (plan: (typeof MOCK_PLANS)[0]) => {
        setCurrentPlan(plan);
        setIsModalOpen(true);
    };

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        toast({
            title: `Plan Saved`,
            description: `The "${name}" plan has been updated.`,
        });
        setIsModalOpen(false);
    };
    
    const filteredPlans = plans.filter(plan => plan.interval === interval);

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Plan Configuration</CardTitle>
                  <CardDescription>Define and edit subscription tiers and their features.</CardDescription>
                </div>
                 <Tabs value={interval} onValueChange={setInterval}>
                    <TabsList>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
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
                {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.pricePerCredit > 0 ? plan.pricePerCredit : 'N/A'}</TableCell>
                    <TableCell>{plan.minCredits > 0 ? plan.minCredits : 'N/A'}</TableCell>
                    <TableCell>{plan.totalAmount > 0 ? `₹${plan.totalAmount.toLocaleString()}` : 'Custom'}</TableCell>
                    <TableCell>
                        <Badge variant={plan.enabled ? 'default' : 'destructive'}>
                        {plan.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>Edit</Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Plan: {currentPlan?.name}</DialogTitle>
                </DialogHeader>
                 <form onSubmit={handleSave}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Plan Name</Label>
                            <Input id="name" name="name" defaultValue={currentPlan?.name} required />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pricePerCredit">Price/Credit</Label>
                                <Input id="pricePerCredit" name="pricePerCredit" type="number" defaultValue={currentPlan?.pricePerCredit} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minCredits">Min Credits</Label>
                                <Input id="minCredits" name="minCredits" type="number" defaultValue={currentPlan?.minCredits} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalAmount">Total Amount</Label>
                                <Input id="totalAmount" name="totalAmount" type="number" defaultValue={currentPlan?.totalAmount} required />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="features">Features (comma-separated)</Label>
                            <Input id="features" name="features" defaultValue={currentPlan?.features.join(', ')} required />
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="enabled" defaultChecked={currentPlan?.enabled} />
                            <Label htmlFor="enabled">Enabled</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
  );
}
