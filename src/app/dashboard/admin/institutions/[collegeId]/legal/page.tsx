
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MOCK_COLLEGES } from '@/lib/data/organization';

export default function InstitutionLegalDocsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const collegeId = params.collegeId as string;

    const college = MOCK_COLLEGES.find(c => c.id === collegeId);
    
    // In a real app, this would be fetched from a database.
    const [terms, setTerms] = React.useState(`Organization-specific Terms of Service for ${college?.name}. Version 1.0.`);
    const [privacy, setPrivacy] = React.useState(`Organization-specific Privacy Policy for ${college?.name}. Version 1.0.`);

    if (!college) {
        return <p>College not found.</p>;
    }

    const handleSave = () => {
        // Here you would make an API call to save the updated documents.
        console.log({
            collegeId,
            terms,
            privacy,
        });
        toast({
            title: 'Legal Documents Saved',
            description: `The policies for ${college.name} have been updated.`,
        });
    };

    return (
        <div className="space-y-6">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/admin/institutions`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Institutions
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Legal Documents for {college.name}</CardTitle>
                    <CardDescription>
                        Edit the Terms of Service and Privacy Policy specific to this institution. These will override the platform defaults for users from this college.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="terms">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                        </TabsList>
                        <TabsContent value="terms" className="mt-4">
                            <Textarea
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                className="min-h-[50vh] font-mono text-sm"
                                placeholder="Enter Terms of Service content here..."
                            />
                        </TabsContent>
                        <TabsContent value="privacy" className="mt-4">
                             <Textarea
                                value={privacy}
                                onChange={(e) => setPrivacy(e.target.value)}
                                className="min-h-[50vh] font-mono text-sm"
                                placeholder="Enter Privacy Policy content here..."
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
