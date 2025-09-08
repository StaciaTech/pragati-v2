'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
        title: "Settings Saved",
        description: "Notification triggers and templates have been updated.",
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications & Templates</CardTitle>
          <CardDescription>Manage email triggers and content for different roles.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Triggers</CardTitle>
          <CardDescription>Enable or disable automated email notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="validationComplete" className="flex flex-col space-y-1">
                <span>Validation Complete</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Sent when an idea validation report is ready.
                </span>
            </Label>
            <Switch id="validationComplete" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="consultationInvite" className="flex flex-col space-y-1">
                <span>New Consultation Invite</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Sent to TTCs when an innovator books a consultation.
                </span>
            </Label>
            <Switch id="consultationInvite" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="creditExhaustion" className="flex flex-col space-y-1">
                <span>Credit Exhaustion Alert</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Sent to Principals when college credits are low.
                </span>
            </Label>
            <Switch id="creditExhaustion" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Edit the content of automated emails. Use placeholders like {"{ideaTitle}"}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="innovatorTemplate">Innovator - Validation Complete</Label>
                <Textarea id="innovatorTemplate" defaultValue={'Dear Innovator, your idea "{ideaTitle}" has been validated. View your detailed report here: {reportLink}'} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="ttcTemplate">TTC - New Consultation</Label>
                <Textarea id="ttcTemplate" defaultValue={'A new consultation has been requested for idea "{ideaTitle}" by {innovatorName}. Please review and accept.'} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="principalTemplate">Principal - Credit Alert</Label>
                <Textarea id="principalTemplate" defaultValue={'This is an alert that college {collegeName} has only {credits} credits remaining. Please purchase more to avoid service interruption.'} />
            </div>
        </CardContent>
        <CardHeader>
            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}