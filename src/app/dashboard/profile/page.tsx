"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  MOCK_INNOVATOR_USER,
  MOCK_PRINCIPAL_USERS,
  MOCK_TEAM_MEMBER_USERS,
  MOCK_INTERNAL_MENTOR_USERS,
} from "@/lib/data/auth";
import { MOCK_TTCS, MOCK_COLLEGES } from "@/lib/data/organization";
import { ROLES, type Role } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, EyeOff, Upload, Send } from "lucide-react";
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
  const { toast } = useToast();
  const { data: user } = useUserProfile();

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;

  // let user: any = {};
  let college: any = {};

  // Mock fetching user data based on role
  // switch (role) {
  //   case ROLES.INNOVATOR:
  //     user = MOCK_INNOVATOR_USER;
  //     college = MOCK_COLLEGES.find((c) => c.name === user.college);
  //     break;
  //   case ROLES.COORDINATOR:
  //     user = MOCK_TTCS[0];
  //     college = MOCK_COLLEGES.find((c) => c.id === user.collegeId);
  //     break;
  //   case ROLES.PRINCIPAL:
  //     user = MOCK_PRINCIPAL_USERS[0];
  //     college = MOCK_COLLEGES.find((c) => c.id === user.collegeId);
  //     break;
  //   case ROLES.TEAM_MEMBER:
  //     user = MOCK_TEAM_MEMBER_USERS[0];
  //     break;
  //   case ROLES.INTERNAL_MENTOR:
  //     user = MOCK_INTERNAL_MENTOR_USERS[0];
  //     break;
  //   case ROLES.SUPER_ADMIN:
  //     user = {
  //       name: "Super Admin",
  //       email: "admin@pragati.ai",
  //       role: "Super Admin",
  //     };
  //     break;
  //   default:
  //     user = { name: "Guest", email: "guest@pragati.ai", role: "Guest" };
  // }

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || ""
    );
  };

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    setIsEditProfileModalOpen(false);
  };

  const handleSavePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    setIsChangePasswordModalOpen(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    toast({
      title: "Avatar Updated",
      description: "Your new profile picture has been saved.",
    });
    setAvatarPreview(null);
  };

  const handleRequestInnovator = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Request Sent!",
      description:
        "Your request to become an innovator has been sent to your TTC Coordinator for approval.",
    });
    setIsRequestInnovatorModalOpen(false);
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
                  accept="image/png, image/jpeg, image/gif"
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
                    <Button onClick={handleSaveAvatar}>Save Photo</Button>
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
                    <Progress value={33} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      5 / 15 credits used
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
            {role === ROLES.COORDINATOR &&
              college?.creditsAvailable !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>College Credits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">
                        {college.creditsAvailable}
                      </p>
                      <p className="text-muted-foreground">
                        Credits Available for College
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      You assign credits to innovators from this pool.
                    </p>
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/coordinator/logs?role=${role}`}>
                        Request Credits from Principal
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            {role === ROLES.PRINCIPAL &&
              college?.creditsAvailable !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Plan &amp; Credits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Current Plan</Label>
                      <p className="font-medium">
                        {MOCK_COLLEGES[0].currentPlanId
                          .replace("PLAN00", "Plan ")
                          .replace("-M", " Monthly")}
                      </p>
                    </div>
                    <div>
                      <Label>Credits Remaining</Label>
                      <p className="text-2xl font-bold text-primary">
                        {college.creditsAvailable}
                      </p>
                    </div>
                    <Button className="w-full" asChild>
                      <Link
                        href={`/dashboard/principal/plan-payment?role=${role}`}
                      >
                        Manage Plan &amp; Payment
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>

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
                <Input id="name" name="name" defaultValue={user?.name} />
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
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
                    <span className="sr-only">
                      {showNewPassword ? "Hide password" : "Show password"}
                    </span>
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
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
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
              <Button type="submit">Save Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
