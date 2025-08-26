
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldError } from 'react-hook-form';
import { z } from 'zod';
import { FileUp, BrainCircuit, ArrowRight, ArrowLeft, TriangleAlert, UserCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperNext,
  StepperPrevious,
  StepperTrigger,
  useStepper,
} from '@/components/ui/stepper';
import { SpiderChart } from '@/components/spider-chart';
import { INITIAL_CLUSTER_WEIGHTS, MOCK_INNOVATOR_USER } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
import Lottie from 'lottie-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const clusterKeys = Object.keys(INITIAL_CLUSTER_WEIGHTS);
const weightageSchema = clusterKeys.reduce((acc, key) => {
    acc[key] = z.number().min(0).max(100);
    return acc;
}, {} as Record<string, z.ZodNumber>);

const founderAnalysisSchema = z.object({
  riskAppetite: z.enum(['High', 'Moderate', 'Low'], { required_error: "Please select your risk appetite." }),
  workStyle: z.enum(['Collaborative', 'Independent'], { required_error: "Please select your work style." }),
  motivation: z.enum(['Impact', 'Financial', 'Innovation'], { required_error: "Please select your primary motivation." })
});


const submitIdeaSchema = z.object({
  ...weightageSchema,
  preset: z.string().default('Balanced'),

  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  pptFile: z
    .any()
    .refine((files) => files?.[0], 'PPT file is required.')
    .refine(
      (files) => files?.[0]?.name?.endsWith('.ppt') || files?.[0]?.name?.endsWith('.pptx'),
      'Please upload a .ppt or .pptx file.'
    ),
  domain: z.string().min(1, 'Project domain is required.'),
  otherDomain: z.string().optional(),
}).refine(data => {
    if (data.domain === 'Other') {
        return !!data.otherDomain && data.otherDomain.length > 0;
    }
    return true;
}, {
    message: 'Please specify your domain',
    path: ['otherDomain'],
}).and(founderAnalysisSchema.partial()); // Make founder analysis fields optional initially

type SubmitIdeaForm = z.infer<typeof submitIdeaSchema>;

const defaultValues: Partial<SubmitIdeaForm> = {
  ...INITIAL_CLUSTER_WEIGHTS,
  preset: 'Balanced',
  title: '',
  description: '',
  domain: '',
  otherDomain: '',
};

const presets = {
  Balanced: INITIAL_CLUSTER_WEIGHTS,
  "Research-Focused": {
    "Core Idea & Innovation": 30,
    "Market & Commercial Opportunity": 10,
    "Execution & Operations": 20,
    "Business Model & Strategy": 10,
    "Team & Organizational Health": 10,
    "External Environment & Compliance": 10,
    "Risk & Future Outlook": 10
  },
  "Commercialization-Focused": {
    "Core Idea & Innovation": 10,
    "Market & Commercial Opportunity": 30,
    "Execution & Operations": 15,
    "Business Model & Strategy": 20,
    "Team & Organizational Health": 10,
    "External Environment & Compliance": 5,
    "Risk & Future Outlook": 10
  },
};

const clusters = Object.keys(INITIAL_CLUSTER_WEIGHTS);

function Step1({ form }: { form: any }) {
  const { setActiveStep } = useStepper();
  const { toast } = useToast();
  const preset = form.watch('preset');
  const watchedWeights = form.watch(clusters);
  const totalWeight = clusters.reduce((acc, cluster) => acc + Math.round(form.getValues(cluster) || 0), 0);
  
  const handlePresetChange = (presetKey: keyof typeof presets | 'Manual') => {
      form.setValue('preset', presetKey);
      if (presetKey !== 'Manual') {
        const presetValues = presets[presetKey as keyof typeof presets];
        Object.entries(presetValues).forEach(([key, value]) => {
            form.setValue(key, value);
        });
      }
  };

 const handleManualWeightChange = (changedCluster: string, newValue: number) => {
    if (preset !== 'Manual') return;

    newValue = Math.max(0, Math.min(100, Math.round(newValue)));

    const otherClusters = clusters.filter(c => c !== changedCluster);
    const oldTotal = clusters.reduce((sum, c) => sum + form.getValues(c), 0);
    const oldValueForChanged = form.getValues(changedCluster);
    
    // Set the new value for the changed cluster
    form.setValue(changedCluster, newValue, { shouldDirty: true });

    // Calculate how much we need to adjust the others
    let remainingToDistribute = 100 - (oldTotal - oldValueForChanged + newValue);

    // Smart single-pass redistribution
    let adjustableClusters = otherClusters.filter(c => form.getValues(c) + remainingToDistribute >= 0);
    let totalAdjustableValue = adjustableClusters.reduce((sum, c) => sum + form.getValues(c), 0);
    
    if (totalAdjustableValue > 0) {
        let distributedDelta = 0;
        adjustableClusters.forEach(cluster => {
            const clusterValue = form.getValues(cluster);
            const proportion = clusterValue / totalAdjustableValue;
            const adjustment = Math.round(remainingToDistribute * proportion);
            const newClusterValue = Math.max(0, Math.min(100, clusterValue + adjustment));
            form.setValue(cluster, newClusterValue);
            distributedDelta += (newClusterValue - clusterValue);
        });
        remainingToDistribute -= distributedDelta;
    }
    
    // Final check for rounding errors
    let finalTotal = clusters.reduce((sum, c) => sum + form.getValues(c), 0);
    let finalDelta = 100 - finalTotal;

    if (finalDelta !== 0) {
        const clusterToAdjust = otherClusters.find(c => {
            const val = form.getValues(c);
            return finalDelta > 0 ? val < 100 : val > 0;
        }) || otherClusters[0];
        
        if (clusterToAdjust) {
            form.setValue(clusterToAdjust, Math.max(0, Math.min(100, form.getValues(clusterToAdjust) + finalDelta)));
        }
    }
    
    clusters.forEach(c => form.trigger(c));
};


  const handleNext = () => {
    const currentTotal = clusters.reduce((acc, cluster) => acc + Math.round(form.getValues(cluster) || 0), 0);
    
    if (preset === 'Manual' && currentTotal !== 100) {
        toast({
            variant: "destructive",
            title: "Weightage Error",
            description: `In Manual mode, the total weightage must sum to 100%. Current total: ${currentTotal}%`,
        });
        return;
    }
    setActiveStep(1);
  }

  return (
    <StepperItem index={0}>
      <StepperTrigger>
        <CardTitle>Idea Settings - Cluster Weightage</CardTitle>
        <CardDescription>Adjust weights to match your idea's focus.</CardDescription>
      </StepperTrigger>
      <StepperContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
           <div className="w-full space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
                <Button size="sm" variant={preset === 'Balanced' ? 'default' : 'outline'} onClick={() => handlePresetChange('Balanced')}>Balanced</Button>
                <Button size="sm" variant={preset === 'Research-Focused' ? 'default' : 'outline'} onClick={() => handlePresetChange('Research-Focused')}>Research-Focused</Button>
                <Button size="sm" variant={preset === 'Commercialization-Focused' ? 'default' : 'outline'} onClick={() => handlePresetChange('Commercialization-Focused')}>Commercialization-Focused</Button>
                <Button size="sm" variant={preset === 'Manual' ? 'default' : 'outline'} onClick={() => handlePresetChange('Manual')}>Manual</Button>
            </div>
            
            {preset === 'Manual' && (
              <Alert variant="default" className="border-orange-500/50 text-orange-700 dark:text-orange-300">
                <TriangleAlert className="h-4 w-4 !text-orange-600" />
                <AlertTitle>Expert Mode Activated</AlertTitle>
                <AlertDescription>
                  You are in full control. For best results, we recommend our pre-calibrated presets unless you are a pro!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {clusters.map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>{key}</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                            <Slider
                              value={[field.value || 0]}
                              onValueChange={(value) => handleManualWeightChange(key, value[0])}
                              max={100}
                              step={1}
                              disabled={preset !== 'Manual'}
                            />
                             <div className="w-24 text-right">
                                {preset === 'Manual' ? (
                                    <Input 
                                        type="number"
                                        className="w-20 text-center"
                                        value={Math.round(field.value || 0)}
                                        onChange={(e) => handleManualWeightChange(key, parseInt(e.target.value, 10) || 0)}
                                        min="0"
                                        max="100"
                                    />
                                ) : (
                                    <span className="font-semibold text-lg">{Math.round(field.value || 0)}%</span>
                                )}
                            </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
             <div className={cn("relative text-sm font-medium p-3 border rounded-lg flex justify-between items-center overflow-hidden",
                totalWeight === 100
                ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-green-300 dark:border-green-700' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700'
             )}>
                {totalWeight === 100 ? (
                  <>
                    <div className="absolute -top-1/4 -left-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-br from-teal-400 to-green-600 opacity-20 blur-2xl filter" />
                    <div className="absolute -bottom-1/4 -right-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-tl from-lime-400 to-green-500 opacity-10 blur-2xl filter" />
                  </>
                ) : (
                  <>
                    <div className="absolute -top-1/4 -left-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-br from-red-500 to-orange-600 opacity-20 blur-2xl filter" />
                    <div className="absolute -bottom-1/4 -right-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-tl from-yellow-500 to-red-500 opacity-10 blur-2xl filter" />
                  </>
                )}
                <span className="relative z-10">Total Weight:</span>
                <span className="relative z-10 font-bold text-xl">{Math.round(totalWeight)}%</span>
            </div>
          </div>
          <div className="w-full h-[500px] bg-background rounded-lg p-4 flex items-center justify-center">
              <SpiderChart data={form.getValues()} size={500} />
          </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleNext}>Save & Next</Button>
        </div>
      </StepperContent>
    </StepperItem>
  );
}

const ideaDetailFields: (keyof SubmitIdeaForm)[] = ['title', 'description', 'pptFile', 'domain'];

function Step2({ form }: { form: any }) {
    const { setActiveStep } = useStepper();
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const domain = form.watch('domain');

    const handleNext = async () => {
        const fieldToValidate = ideaDetailFields[currentQuestion];
        let isValid = await form.trigger(fieldToValidate);
        
        if(fieldToValidate === 'domain' && form.getValues('domain') === 'Other') {
            isValid = await form.trigger('otherDomain');
        }

        if (isValid) {
            if (currentQuestion < ideaDetailFields.length - 1) {
                setCurrentQuestion(q => q + 1);
            } else {
                setActiveStep(2);
            }
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(q => q - 1);
        } else {
             setActiveStep(0);
        }
    };
    
    const getAnimationClass = (index: number) => {
        if (index === currentQuestion) return "animate-in slide-in-from-right-16 fade-in";
        if (index < currentQuestion) return "animate-out slide-out-to-left-16 fade-out hidden";
        return "hidden";
    }

    return (
        <StepperItem index={1}>
        <StepperTrigger>
          <CardTitle>Upload Idea Details</CardTitle>
          <CardDescription>Provide your idea description and supporting documents.</CardDescription>
        </StepperTrigger>
        <StepperContent>
          <div className="py-6 overflow-hidden min-h-[350px]">
            <div className={cn("space-y-6", getAnimationClass(0))}>
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-lg">What is the title of your idea?</FormLabel>
                        <FormControl><Input placeholder="e.g., AI-Powered Crop Disease Detection" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
             <div className={cn("space-y-6", getAnimationClass(1))}>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Briefly describe the core concept of your idea.</FormLabel>
                      <FormControl><Textarea placeholder="Describe the problem you're solving and your proposed solution..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className={cn("space-y-6", getAnimationClass(2))}>
                <FormField control={form.control} name="pptFile" render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Please upload your Pitch Deck.</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input type="file" className="pl-10" accept=".ppt, .pptx" 
                            onChange={(e) => onChange(e.target.files)}
                           {...rest}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Please adhere to the provided PPT format guidelines.</FormDescription>
                      <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className={cn("space-y-6", getAnimationClass(3))}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField control={form.control} name="domain" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">What is the domain of your project?</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a domain" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="HealthTech">HealthTech</SelectItem>
                            <SelectItem value="EdTech">EdTech</SelectItem>
                            <SelectItem value="FinTech">FinTech</SelectItem>
                            <SelectItem value="Agriculture">Agriculture</SelectItem>
                            <SelectItem value="Smart Cities">Smart Cities</SelectItem>
                            <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                            <SelectItem value="SpaceTech">SpaceTech</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {domain === 'Other' && (
                        <FormField control={form.control} name="otherDomain" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">Please specify the domain</FormLabel>
                                <FormControl><Input placeholder="e.g., Sustainable Fashion" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                </div>
            </div>
          </div>
          <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}><ArrowLeft className="mr-2"/> Back</Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2"/>
              </Button>
          </div>
        </StepperContent>
      </StepperItem>
    );
}

function Step3({ form }: { form: any }) {
    const { setActiveStep } = useStepper();

    const handleNext = async () => {
        const isValid = await form.trigger(["riskAppetite", "workStyle", "motivation"]);
        if (isValid) {
            setActiveStep(3);
        }
    };
    
    // This is mock data. In a real app, you'd fetch this based on the logged-in user.
    if (MOCK_INNOVATOR_USER.hasPsychometricAnalysis) {
        return (
            <StepperItem index={2}>
                <StepperTrigger>
                    <CardTitle>Founder Analysis</CardTitle>
                    <CardDescription>Your psychometric profile is already on file.</CardDescription>
                </StepperTrigger>
                <StepperContent>
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg my-6">
                        <UserCheck className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold">We've Got You Covered!</h3>
                        <p className="text-muted-foreground">Your analysis is already saved. You can proceed to the next step.</p>
                    </div>
                    <div className="flex justify-between">
                        <StepperPrevious variant="outline" />
                        <Button onClick={() => setActiveStep(3)}>Next</Button>
                    </div>
                </StepperContent>
            </StepperItem>
        );
    }
    
    return (
        <StepperItem index={2}>
            <StepperTrigger>
                <CardTitle>Founder Analysis</CardTitle>
                <CardDescription>Help us understand your approach to innovation.</CardDescription>
            </StepperTrigger>
            <StepperContent>
                <div className="space-y-8 py-6">
                    <FormField control={form.control} name="riskAppetite" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-base">When facing a critical decision with uncertain outcomes, you tend to:</FormLabel>
                            <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="High" /></FormControl><FormLabel className="font-normal">Favor the high-risk, high-reward option.</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Moderate" /></FormControl><FormLabel className="font-normal">Seek a balance between risk and potential reward.</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Low" /></FormControl><FormLabel className="font-normal">Prefer the safer, more predictable path.</FormLabel></FormItem>
                            </RadioGroup></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="workStyle" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-base">When developing a new project, you work best:</FormLabel>
                            <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Collaborative" /></FormControl><FormLabel className="font-normal">By brainstorming and building with a team from the start.</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Independent" /></FormControl><FormLabel className="font-normal">By developing the initial concept alone before bringing in others.</FormLabel></FormItem>
                            </RadioGroup></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="motivation" render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-base">What is your primary driver as an innovator?</FormLabel>
                            <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Impact" /></FormControl><FormLabel className="font-normal">Creating a solution that has a meaningful social or environmental impact.</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Financial" /></FormControl><FormLabel className="font-normal">Building a commercially successful and profitable venture.</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Innovation" /></FormControl><FormLabel className="font-normal">Pushing the boundaries of technology and creating something entirely new.</FormLabel></FormItem>
                            </RadioGroup></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="flex justify-between">
                    <StepperPrevious variant="outline" />
                    <Button onClick={handleNext}>Next</Button>
                </div>
            </StepperContent>
        </StepperItem>
    );
}


function Step4({ form, isSubmitting }: { form: any, isSubmitting: boolean }) {
    const allValues = form.getValues();
    const weights = clusters.reduce((acc, key) => ({...acc, [key]: allValues[key]}), {});

    return (
         <StepperItem index={3}>
         <StepperTrigger>
          <CardTitle>Review and Submit</CardTitle>
          <CardDescription>Review your details before final submission.</CardDescription>
        </StepperTrigger>
         <StepperContent>
            <div className="space-y-6 py-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Idea Details</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><span className="font-medium text-muted-foreground">Title:</span> {allValues.title}</p>
                        <p><span className="font-medium text-muted-foreground">Description:</span> {allValues.description}</p>
                        <p><span className="font-medium text-muted-foreground">PPT File:</span> {allValues.pptFile?.[0]?.name || 'Not provided'}</p>
                        <p><span className="font-medium text-muted-foreground">Domain:</span> {allValues.domain === 'Other' ? allValues.otherDomain : allValues.domain}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Cluster Weightage</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4"><span className="font-medium">Preset:</span> {allValues.preset}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(weights).map(([key, value]) => (
                                <p key={key}><span className="font-medium text-muted-foreground">{key}:</span> {Math.round(value as number)}%</p>
                            ))}
                        </div>
                        <div className="mt-4 h-[350px] flex justify-center">
                            <SpiderChart data={weights} size={350} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-between">
              <StepperPrevious variant="outline" />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <BrainCircuit className="mr-2 h-4 w-4 animate-spin" />
                        Validating with AI...
                    </>
                ) : (
                    "Submit Idea (1 Credit)"
                )}
              </Button>
          </div>
        </StepperContent>
      </StepperItem>
    )
}

export default function SubmitIdeaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [animationData, setAnimationData] = React.useState(null);
  const isEditing = searchParams.has('idea');

  React.useEffect(() => {
    fetch('https://lottie.host/e2c73365-2a29-4720-a845-a436940b3b4f/QfUPpEkD0F.json')
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);

  const getInitialValues = () => {
      const ideaParam = searchParams.get('idea');
      if (ideaParam) {
          try {
              const ideaData = JSON.parse(ideaParam);
              const weights = ideaData.weights || INITIAL_CLUSTER_WEIGHTS;
              return {
                  ...defaultValues,
                  title: ideaData.title || '',
                  description: ideaData.description || '',
                  domain: ideaData.domain || '',
                  ...weights,
              };
          } catch (e) {
              console.error("Failed to parse idea data from URL", e);
              return defaultValues;
          }
      }
      return defaultValues;
  };

  const form = useForm<SubmitIdeaForm>({
    resolver: zodResolver(submitIdeaSchema),
    defaultValues: getInitialValues(),
  });
  
  React.useEffect(() => {
    const initialValues = getInitialValues();
    for (const [key, value] of Object.entries(initialValues)) {
      form.setValue(key as keyof SubmitIdeaForm, value);
    }
  }, [searchParams, form.setValue]);

  const onSubmit = async (data: SubmitIdeaForm) => {
    setIsSubmitting(true);
    toast({
      title: "Submitting Idea...",
      description: "The AI is validating your idea. This may take a moment.",
    });

    const finalDomain = data.domain === 'Other' ? data.otherDomain : data.domain;

    try {
      const response = await fetch('/api/ideas/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          domain: finalDomain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to validate idea');
      }

      const result = await response.json();
      const newIdeaId = result.idea.id;
      const validationOutcome = result.idea.report.validationOutcome;

      toast({
        title: "Validation Complete!",
        description: `Your idea "${data.title}" has been evaluated with a status of: ${validationOutcome}`,
      });
      
      router.push(`/dashboard/ideas/${newIdeaId}?role=${ROLES.INNOVATOR}`);

    } catch (error) {
      console.error("Validation failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `There was an error validating your idea: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="relative border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Submit New Idea</CardTitle>
                <CardDescription>
                Follow the steps to validate and launch your innovation journey.
                </CardDescription>
            </div>
            {isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Cancel Resubmission</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You will lose any unsaved changes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push(`/dashboard/ideas?role=${ROLES.INNOVATOR}`)}>
                      Yes, discard changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
        {isEditing && (
            <Alert variant="default" className="mt-4 border-orange-500/50 text-orange-700 dark:text-orange-300">
                <TriangleAlert className="h-4 w-4 !text-orange-600" />
                <AlertTitle>Second Wind!</AlertTitle>
                <AlertDescription>
                  You're back to refine your masterpiece. Polish it up and let's give it another go! Polishing this gem will use one of your shiny credits!
                </AlertDescription>
            </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stepper initialStep={0} orientation="vertical">
              <Step1 form={form} />
              <Step2 form={form} />
              <Step3 form={form} />
              <Step4 form={form} isSubmitting={isSubmitting} />
            </Stepper>
          </form>
        </Form>
      </CardContent>
       {isSubmitting && animationData && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-lg">
            <div className="w-48 h-48">
              <Lottie animationData={animationData} loop={true} autoplay={true} />
            </div>
             <p className="text-muted-foreground mt-2 font-medium">AI is validating your idea...</p>
             <p className="text-muted-foreground text-sm">Please wait, this may take a moment.</p>
        </div>
      )}
    </Card>
  );
}
