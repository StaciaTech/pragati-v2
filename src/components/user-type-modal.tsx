
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MOCK_COLLEGES, MOCK_TTCS } from '@/lib/data/organization'; // Assuming orgs are here for now
import { Building, Landmark, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';


interface UserTypeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function UserTypeModal({ isOpen, onOpenChange }: UserTypeModalProps) {
  const router = useRouter();
  const [userType, setUserType] = React.useState<string>('individual');
  const [step, setStep] = React.useState<'select_type' | 'select_org'>('select_type');
  const [selectedOrg, setSelectedOrg] = React.useState<string>('');

  const orgs = MOCK_COLLEGES; // Could be a different list based on userType

  const handleContinue = () => {
    if (userType === 'individual') {
      router.push('/login');
      onOpenChange(false);
    } else {
      setStep('select_org');
    }
  };
  
  const handleOrgSelect = (orgName: string) => {
    setSelectedOrg(orgName);
    router.push(`/login?org=${encodeURIComponent(orgName)}`);
    onOpenChange(false);
  }

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('select_type');
        setUserType('individual');
        setSelectedOrg('');
      }, 200);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'select_type' ? 'Login Selection' : `Select Your ${userType === 'institutional' ? 'Institution' : 'Organization'}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'select_type'
              ? 'First, tell us what type of user you are.'
              : `Find your organization from the list below to proceed.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'select_type' && (
          <div className="py-4">
            <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-1 gap-4">
                <Label htmlFor="institutional" className={cn("p-4 border rounded-md cursor-pointer flex items-start gap-4 transition-colors", userType === 'institutional' && "border-primary ring-2 ring-primary")}>
                    <RadioGroupItem value="institutional" id="institutional" className="mt-1" />
                    <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Institutional User</div>
                        <p className="text-sm text-muted-foreground">For users affiliated with a college or university.</p>
                    </div>
                </Label>
                 <Label htmlFor="organisation" className={cn("p-4 border rounded-md cursor-pointer flex items-start gap-4 transition-colors", userType === 'organisation' && "border-primary ring-2 ring-primary")}>
                    <RadioGroupItem value="organisation" id="organisation" className="mt-1" />
                     <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Organisation User</div>
                        <p className="text-sm text-muted-foreground">For corporate or government entity users.</p>
                    </div>
                </Label>
                 <Label htmlFor="individual" className={cn("p-4 border rounded-md cursor-pointer flex items-start gap-4 transition-colors", userType === 'individual' && "border-primary ring-2 ring-primary")}>
                    <RadioGroupItem value="individual" id="individual" className="mt-1" />
                     <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Individual User</div>
                        <p className="text-sm text-muted-foreground">For independent innovators, mentors, or team members.</p>
                    </div>
                </Label>
            </RadioGroup>
            <Button onClick={handleContinue} className="w-full mt-6">Continue</Button>
          </div>
        )}

        {step === 'select_org' && (
          <div className="py-4">
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Search for your organization..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {orgs.map((org) => (
                    <CommandItem
                      key={org.id}
                      value={org.name}
                      onSelect={(currentValue) => {
                        const orgName = orgs.find(o => o.name.toLowerCase() === currentValue)?.name;
                        if(orgName) handleOrgSelect(orgName);
                      }}
                    >
                      {org.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
