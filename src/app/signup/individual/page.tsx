
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function IndividualSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    toast({
      title: 'Account Created!',
      description: 'Your innovator account has been successfully created. Please log in.',
    });
    router.push('/login/credentials?userType=Innovators');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
       <Button asChild variant="ghost" className="absolute top-4 left-4">
        <Link href="/signup">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Signup Options
        </Link>
       </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Individual Innovator Signup</CardTitle>
          <CardDescription>Create your account to start validating ideas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Ada" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Lovelace" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="ada.lovelace@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel>
                    <div className="flex gap-2">
                        <FormControl><Input type="tel" placeholder="+91" {...field} /></FormControl>
                        <Button type="button" variant="outline" onClick={() => toast({title: "OTP Sent!", description: "A one-time password has been sent to your phone."})}>Send OTP</Button>
                    </div>
                <FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="otp" render={({ field }) => (
                <FormItem><FormLabel>Enter OTP</FormLabel><FormControl><Input placeholder="_ _ _ _ _ _" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
              )}/>
              <Button type="submit" className="w-full !mt-6">
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
