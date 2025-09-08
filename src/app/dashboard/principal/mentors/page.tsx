
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_INTERNAL_MENTOR_USERS } from '@/lib/data/auth';
import { useToast } from '@/hooks/use-toast';
import { STATUS_COLORS } from '@/lib/data/platform';

export default function PrincipalMentorManagementPage() {
    const { toast } = useToast();
    const [mentors, setMentors] = React.useState(MOCK_INTERNAL_MENTOR_USERS);
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredMentors = mentors.filter(mentor => 
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = (mentorId: string) => {
        // This is a mock implementation. In a real app, you'd call an API.
        // setMentors(prev => prev.map(m => m.id === mentorId ? {...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m));
        toast({
            title: "Action Not Implemented",
            description: "Changing mentor status is not yet implemented in this mock.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Internal Mentor Management</CardTitle>
                <CardDescription>View and manage all internal mentors within your institution.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <Input 
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMentors.map((mentor) => (
                            <TableRow key={mentor.id}>
                                <TableCell className="font-medium">{mentor.name}</TableCell>
                                <TableCell>{mentor.email}</TableCell>
                                <TableCell>
                                    <Badge className={STATUS_COLORS['Active']}>Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant={'destructive'} 
                                        size="sm" 
                                        onClick={() => handleToggleStatus(mentor.id)}
                                        disabled // Remove disabled prop when implemented
                                    >
                                        Deactivate
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {filteredMentors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No mentors found.</TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
