
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import * as React from 'react';
import { BackButton } from '@/components/back-button';


export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold">PragatiAI</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
             <BackButton />
            <div className="prose dark:prose-invert mt-6">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
}
