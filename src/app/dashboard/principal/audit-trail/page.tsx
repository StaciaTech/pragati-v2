
'use client';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_TTC_AUDIT_TRAIL } from '@/lib/data/platform';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const categoryColors: Record<string, string> = {
  'User Management': 'bg-blue-500',
  'Idea Lifecycle': 'bg-purple-500',
  'Credit Transactions': 'bg-green-500',
  'Consultations': 'bg-orange-500',
  'System': 'bg-gray-500',
};

export default function PrincipalAuditTrailPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');

  const uniqueCategories = [...new Set(MOCK_TTC_AUDIT_TRAIL.map(log => log.category))];
  
  const filteredLogs = MOCK_TTC_AUDIT_TRAIL.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>View a log of all significant actions performed in your portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input 
            placeholder="Search by Actor or Action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger><SelectValue placeholder="Filter by Category..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Log ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Category</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredLogs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="font-mono text-xs cursor-pointer text-muted-foreground">{log.logId.substring(0,10)}...</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{log.logId}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{log.timestamp}</TableCell>
                            <TableCell className="font-medium">{log.actor}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>
                            <Badge className={cn(categoryColors[log.category], 'text-white')}>
                                {log.category}
                            </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                        No logs found matching your criteria.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
