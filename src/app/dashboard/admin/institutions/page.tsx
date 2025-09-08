
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_COLLEGES } from '@/lib/data/organization';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function InstitutionManagementPage() {
    const { toast } = useToast();
    const [colleges, setColleges] = React.useState(MOCK_COLLEGES);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalType, setModalType] = React.useState<'add' | 'edit'>('add');
    const [currentCollege, setCurrentCollege] = React.useState<(typeof MOCK_COLLEGES)[0] | null>(null);

    const handleOpenModal = (type: 'add' | 'edit', college?: typeof currentCollege) => {
        setModalType(type);
        setCurrentCollege(college || null);
        setIsModalOpen(true);
    };
    
    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        toast({
            title: `Institution ${modalType === 'add' ? 'Added' : 'Updated'}`,
            description: `${name} has been successfully saved.`,
        });
        setIsModalOpen(false);
    }
    
    const handleToggleStatus = (id: string) => {
        setColleges(prev => prev.map(college => college.id === id ? {...college, status: college.status === 'Active' ? 'Inactive' : 'Active'} as any : college));
        toast({ title: "Status Updated", description: "College status has been toggled."});
    }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Institution Management</CardTitle>
                <CardDescription>Add, edit, and manage colleges and their settings.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal('add')}>Add New College</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Principal Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell>{college.id}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/admin/institutions/${college.id}?role=Super Admin`} className="hover:underline text-primary">
                          {college.name}
                      </Link>
                    </TableCell>
                    <TableCell>{college.principalEmail}</TableCell>
                    <TableCell>
                      <Badge variant={college.status === 'Active' ? 'default' : 'destructive'}>
                          {college.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{college.creditsAvailable}</TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                       <Button variant="outline" size="sm" asChild>
                         <Link href={`/dashboard/admin/institutions/${college.id}/legal`}>
                           <FileText className="mr-2 h-4 w-4"/> Legal
                         </Link>
                       </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenModal('edit', college)}>Edit</Button>
                       <Button 
                          variant={college.status === 'Active' ? 'destructive' : 'default'} 
                          size="sm" 
                          onClick={() => handleToggleStatus(college.id)}
                      >
                        {college.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>{modalType === 'add' ? 'Add New College' : 'Edit College'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input id="name" name="name" defaultValue={currentCollege?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalEmail">Principal Email</Label>
                  <Input id="principalEmail" name="principalEmail" type="email" defaultValue={currentCollege?.principalEmail} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ttcLimit">TTC Limit</Label>
                      <Input id="ttcLimit" name="ttcLimit" type="number" defaultValue={currentCollege?.ttcLimit} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditsAvailable">Credits Available</Label>
                      <Input id="creditsAvailable" name="creditsAvailable" type="number" defaultValue={currentCollege?.creditsAvailable} required />
                    </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
