

'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Rocket, Users, Building, Landmark, User as UserIcon, Quote, Sparkles, Paperclip, ChevronDown, Send, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TypingPlaceholder } from '@/components/typing-placeholder';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Validation',
    description: 'Receive in-depth, structured feedback on your ideas in minutes, not weeks. Our AI analyzes your concept against dozens of key viability parameters.',
  },
  {
    icon: <Rocket className="h-8 w-8 text-teal-400" />,
    title: 'Guided Innovation Roadmap',
    description: "Don't just get a score, get a plan. PragatiAI provides a clear, step-by-step roadmap to take your idea from TRL 1 to market-ready.",
  },
  {
    icon: <Users className="h-8 w-8 text-orange-400" />,
    title: 'Role-Based Dashboards',
    description: 'Track performance, identify trends, and make data-driven decisions with dashboards tailored to every role, from innovator to administrator.',
  },
];

const testimonials = [
    {
        quote: "PragatiAI transformed my raw concept into a fundable project. The AI feedback was like having a team of expert consultants 24/7.",
        name: "Aarav Sharma",
        role: "Student Innovator",
        avatar: "A"
    },
    {
        quote: "As a mentor, this platform is a game-changer. I can track my students' progress, provide targeted feedback, and see real results.",
        name: "Dr. Priya Desai",
        role: "TTC Coordinator",
        avatar: "P"
    },
    {
        quote: "We've seen a 300% increase in quality idea submissions since adopting Pragati. It has revolutionized our college's innovation ecosystem.",
        name: "R. Madhavan",
        role: "College Principal",
        avatar: "R"
    }
];

const whoWeServe = [
    {
        name: "Institutions",
        icon: Landmark,
        description: "For colleges and universities, Pragati helps manage Technology Transfer Cells (TTCs) and nurture student and faculty ideas within your innovation ecosystem.",
    },
    {
        name: "Organisations & GCCs",
        icon: Building,
        description: "For corporate, government, or Global Capability Centers, Pragati provides a centralized platform to manage, mentor, and accelerate innovations at scale.",
    },
    {
        name: "Innovators",
        icon: UserIcon,
        description: "For the solo creator, student, or researcher, Pragati is your co-pilot, providing the expert feedback and structured guidance needed to turn a spark of an idea into reality.",
    }
];

const dynamicPlaceholders = [
    "Validate my new product idea...",
    "Check the novelty of my invention...",
    "Create a project report for my startup...",
    "Generate a business plan for a fintech app...",
    "Analyze the market for a new SaaS tool..."
];

const clientLogos = [
    'Tech Innovators Inc.',
    'Future Labs',
    'EduVentures',
    'AgriGrowth Corp',
    'HealthForward',
    'FinSolutions',
    'CityZen',
    'GreenEnergy Co.'
];

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [ideaDescription, setIdeaDescription] = React.useState('');
  const [selectedPreset, setSelectedPreset] = React.useState('Balanced');
  const [animationData, setAnimationData] = React.useState(null);


  React.useEffect(() => {
    // Dynamically load animation data on the client
    import('lottie-react').then(() => {
        fetch('https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json')
          .then((res) => res.json())
          .then((data) => setAnimationData(data));
    });
  }, []);

  const handleValidateClick = () => {
    const query = new URLSearchParams();
    if (ideaDescription) query.set('description', ideaDescription);
    router.push(`/login?${query.toString()}`);
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    toast({
        title: "Preset Selected",
        description: `You've selected the "${preset}" validation model. This will be applied when you submit.`,
    });
  }

  const FADE_IN_ANIMATION_VARIANTS = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  
  const [activeTab, setActiveTab] = React.useState('Institutions');


  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8 fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Pragati</span>
          </Link>
          
          <nav className="hidden lg:flex items-baseline space-x-4">
              <a href="#features" className="nav-link text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium">Features</a>
              <a href="#who-we-serve" className="nav-link text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium">Who We Serve</a>
              <a href="#psychometric-analysis" className="nav-link text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium">Psychometric Analysis</a>
              <a href="#testimonials" className="nav-link text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium">Testimonials</a>
          </nav>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <div className="hidden sm:flex items-center space-x-2">
                <Button asChild variant="ghost" onClick={() => router.push('/login')}>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="btn-primary text-white font-medium" onClick={() => router.push('/signup')}>
                    <Link href="/signup">Get Started</Link>
                </Button>
              </div>
              <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[240px]">
                        <nav className="flex flex-col gap-4 mt-8">
                            <SheetClose asChild><a href="#features" className="text-lg font-medium hover:text-primary">Features</a></SheetClose>
                            <SheetClose asChild><a href="#who-we-serve" className="text-lg font-medium hover:text-primary">Who We Serve</a></SheetClose>
                            <SheetClose asChild><a href="#psychometric-analysis" className="text-lg font-medium hover:text-primary">Psychometric Analysis</a></SheetClose>
                            <SheetClose asChild><a href="#testimonials" className="text-lg font-medium hover:text-primary">Testimonials</a></SheetClose>
                            <div className="pt-4 border-t">
                                <SheetClose asChild>
                                    <Button asChild variant="ghost" className="w-full justify-start">
                                        <Link href="/login">Login</Link>
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button asChild className="w-full mt-2">
                                        <Link href="/signup">Get Started</Link>
                                    </Button>
                                </SheetClose>
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
              </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative min-h-[calc(100dvh-4rem)] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--muted-foreground)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted-foreground)/0.1)_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
            <div className="absolute -z-10 top-0 left-0 h-full w-full bg-gradient-to-br from-primary/10 via-transparent to-primary/10 dark:from-primary/20 dark:via-transparent dark:to-primary/20"></div>

            <div className="relative z-10 max-w-4xl w-full mx-auto text-center flex flex-col items-center">
                
                <motion.div 
                    {...FADE_IN_ANIMATION_VARIANTS}
                    className="flex flex-col items-center gap-2 mb-6"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary">Pragati</h1>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">helps you</p>
                    <TypingPlaceholder
                        placeholders={[
                            "Validate your idea.",
                            "Launch your product.",
                            "Create a business plan.",
                            "Check for novelty.",
                            "Generate a report."
                        ]}
                        isHeroTitle
                        interval={3000}
                    />
                </motion.div>
                
                <motion.p 
                  {...FADE_IN_ANIMATION_VARIANTS}
                  transition={{...FADE_IN_ANIMATION_VARIANTS.transition, delay: 0.2}}
                  className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-balance"
                >
                    From concept to market-ready. Just prompt, no code.
                </motion.p>
                
                <motion.div
                    {...FADE_IN_ANIMATION_VARIANTS}
                    transition={{...FADE_IN_ANIMATION_VARIANTS.transition, delay: 0.4}}
                    className="max-w-2xl w-full mx-auto"
                >
                    <Card className="bg-card/70 backdrop-blur-sm p-2 space-y-4 shadow-2xl border border-border/20">
                        <div className="relative">
                            <div className="absolute top-3 right-3 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                            {selectedPreset}
                                            <ChevronDown className="h-4 w-4 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => handlePresetSelect('Balanced')}>Balanced</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handlePresetSelect('Impact-First')}>Impact-First</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handlePresetSelect('Scale-Up')}>Scale-Up</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handlePresetSelect('Disruptor')}>Disruptor</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="relative">
                                <Textarea
                                    id="idea-description-landing"
                                    placeholder=""
                                    value={ideaDescription}
                                    onChange={(e) => setIdeaDescription(e.target.value)}
                                    className="min-h-[140px] p-4 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none pr-32"
                                />
                                {!ideaDescription && (
                                    <div className="absolute inset-0 pointer-events-none pr-32">
                                        <TypingPlaceholder placeholders={dynamicPlaceholders} isTextInputPlaceholder interval={3500} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-3 left-3 flex items-center gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Use AI to enhance your text (in-app feature)</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Attach pitch deck (in-app feature)</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="absolute bottom-3 right-3">
                                 <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="icon" className="rounded-full h-8 w-8" onClick={handleValidateClick}>
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Validate Idea</p></TooltipContent>
                                    </Tooltip>
                                 </TooltipProvider>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </section>

        <section id="features" className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial="initial"
                    whileInView="animate"
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent text-balance">
                        The Pragati Ecosystem
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                        Comprehensive tools designed to transform your innovative ideas into market-ready solutions
                    </p>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                         <motion.div
                            key={feature.title}
                            initial="initial"
                            whileInView="animate"
                            variants={FADE_IN_ANIMATION_VARIANTS}
                            transition={{...FADE_IN_ANIMATION_VARIANTS.transition, delay: i * 0.2}}
                            viewport={{ once: true }}
                            className="card-hover bg-card p-8 rounded-2xl shadow-lg border"
                         >
                            <div className="feature-icon w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-card-foreground">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

         <section id="who-we-serve" className="py-20 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial="initial"
                    whileInView="animate"
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent text-balance">
                        Who We Serve
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                        Pragati is tailored for every stage of the innovation journey.
                    </p>
                </motion.div>
                
                <div className="flex justify-center mb-8">
                    <div className="flex flex-wrap justify-center gap-1 bg-card p-1 rounded-full border">
                        {whoWeServe.map(item => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`${
                                    activeTab === item.name
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted/50'
                                } px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[150px]">
                    {whoWeServe.map(item => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: activeTab === item.name ? 1 : 0, y: activeTab === item.name ? 0 : 20 }}
                            transition={{ duration: 0.5 }}
                            style={{ display: activeTab === item.name ? 'block' : 'none' }}
                            className="card-hover bg-card p-8 rounded-2xl shadow-lg border"
                        >
                            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                                <div className="feature-icon w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <item.icon className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-semibold mb-2 text-card-foreground">{item.name}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section id="psychometric-analysis" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              variants={FADE_IN_ANIMATION_VARIANTS}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="font-semibold text-primary">Psychometric Analysis</p>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent text-balance">
                Discover Your Innovator Profile
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance mb-8">
                Take our quick psychometric assessment to discover your unique strengths, work style, and potential.
              </p>
              <Button size="lg" asChild className="btn-primary text-white font-medium">
                  <Link href="/assessment">
                      Start The Assessment 
                      <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-bold mb-2 text-foreground">Trusted By Leading Institutions</h2>
                 <p className="text-muted-foreground mb-12">Powering innovation ecosystems across the nation.</p>
                 <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                          delay: 2000,
                          stopOnInteraction: false,
                        }),
                      ]}
                    className="w-full"
                    >
                    <CarouselContent>
                        {clientLogos.map((logo, index) => (
                        <CarouselItem key={index} className="basis-1/2 md:basis-1/4 lg:basis-1/6">
                            <div className="p-1">
                                <div className="flex aspect-video items-center justify-center p-6 bg-background/50 rounded-lg border">
                                    <span className="text-lg font-semibold text-muted-foreground">{logo}</span>
                                </div>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>


        <section id="testimonials" className="py-20 bg-background relative overflow-hidden">
             <div className="absolute inset-0 opacity-5 dark:opacity-[0.02]">
                <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full filter blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-teal-400 rounded-full filter blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/50 rounded-full filter blur-3xl"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial="initial"
                    whileInView="animate"
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground text-balance">
                        Trusted by the Next Generation of Leaders
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                        See how Pragati is transforming innovation across colleges and organizations worldwide
                    </p>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                           key={i}
                           initial="initial"
                           whileInView="animate"
                           variants={FADE_IN_ANIMATION_VARIANTS}
                           transition={{...FADE_IN_ANIMATION_VARIANTS.transition, delay: i * 0.2}}
                           viewport={{ once: true }}
                           className="testimonial-card p-8 rounded-2xl shadow-xl bg-card/80 backdrop-blur-md border"
                        >
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {testimonial.avatar}
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                             <p className="text-muted-foreground italic leading-relaxed relative">
                                <Quote className="absolute -top-2 -left-4 h-6 w-6 text-muted-foreground/20" />
                                {testimonial.quote}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section id="contact" className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial="initial"
                    whileInView="animate"
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    viewport={{ once: true }}
                 >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                        Ready to Build the Future?
                    </h2>
                    <p className="text-lg md:text-xl mb-12 opacity-90 leading-relaxed text-balance">
                        Let's connect and launch the next big thing together.
                    </p>
                    <Button size="lg" asChild className="bg-white text-primary px-12 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl" onClick={() => router.push('/signup')}>
                       <Link href="/signup">Get Started Now</Link>
                    </Button>
                </motion.div>
            </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div>
                    <div className="text-2xl font-bold text-primary mb-2">Pragati</div>
                    <div className="text-sm text-muted-foreground mb-4">A Vencorp Product</div>
                    <p className="text-gray-300 leading-relaxed">
                        Transforming academic innovation into market reality through AI-powered validation and guidance.
                    </p>
                </div>
                
                <div>
                    <h4 className="text-lg font-semibold mb-4">Company</h4>
                    <div className="space-y-2">
                        <a href="#" className="block text-gray-300 hover:text-primary transition-colors">Vencorp</a>
                        <a href="https://www.staciacorp.com" target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline transition-colors">Stacia Corp</a>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-lg font-semibold mb-4">Legal</h4>
                    <div className="space-y-2">
                        <Link href="/terms-of-service" className="block text-gray-300 hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/privacy-policy" className="block text-gray-300 hover:text-primary transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-700 mt-12 pt-8 text-center">
                <p className="text-muted-foreground">
                    © 2025 Pragati by Vencorp a Unit of <a href="https://www.staciacorp.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stacia Corp</a>
                </p>
            </div>
        </div>
    </footer>
    </div>
  );
}
