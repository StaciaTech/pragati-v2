

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Building, Check, ChevronsUpDown, Landmark, User as UserIcon, ArrowLeft, TrendingUp, Lightbulb, Users, Quote } from 'lucide-react';
import { MOCK_COLLEGES } from '@/lib/data/organization';
import { cn } from '@/lib/utils';
import { Logo, StaciaLogo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import dynamic from 'next/dynamic';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });


const stats = [
    { value: 1248, label: 'Ideas Validated', icon: <Lightbulb /> },
    { value: 85, label: 'Startups Funded', icon: <TrendingUp /> },
    { value: 4300, label: 'Innovators Joined', icon: <Users /> },
];

const quotes = [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "The value of an idea lies in the using of it.", author: "Thomas Edison" },
];

const AnimatedStat = ({ value, label, icon }: { value: number, label: string, icon: React.ReactNode }) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const controls = {
            stop: () => {},
        };

        const animateValue = (start: number, end: number, duration: number) => {
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                setCount(Math.floor(progress * (end - start) + start));
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };
            requestAnimationFrame(step);
        };
        
        animateValue(0, value, 2000);

        return () => controls.stop();
    }, [value]);

    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                {icon} {count.toLocaleString()}
            </div>
            <p className="text-sm text-primary-foreground/80">{label}</p>
        </div>
    );
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userType, setUserType] = React.useState<string>('organisations');
  const [step, setStep] = React.useState<'select_type' | 'select_org'>('select_type');
  
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = React.useState<string>('');

  const [animationData, setAnimationData] = React.useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = React.useState(0);

   React.useEffect(() => {
        import('lottie-react').then(() => {
            fetch('https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json')
              .then((res) => res.json())
              .then((data) => setAnimationData(data));
        });
      
    const quoteInterval = setInterval(() => {
        setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 7000);

    return () => clearInterval(quoteInterval);
  }, []);

  const orgs = MOCK_COLLEGES;

  const handleTypeSelect = (type: string) => {
    setUserType(type);
    const ideaTitle = searchParams.get('title');
    const ideaDescription = searchParams.get('description');
    const query = new URLSearchParams();
    if (ideaTitle) query.set('title', ideaTitle);
    if (ideaDescription) query.set('description', ideaDescription);

    if (type === 'innovator') {
        router.push(`/login/credentials?userType=Innovator&${query.toString()}`);
    } else {
        setStep('select_org');
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background lg:grid lg:grid-cols-2">
       <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
        </div>
      <div className="relative hidden h-full flex-col items-center justify-center p-10 text-white dark:border-r lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-indigo-600 opacity-80" />
        {animationData && <Lottie animationData={animationData} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="relative z-10 w-full max-w-2xl backdrop-blur-xl bg-black/30 p-8 rounded-2xl border border-white/20 shadow-2xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuoteIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            <Quote className="h-8 w-8 text-primary-foreground/50 mb-4" />
                            <p className="text-2xl font-semibold text-balance">"{quotes[currentQuoteIndex].text}"</p>
                            <p className="mt-2 text-lg text-primary-foreground/80">- {quotes[currentQuoteIndex].author}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="mt-12 grid grid-cols-3 gap-8">
                   {stats.map((stat, i) => (
                       <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                        >
                           <AnimatedStat value={stat.value} label={stat.label} icon={stat.icon} />
                       </motion.div>
                   ))}
                </div>
            </motion.div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <Card className="shadow-2xl">
                <CardHeader>
                    <div className="relative flex flex-col items-center text-center mb-4">
                        {step === 'select_type' && (
                           <Button variant="ghost" asChild className="absolute -top-2 -left-2 z-10">
                                <Link href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Link>
                            </Button>
                        )}
                        {step === 'select_org' && (
                            <Button variant="ghost" onClick={() => setStep('select_type')} className="absolute -top-2 -left-2 z-10">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        )}
                         <Logo className="mb-4 h-12 w-12 text-primary" />
                          <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
                             Login Selection
                          </h1>
                    </div>
                    <CardDescription className="text-center">
                        {step === 'select_type'
                        ? 'First, tell us what type of user you are.'
                        : `Find your organization from the list below to proceed.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        {step === 'select_type' && (
                            <motion.div
                                key="select_type"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="py-4"
                            >
                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => handleTypeSelect('organisations')} className={cn("p-4 border rounded-lg cursor-pointer flex items-start gap-4 transition-all text-left hover:border-primary hover:bg-muted", userType === 'organisations' && "border-primary ring-2 ring-primary bg-muted")}>
                                        <div className="flex-1">
                                            <div className="font-semibold flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Organisations & GCCs</div>
                                            <p className="text-sm text-muted-foreground">For corporate or government entity users.</p>
                                        </div>
                                    </button>
                                     <button onClick={() => handleTypeSelect('institutions')} className={cn("p-4 border rounded-lg cursor-pointer flex items-start gap-4 transition-all text-left hover:border-primary hover:bg-muted", userType === 'institutions' && "border-primary ring-2 ring-primary bg-muted")}>
                                        <div className="flex-1">
                                            <div className="font-semibold flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Institutions</div>
                                            <p className="text-sm text-muted-foreground">For users affiliated with a Government & College Cells.</p>
                                        </div>
                                    </button>
                                    <button onClick={() => handleTypeSelect('innovator')} className={cn("p-4 border rounded-lg cursor-pointer flex items-start gap-4 transition-all text-left hover:border-primary hover:bg-muted", userType === 'innovator' && "border-primary ring-2 ring-primary bg-muted")}>
                                        <div className="flex-1">
                                            <div className="font-semibold flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Innovators</div>
                                            <p className="text-sm text-muted-foreground">For independent innovators, mentors, or team members.</p>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'select_org' && (
                            <motion.div
                                key="select_org"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="py-4 space-y-6"
                            >
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={popoverOpen}
                                        className="w-full justify-between h-12 text-base"
                                    >
                                        {selectedOrg
                                        ? orgs.find((org) => org.name === selectedOrg)?.name
                                        : "Select organization..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[350px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search organization..." />
                                        <CommandList>
                                            <CommandEmpty>No organization found.</CommandEmpty>
                                            <CommandGroup>
                                                {orgs.map((org) => (
                                                    <CommandItem
                                                        key={org.id}
                                                        value={org.name}
                                                        onSelect={() => {
                                                            const userTypeParam = userType === 'institutions' ? 'Institutions' : 'Organisations & GCCs';
                                                            const ideaTitle = searchParams.get('title');
                                                            const ideaDescription = searchParams.get('description');
                                                            const query = new URLSearchParams();
                                                            if (ideaTitle) query.set('title', ideaTitle);
                                                            if (ideaDescription) query.set('description', ideaDescription);
                                                            router.push(`/login/credentials?org=${encodeURIComponent(org.name)}&userType=${userTypeParam}&${query.toString()}`);
                                                        }}
                                                    >
                                                    <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedOrg === org.name ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {org.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
             <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                © 2025 Pragati by Vencorp a Unit of Stacia Corp
            </p>
          </div>
      </div>
    </main>
  );
}
