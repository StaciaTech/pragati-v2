
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, Lightbulb, Users, Briefcase, Settings, FileText } from 'lucide-react';
import type { Role } from '@/lib/constants';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_INNOVATORS, MOCK_COLLEGES, MOCK_TTCS } from '@/lib/data/organization';
import { MOCK_PLANS } from '@/lib/data/platform';
import { cn } from '@/lib/utils';

interface Searchable {
  id: string;
  title: string;
  group: string;
  href?: string;
}

export function UniversalSearch({ role }: { role: Role }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const [os, setOs] = React.useState<'mac' | 'windows' | null>(null);

  React.useEffect(() => {
    // Set OS for shortcut display
    if (typeof window !== "undefined") {
      setOs(navigator.userAgent.toLowerCase().includes('mac') ? 'mac' : 'windows');
    }

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const searchData: Searchable[] = React.useMemo(() => {
    switch (role) {
      case 'Innovator':
        return MOCK_IDEAS.map(idea => ({ id: idea.id, title: idea.title, group: 'Ideas', href: `/dashboard/ideas/${idea.id}?role=${role}` }));
      case 'TTC Coordinator':
        return MOCK_INNOVATORS.map(inv => ({ id: inv.id, title: inv.name, group: 'Innovators', href: `/dashboard/coordinator/innovator-management?role=${role}` }));
      case 'College Principal Admin':
        return MOCK_TTCS.map(ttc => ({ id: ttc.id, title: ttc.name, group: 'TTCs', href: `/dashboard/principal/ttc-management?role=${role}` }));
      case 'Super Admin':
        return [
          ...MOCK_COLLEGES.map(c => ({ id: c.id, title: c.name, group: 'Institutions', href: `/dashboard/admin/institutions/${c.id}?role=${role}`})),
          ...MOCK_PLANS.map(p => ({id: p.id, title: p.name, group: 'Plans', href: `/dashboard/admin/plans?role=${role}`}))
        ];
      default:
        return [];
    }
  }, [role]);

  const getGroupIcon = (groupName: string) => {
    switch (groupName) {
        case 'Ideas': return <Lightbulb className="mr-2 h-4 w-4" />;
        case 'Innovators': return <Users className="mr-2 h-4 w-4" />;
        case 'TTCs': return <Briefcase className="mr-2 h-4 w-4" />;
        case 'Institutions': return <Briefcase className="mr-2 h-4 w-4" />;
        case 'Plans': return <Settings className="mr-2 h-4 w-4" />;
        default: return <FileText className="mr-2 h-4 w-4" />;
    }
  }

  const groupedData = searchData.reduce((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {} as Record<string, Searchable[]>);


  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          'relative h-9 w-9 p-0 text-muted-foreground hover:text-foreground sm:h-10 sm:w-64 sm:px-3 sm:justify-start'
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline-flex sm:ml-2">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          {os === 'mac' ? <span className="text-xs">⌘</span> : <span className="text-xs">Ctrl</span>}K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={`Search in ${role} portal...`} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedData).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map(item => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => {
                    if (item.href) {
                      runCommand(() => router.push(item.href!));
                    }
                  }}
                >
                  {getGroupIcon(group)}
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
