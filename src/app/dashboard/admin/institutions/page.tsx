"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useColleges } from "@/hooks/useColleges";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function InstitutionManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ----------  REAL COLLEGES  ---------- */
  const { data: colleges = [], isLoading } = useColleges();

  /* ----------  ADD / EDIT MUTATION  ---------- */
  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      principalEmail: string;
      ttcLimit: number;
      creditQuota: number;
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");

      if (!payload.id) {
        // CREATE
        return axios.post(
          `${apiUrl}/api/admin/create-principal`,
          {
            collegeName: payload.name,
            email: payload.principalEmail,
            ttcCoordinatorLimit: payload.ttcLimit,
            creditQuota: payload.creditQuota,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // EDIT (generic user update)
      return axios.put(
        `${apiUrl}/api/users/${payload.id}`,
        {
          collegeName: payload.name,
          email: payload.principalEmail,
          ttcCoordinatorLimit: payload.ttcLimit,
          creditQuota: payload.creditQuota,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: (_, vars) => {
      toast({
        title: `College ${vars.id ? "updated" : "created"}`,
        description: vars.name + " has been saved.",
      });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["all-colleges"] });
    },
    onError: (err: any) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Unexpected error",
      }),
  });

  /* ----------  STATUS TOGGLE  ---------- */
  const toggleMutation = useMutation({
    mutationFn: async (id: string) =>
      axios.put(
        `${apiUrl}/api/users/${id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      ),
    onSuccess: () => {
      toast({ title: "Status toggled" });
      queryClient.invalidateQueries({ queryKey: ["all-colleges"] });
    },
  });

  /* ----------  LOCAL MODAL STATE  ---------- */
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"add" | "edit">("add");
  const [currentCollege, setCurrentCollege] = React.useState<any>(null);

  /* ----------  HANDLERS  ---------- */
  const handleOpenModal = (type: "add" | "edit", college?: any) => {
    setModalType(type);
    setCurrentCollege(college || null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMutation.mutate({
      id: currentCollege?._id, // undefined ⇒ add
      name: fd.get("name") as string,
      principalEmail: fd.get("principalEmail") as string,
      ttcLimit: Number(fd.get("ttcLimit")),
      creditQuota: Number(fd.get("creditsAvailable")),
    });
  };

  const handleToggleStatus = (id: string) => toggleMutation.mutate(id);

  /* ----------  RENDER  ---------- */
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Institution Management</CardTitle>
            <CardDescription>
              Add, edit, and manage colleges and their settings.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenModal("add")}>
            Add New College
          </Button>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : (
                  colleges.map((college: any) => (
                    <TableRow key={college._id}>
                      <TableCell>{college._id}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/admin/institutions/${college._id}?role=Super Admin`}
                          className="hover:underline text-primary"
                        >
                          {college.collegeName}
                        </Link>
                      </TableCell>
                      <TableCell>{college.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={college.isActive ? "default" : "destructive"}
                        >
                          {college.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{college.creditQuota}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/admin/institutions/${college._id}/legal`}
                          >
                            <FileText className="mr-2 h-4 w-4" /> Legal
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal("edit", college)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={college.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleStatus(college._id)}
                        >
                          {college.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" ? "Add New College" : "Edit College"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentCollege?.collegeName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principalEmail">Principal Email</Label>
                <Input
                  id="principalEmail"
                  name="principalEmail"
                  type="email"
                  defaultValue={currentCollege?.email}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ttcLimit">TTC Limit</Label>
                  <Input
                    id="ttcLimit"
                    name="ttcLimit"
                    type="number"
                    defaultValue={currentCollege?.ttcCoordinatorLimit}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditsAvailable">Credits Available</Label>
                  <Input
                    id="creditsAvailable"
                    name="creditsAvailable"
                    type="number"
                    defaultValue={currentCollege?.creditQuota}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
