
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { ArrowLeft, Check, ChevronsUpDown, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { MOCK_COLLEGES } from '@/lib/data/organization';
import { cn } from '@/lib/utils';


const joinSchema = z.object({
  organization: z.string({ required_error: 'Please select an organization.' }),
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

type JoinFormValues = z.infer<typeof joinSchema>;

export default function JoinOrganizationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  const orgs = MOCK_COLLEGES;

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      organization: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: JoinFormValues) => {
    toast({
      title: 'Request Sent!',
      description: `Your request to join ${data.organization} has been sent to the administrator for approval.`,
    });
    router.push('/login');
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
          <CardTitle className="text-2xl">Join an Existing Organization</CardTitle>
          <CardDescription>Find your organization and request to join.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Organization / Institution</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value
                                ? orgs.find((org) => org.name === field.value)?.name
                                : "Select organization..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl>
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
                                                form.setValue("organization", org.name)
                                                setPopoverOpen(false)
                                            }}
                                        >
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === org.name ? "opacity-100" : "opacity-0"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Marie" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Curie" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Your Email Address</FormLabel><FormControl><Input type="email" placeholder="marie.curie@example.com" {...field} /></FormControl><FormMessage /></FormItem>
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
                  <FormItem><FormLabel>Create a Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
                )}
              />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
              )}/>
              <Button type="submit" className="w-full !mt-6">
                Request to Join
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
