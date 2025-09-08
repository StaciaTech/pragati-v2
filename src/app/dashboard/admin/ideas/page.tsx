
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { STATUS_COLORS } from '@/lib/data/platform';
import { MOCK_COLLEGES } from '@/lib/data/organization';
import Link from 'next/link';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IdeaOversightPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCollege, setFilterCollege] = React.useState('');
  const [filterDomain, setFilterDomain] = React.useState('all');
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const uniqueDomains = [...new Set(MOCK_IDEAS.map(idea => idea.domain))];
  
  const filteredIdeas = MOCK_IDEAS.filter(idea => {
    const matchesSearch = idea.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          idea.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = filterCollege === '' || idea.collegeName === filterCollege;
    const matchesDomain = filterDomain === 'all' || idea.domain === filterDomain;
    return matchesSearch && matchesCollege && matchesDomain;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Idea Oversight</CardTitle>
        <CardDescription>Search, filter, and manage all ideas across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input 
            placeholder="Search by ID or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-full justify-between"
              >
                {filterCollege
                  ? MOCK_COLLEGES.find((college) => college.name === filterCollege)?.name
                  : "Select college..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search college..." />
                <CommandEmpty>No college found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                      key="all-colleges"
                      value=""
                      onSelect={() => {
                        setFilterCollege("");
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filterCollege === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All Colleges
                    </CommandItem>
                  {MOCK_COLLEGES.map((college) => (
                    <CommandItem
                      key={college.id}
                      value={college.name}
                      onSelect={(currentValue) => {
                        setFilterCollege(currentValue === filterCollege ? "" : currentValue);
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filterCollege === college.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {college.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger><SelectValue placeholder="Filter by Domain..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {uniqueDomains.map(domain => <SelectItem key={domain} value={domain}>{domain}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Innovator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIdeas.map((idea) => (
              <TableRow key={idea.id}>
                <TableCell className="font-medium">{idea.id}</TableCell>
                <TableCell>{idea.title}</TableCell>
                <TableCell>{idea.collegeName}</TableCell>
                <TableCell>{idea.innovatorName}</TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[idea.status]}>{idea.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" asChild size="sm">
                    <Link href={`/dashboard/ideas/${idea.id}?role=Super Admin`}>View Report</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
