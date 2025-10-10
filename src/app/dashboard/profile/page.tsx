"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ROLES, type Role } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, EyeOff, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: user, isLoading, refetch } = useUserProfile();

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] =
    React.useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    React.useState(false);
  const [isRequestInnovatorModalOpen, setIsRequestInnovatorModalOpen] =
    React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const role =
    (searchParams.get("role") as Role) || user?.role || ROLES.INNOVATOR;

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || ""
    );
  };

  // ✅ UPDATE PROFILE
  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.uid}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved.",
        });
        setIsEditProfileModalOpen(false);
        refetch(); // Refresh user data
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error?.response?.data?.error || "Failed to update profile",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // ✅ CHANGE PASSWORD - WITH PROPER USER ID
  const handleSavePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      // 1-step decode (safe)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.uid || payload.sub;

      const fd = new FormData(e.currentTarget);
      const current = fd.get("currentPassword") as string;
      const newPw = fd.get("newPassword") as string;
      const confirm = fd.get("confirmPassword") as string;

      if (newPw !== confirm) {
        toast({ variant: "destructive", title: "Passwords don't match" });
        return;
      }

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/password`,
        { currentPassword: current, newPassword: newPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Password changed", description: data.message });
      setIsChangePasswordModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Change failed";
      toast({ variant: "destructive", title: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ✅ HANDLE AVATAR SELECTION
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ UPLOAD AVATAR
  const handleSaveAvatar = async () => {
    if (!selectedFile) return;

    setIsUploadingAvatar(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.uid}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.avatarUrl) {
        toast({
          title: "Avatar Updated",
          description: "Your new profile picture has been saved.",
        });
        setAvatarPreview(null);
        setSelectedFile(null);
        refetch(); // Refresh user data
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error?.response?.data?.error || "Failed to upload avatar",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ✅ REQUEST INNOVATOR ACCESS
  const handleRequestInnovator = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData(event.currentTarget);
      const title = formData.get("idea-title") as string;
      const concept = formData.get("idea-concept") as string;

      // Submit idea concept as innovator request
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/request-innovator`,
        {
          title,
          concept,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message) {
        toast({
          title: "Request Sent!",
          description:
            "Your request to become an innovator has been sent to your TTC Coordinator for approval.",
        });
        setIsRequestInnovatorModalOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error?.response?.data?.error || "Failed to send request",
      });
    }
  };

  const displayRole = () => {
    switch (role) {
      case "innovator":
        return "Innovator";
      case "college_admin":
        return "College Principal Admin";
      case "ttc_coordinator":
        return "TTC Coordinator";
      case "super_admin":
        return "Super Admin";
      case "mentor":
        return "Mentor";
      case "team_member":
        return "Team Member";
      case "internal_mentor":
        return "Internal Mentor";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="w-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg border-0 relative overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-br from-[#FF00CC] to-[#333399] opacity-30 blur-3xl filter" />
          <div className="absolute -bottom-1/4 -right-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-tl from-[#F472B6] to-[#06B6D4] opacity-20 blur-3xl filter" />
          <div className="relative z-10 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary-foreground/50">
                  <AvatarImage
                    src={
                      avatarPreview ||
                      user?.avatarUrl ||
                      `https://avatar.vercel.sh/${user?.name}.png`
                    }
                    alt={user?.name}
                  />
                  <AvatarFallback className="text-3xl">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  title="Change profile picture"
                >
                  <Pencil className="h-4 w-4" />
                </div>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                <p className="text-primary-foreground/80">{displayRole()}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal details.</CardDescription>
                </div>
                <div className="flex gap-2">
                  {avatarPreview && (
                    <Button
                      onClick={handleSaveAvatar}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? "Uploading..." : "Save Photo"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditProfileModalOpen(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Password</Label>
                    <p className="font-mono tracking-wider">************</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                  >
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
            {(role === ROLES.TEAM_MEMBER || role === ROLES.INTERNAL_MENTOR) && (
              <Card>
                <CardHeader>
                  <CardTitle>Become an Innovator</CardTitle>
                  <CardDescription>
                    Request to upgrade your account to an Innovator account to
                    submit your own ideas.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => setIsRequestInnovatorModalOpen(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    Request Innovator Access
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            {role === ROLES.INNOVATOR && user?.creditQuota !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle>Credits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">
                      {user?.creditQuota}
                    </p>
                    <p className="text-muted-foreground">Credits Available</p>
                  </div>
                  <div>
                    <Label>Usage (This Month)</Label>
                    <Progress
                      value={user?.noOfIdeas ? (user.noOfIdeas / 15) * 100 : 0}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {user?.noOfIdeas || 0} / 15 ideas submitted
                    </p>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/request-credits?role=${role}`}>
                      Request More Credits
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Dialog
        open={isEditProfileModalOpen}
        onOpenChange={setIsEditProfileModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  readOnly
                  className="cursor-not-allowed bg-muted/50"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CHANGE PASSWORD MODAL */}
      <Dialog
        open={isChangePasswordModalOpen}
        onOpenChange={setIsChangePasswordModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current and new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePassword}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Saving..." : "Save Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REQUEST INNOVATOR MODAL */}
      <Dialog
        open={isRequestInnovatorModalOpen}
        onOpenChange={setIsRequestInnovatorModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Innovator Access</DialogTitle>
            <DialogDescription>
              Submit your first idea concept. Your TTC Coordinator will review
              it and may grant you full innovator access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestInnovator}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="idea-title">Idea Title</Label>
                <Input
                  id="idea-title"
                  name="idea-title"
                  placeholder="e.g., AI-Powered Personal Tutor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idea-concept">Short Description</Label>
                <Textarea
                  id="idea-concept"
                  name="idea-concept"
                  placeholder="Briefly describe the problem you are solving and your proposed solution."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Send Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
