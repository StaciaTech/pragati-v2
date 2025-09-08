
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES, type Role } from '@/lib/constants';

const formatSegment = (segment: string) => {
  if (segment.startsWith('IDEA-')) return 'Idea Details';
  if (segment.startsWith('COL')) return 'Institution Details';

  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as Role) || ROLES.INNOVATOR;

  if (pathname === `/dashboard?role=${role}` || pathname === '/dashboard') {
    return null;
  }
  
  const getHomeLink = () => {
    switch (role) {
        case ROLES.SUPER_ADMIN: return `/dashboard/admin?role=${role}`;
        case ROLES.PRINCIPAL: return `/dashboard/principal?role=${role}`;
        case ROLES.COORDINATOR: return `/dashboard/coordinator?role=${role}`;
        case ROLES.INNOVATOR:
        default:
          return `/dashboard?role=${role}`;
    }
  }

  const segments = pathname.split('/').filter(Boolean);

  // Determine the base path and adjust segments accordingly
  let basePath = '/dashboard';
  let displaySegments = segments.slice(1);
  if(segments[1] === 'admin' || segments[1] === 'principal' || segments[1] === 'coordinator') {
    basePath = `/dashboard/${segments[1]}`;
    displaySegments = segments.slice(2);
  }


  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        <li>
          <Link href={getHomeLink()} className="hover:text-foreground">
            Dashboard
          </Link>
        </li>
        {displaySegments.map((segment, index) => {
          const isLast = index === displaySegments.length - 1;
          const href = `${basePath}/${displaySegments.slice(0, index + 1).join('/')}?role=${role}`;

          return (
            <li key={segment} className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4" />
              <Link
                href={href}
                className={cn(
                  'hover:text-foreground',
                  isLast && 'pointer-events-none text-foreground'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {formatSegment(segment)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
