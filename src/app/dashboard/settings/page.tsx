
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account and application settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
            This page is under construction. More settings will be available here soon.
        </p>
      </CardContent>
    </Card>
  );
}
