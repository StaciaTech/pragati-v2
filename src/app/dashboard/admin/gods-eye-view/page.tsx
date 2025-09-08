
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { MOCK_INNOVATORS } from '@/lib/data/organization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, UserCheck, Sparkles, Filter, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ROLES } from '@/lib/constants';


type Innovator = (typeof MOCK_INNOVATORS)[0] & {
    enriched?: { industry: string; companySize: string; persona: string; personaScore: number; };
};

export default function GodsEyeViewPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [innovators, setInnovators] = React.useState<Innovator[]>(MOCK_INNOVATORS);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [personaFilter, setPersonaFilter] = React.useState('all');

    const [isEnhanceModalOpen, setIsEnhanceModalOpen] = React.useState(false);
    const [selectedInnovator, setSelectedInnovator] = React.useState<Innovator | null>(null);

    const filteredInnovators = innovators.filter(innovator => {
        const matchesSearch = innovator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              innovator.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPersona = personaFilter === 'all' || innovator.enriched?.persona === personaFilter;
        return matchesSearch && matchesPersona;
    });

    const handleOpenEnhanceModal = (innovator: Innovator) => {
        setSelectedInnovator(innovator);
        setIsEnhanceModalOpen(true);
    };
    
    const handleImpersonate = (innovator: Innovator) => {
        toast({
            title: "Impersonation Mode Activated",
            description: `You are now viewing the platform as ${innovator.name}. To exit, use the main user menu.`,
        });
        // In a real app, this would set a global state or cookie and force a reload.
    }

    const handleEnhance = () => {
        if (!selectedInnovator) return;
        
        toast({
            title: "AI Enhancement in Progress...",
            description: `Enriching profile for ${selectedInnovator.name}.`,
        });

        // Simulate AI enrichment
        setTimeout(() => {
            setInnovators(prev => prev.map(inv => 
                inv.id === selectedInnovator.id 
                ? { ...inv, enriched: { industry: 'HealthTech', companySize: '1-10', persona: 'The Disruptor', personaScore: 85 } }
                : inv
            ));
            toast({
                title: "Enrichment Complete!",
                description: `${selectedInnovator.name}'s profile has been updated with AI insights.`,
            });
            setIsEnhanceModalOpen(false);
        }, 2000);
    }
    
    const uniquePersonas = [...new Set(innovators.map(i => i.enriched?.persona).filter(Boolean))] as string[];

    const handleRowClick = (innovatorId: string) => {
        router.push(`/dashboard/admin/innovators/${innovatorId}?role=${ROLES.SUPER_ADMIN}`);
    };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="text-primary" /> God's Eye View - Master Innovator Pool</CardTitle>
          <CardDescription>A centralized database of all innovators. Use AI to enrich and segment data automatically.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input 
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={personaFilter} onValueChange={setPersonaFilter}>
                    <SelectTrigger><div className="flex items-center gap-2"><Filter className="h-4 w-4" /> <SelectValue placeholder="Filter by Persona..." /></div></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Personas</SelectItem>
                    {uniquePersonas.map(persona => (
                        <SelectItem key={persona} value={persona}>{persona}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Innovator</TableHead>
                <TableHead>AI Persona</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Company Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInnovators.map((innovator) => (
                <TableRow key={innovator.id} onClick={() => handleRowClick(innovator.id)} className="cursor-pointer">
                  <TableCell className="font-medium text-primary hover:underline">{innovator.name}<p className="text-muted-foreground text-xs">{innovator.email}</p></TableCell>
                  <TableCell>
                      {innovator.enriched ? (
                        <Badge variant="secondary">{innovator.enriched.persona} ({innovator.enriched.personaScore})</Badge>
                      ) : (
                        <Badge variant="outline">Not Analyzed</Badge>
                      )}
                  </TableCell>
                   <TableCell>{innovator.enriched?.industry || 'N/A'}</TableCell>
                   <TableCell>{innovator.enriched?.companySize || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEnhanceModal(innovator)}>
                        <Sparkles className="mr-2 h-4 w-4" /> AI Enhance
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="secondary" size="sm">
                                <Eye className="mr-2 h-4 w-4" /> Impersonate
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Impersonate User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to view the platform as <span className="font-bold">{innovator.name}</span>. 
                                    All actions you take will be logged as the Super Admin. Are you sure you want to continue?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleImpersonate(innovator)}>Yes, Impersonate</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEnhanceModalOpen} onOpenChange={setIsEnhanceModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>AI Profile Enrichment</DialogTitle>
                <DialogDescription>
                    Use AI to analyze and enrich the profile of <span className="font-bold">{selectedInnovator?.name}</span> with predicted attributes.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <h4 className="font-semibold mb-2">Current Data</h4>
                <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Industry:</span> {selectedInnovator?.enriched?.industry || 'Not set'}</p>
                    <p><span className="text-muted-foreground">Persona:</span> {selectedInnovator?.enriched?.persona || 'Not set'}</p>
                </div>
                 <div className="h-[200px] w-full mt-4">
                    <ChartContainer config={{}} className="h-full w-full">
                        <ResponsiveContainer>
                            <BarChart
                                data={[{ name: 'Score', score: selectedInnovator?.enriched?.personaScore || 0 }]}
                                layout="vertical"
                                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                            >
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" domain={[0,100]} hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                <Bar dataKey="score" fill="hsl(var(--primary))" radius={5} background={{ fill: 'hsl(var(--muted))' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleEnhance}>
                    <Sparkles className="mr-2 h-4 w-4" /> {selectedInnovator?.enriched ? 'Re-Analyze' : 'Run AI Analysis'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
