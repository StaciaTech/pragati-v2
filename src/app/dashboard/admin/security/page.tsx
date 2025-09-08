
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_INNOVATORS } from "@/lib/data/organization";

export default function SecurityLogsPage() {

    const mockActivityLogs = [
        { id: 1, timestamp: '2024-07-15 10:05 AM', userId: 'Super Admin', action: 'Logged in', ip: '192.168.1.10' },
        { id: 2, timestamp: '2024-07-15 10:10 AM', userId: 'INV001', action: 'Submitted new idea IDEA-004', ip: '10.0.0.5' },
        { id: 3, timestamp: '2024-07-15 09:50 AM', userId: 'INV004', action: 'Failed login attempt', ip: '10.0.0.6' },
        { id: 4, timestamp: '2024-07-15 09:51 AM', userId: 'INV004', action: 'Failed login attempt', ip: '10.0.0.6' },
        { id: 5, timestamp: '2024-07-15 09:52 AM', userId: 'INV004', action: 'Account locked due to multiple failed attempts', ip: '10.0.0.6' },
    ];

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Security & Logs</CardTitle>
                <CardDescription>Manage access controls, view activity logs, and handle security events.</CardDescription>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Role-Based Access Controls</CardTitle>
                <CardDescription>Overview of user roles and their statuses. Granular permissions can be configured here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>College ID</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_INNOVATORS.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.collegeId}</TableCell>
                                <TableCell><Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Activity Tracking</CardTitle>
                <CardDescription>Recent activity across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockActivityLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.timestamp}</TableCell>
                                <TableCell>{log.userId}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.ip}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm">Flag</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
