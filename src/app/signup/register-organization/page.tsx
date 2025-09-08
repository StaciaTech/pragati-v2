
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { ArrowLeft, FileSignature, Landmark, Building, User as UserIcon, Eye, EyeOff, Loader2, CheckCircle, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Stepper, StepperContent, StepperItem, StepperTrigger, useStepper } from '@/components/ui/stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_PLANS } from '@/lib/data/platform';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  adminEmail: z.string().email(),
  adminPosition: z.string().min(2, 'Position is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
});


const step2Schema = z.object({
  orgName: z.string().min(3),
  gstin: z.string().length(15, "GSTIN must be 15 characters long.").optional().or(z.literal('')),
  orgType: z.enum(['Institution', 'Organization/GCC']),
  orgEmail: z.string().email(),
  orgPhone: z.string().min(10),
});

const registerOrgSchema = step1Schema
    .merge(step2Schema)
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });


type RegisterOrgFormValues = z.infer<typeof registerOrgSchema>;

const STEPS = [
  { label: "Your Details", schema: step1Schema },
  { label: "Organization Details", schema: step2Schema },
  { label: "Confirmation" },
];

function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { activeStep, prev, next } = useStepper();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isVerifyingGst, setIsVerifyingGst] = React.useState(false);
  const [isGstVerified, setIsGstVerified] = React.useState(false);
  
  const form = useForm<RegisterOrgFormValues>({
    resolver: zodResolver(registerOrgSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      adminEmail: '',
      adminPosition: '',
      phone: '',
      otp: '',
      password: '',
      confirmPassword: '',
      orgName: '',
      orgType: 'Institution',
      gstin: '',
      orgEmail: '',
      orgPhone: '',
    },
  });
  
  const handleGstVerify = () => {
    const gstin = form.getValues('gstin');
    if (!gstin || gstin.length !== 15) {
        form.setError('gstin', { type: 'manual', message: 'Please enter a valid 15-character GSTIN.' });
        return;
    }
    setIsVerifyingGst(true);
    setTimeout(() => {
        // Mock success
        const mockOrgName = 'Tata Institute of Fundamental Research';
        form.setValue('orgName', mockOrgName, { shouldValidate: true });
        form.clearErrors('gstin');
        setIsGstVerified(true);
        setIsVerifyingGst(false);
        toast({ title: 'GSTIN Verified!', description: `Organization name set to "${mockOrgName}".` });
    }, 1500);
  };

  const onSubmit = (data: RegisterOrgFormValues) => {
    toast({
      title: 'Account Created!',
      description: 'Your organization administrator account has been created. Redirecting to your portal...',
    });
    // In a real app, this would redirect to a special onboarding portal
    router.push('/login');
  };

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof RegisterOrgFormValues)[] = [];
    switch (activeStep) {
        case 0: fieldsToValidate = ['firstName', 'lastName', 'adminEmail', 'adminPosition', 'phone', 'otp', 'password', 'confirmPassword']; break;
        case 1: fieldsToValidate = ['orgName', 'orgType', 'orgEmail', 'orgPhone', 'gstin']; break;
    }
    const isValid = await form.trigger(fieldsToValidate);
    if(isValid) next();
  };
  
  const allFormData = form.getValues();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <StepperItem index={0}>
          <StepperContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 my-6">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Homi" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Bhabha" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="adminEmail" render={({ field }) => (
                <FormItem><FormLabel>Your Official Email</FormLabel><FormControl><Input type="email" placeholder="homi.b@tifr.res.in" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="adminPosition" render={({ field }) => (
                <FormItem><FormLabel>Your Position</FormLabel><FormControl><Input placeholder="e.g., Director, Principal" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Phone Number</FormLabel>
                    <div className="flex gap-2">
                        <FormControl><Input type="tel" placeholder="+91" {...field} /></FormControl>
                        <Button type="button" variant="outline" onClick={() => toast({title: "OTP Sent!", description: "A one-time password has been sent to your phone."})}>Send OTP</Button>
                    </div>
                <FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="otp" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Enter OTP</FormLabel><FormControl><Input placeholder="_ _ _ _ _ _" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
          </StepperContent>
        </StepperItem>
        <StepperItem index={1}>
          <StepperContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 my-6">
                <FormField control={form.control} name="gstin" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>GSTIN</FormLabel>
                        <div className="flex gap-2">
                            <FormControl>
                                <Input placeholder="Enter 15-digit GSTIN" {...field} />
                            </FormControl>
                            <Button type="button" variant="outline" onClick={handleGstVerify} disabled={isVerifyingGst}>
                                {isVerifyingGst ? <Loader2 className="h-4 w-4 animate-spin" /> : isGstVerified ? <CheckCircle className="h-4 w-4 text-green-500" /> : 'Verify'}
                            </Button>
                        </div>
                        <FormDescription>If available, we can auto-fill some details for you.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
              <FormField control={form.control} name="orgName" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Organization / Institution Name</FormLabel><FormControl><Input placeholder="e.g., Tata Institute of Fundamental Research" {...field} disabled={isGstVerified} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="orgType" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Institution">Institution (College, University)</SelectItem><SelectItem value="Organization/GCC">Organization / GCC</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="orgEmail" render={({ field }) => (
                <FormItem><FormLabel>Official Contact Email</FormLabel><FormControl><Input type="email" placeholder="contact@tifr.res.in" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="orgPhone" render={({ field }) => (
                <FormItem><FormLabel>Official Contact Phone</FormLabel><FormControl><Input placeholder="+91 22 2278 2000" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
          </StepperContent>
        </StepperItem>
        
        <StepperItem index={2}>
            <StepperContent>
                <div className="space-y-6 my-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold">Initial Registration Complete!</h3>
                    <p className="text-muted-foreground">
                        Your admin account for <strong>{allFormData.orgName}</strong> has been created.
                        Click below to proceed to your secure portal to complete the onboarding process, including plan selection, legal agreements, and payment.
                    </p>
                </div>
            </StepperContent>
        </StepperItem>

        <div className="flex justify-between items-center pt-4">
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                    if (activeStep === 0) {
                        router.push('/signup');
                    } else {
                        prev();
                    }
                }}
            >
                Back
            </Button>
            {activeStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNextStep}>
                    Next
                </Button>
            ) : (
                <Button type="submit">
                    Proceed to Onboarding Portal
                </Button>
            )}
        </div>
      </form>
    </Form>
  );
}


export default function RegisterOrganizationPage() {
    
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Button asChild variant="ghost" className="absolute top-4 left-4">
            <Link href="/signup">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Signup Options
            </Link>
        </Button>
        <Card className="w-full max-w-4xl shadow-2xl">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <Logo className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Register a New Organization</CardTitle>
                <CardDescription>Onboard your institution or organization to PragatiAI.</CardDescription>
            </CardHeader>
            <CardContent>
                <Stepper initialStep={0} orientation="horizontal" className="p-4">
                    <StepperItem index={0}>
                      <StepperTrigger>{STEPS[0].label}</StepperTrigger>
                    </StepperItem>
                    <StepperItem index={1}>
                      <StepperTrigger>{STEPS[1].label}</StepperTrigger>
                    </StepperItem>
                     <StepperItem index={2}>
                      <StepperTrigger>{STEPS[2].label}</StepperTrigger>
                    </StepperItem>

                    <div className="mt-8">
                       <RegistrationForm />
                    </div>
                </Stepper>
            </CardContent>
        </Card>
    </div>
  );
}
