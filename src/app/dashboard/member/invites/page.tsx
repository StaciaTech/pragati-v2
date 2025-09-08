
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';

const mockInvites = [
    { id: 'INVITE-001', ideaTitle: 'Decentralized Education Platform', innovatorName: 'John Smith', status: 'Pending' as const, date: '2024-07-28' },
    { id: 'INVITE-002', ideaTitle: 'Renewable Energy Grid Optimizer', innovatorName: 'Priya Singh', status: 'Accepted' as const, date: '2024-07-25' },
];


export default function InvitesPage() {
    const { toast } = useToast();
    const [invites, setInvites] = React.useState(mockInvites);

    const handleResponse = (inviteId: string, response: 'Accepted' | 'Declined') => {
        setInvites(invites.map(inv => inv.id === inviteId ? { ...inv, status: response } : inv));
        toast({
            title: `Invite ${response}`,
            description: `You have ${response.toLowerCase()} the invitation.`
        });
    };

    const pendingInvites = invites.filter(i => i.status === 'Pending');
    const pastInvites = invites.filter(i => i.status !== 'Pending');

    const InviteList = ({ list, isPending }: { list: typeof invites, isPending: boolean }) => (
        <div className="space-y-4">
            {list.length > 0 ? list.map(invite => (
                <Card key={invite.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src={`https://avatar.vercel.sh/${invite.innovatorName}.png`} alt={invite.innovatorName} />
                                <AvatarFallback>{invite.innovatorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{invite.ideaTitle}</p>
                                <p className="text-sm text-muted-foreground">Invited by {invite.innovatorName} on {invite.date}</p>
                            </div>
                        </div>
                        {isPending ? (
                            <div className="flex gap-2">
                                <Button size="icon" className="bg-green-500 hover:bg-green-600" onClick={() => handleResponse(invite.id, 'Accepted')}><Check className="h-4 w-4" /></Button>
                                <Button size="icon" variant="destructive" onClick={() => handleResponse(invite.id, 'Declined')}><X className="h-4 w-4" /></Button>
                            </div>
                        ) : (
                            <p className={`text-sm font-semibold ${invite.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{invite.status}</p>
                        )}
                    </CardContent>
                </Card>
            )) : (
                <p className="text-center text-muted-foreground py-8">No {isPending ? 'pending' : 'past'} invites.</p>
            )}
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Invitations</CardTitle>
                <CardDescription>Manage your invitations to join various innovation teams.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                        <InviteList list={pendingInvites} isPending={true} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <InviteList list={pastInvites} isPending={false} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
