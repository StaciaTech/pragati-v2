"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLES, type Role } from "@/lib/constants";
import { MOCK_INNOVATOR_USER, MOCK_PRINCIPAL_USERS } from "@/lib/data/auth";
import { MOCK_TTCS } from "@/lib/data/organization";
import { useUserProfile } from "@/hooks/useUserProfile";

const getInitials = (name: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || ""
  );
};

export function UserNav() {
  const searchParams = useSearchParams();
  const { data: user } = useUserProfile();

  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;

  // let user: { name: string; email: string; role: Role | string } = {
  //   name: "Guest",
  //   email: "guest@example.com",
  //   role: "Guest",
  // };

  // switch (role) {
  //   case ROLES.INNOVATOR:
  //     user = MOCK_INNOVATOR_USER;
  //     break;
  //   case ROLES.COORDINATOR:
  //     user = MOCK_TTCS[0];
  //     break;
  //   case ROLES.PRINCIPAL:
  //     user = MOCK_PRINCIPAL_USERS[0];
  //     break;
  //   case ROLES.SUPER_ADMIN:
  //     user = {
  //       name: "Super Admin",
  //       email: "admin@pragati.ai",
  //       role: "Super Admin",
  //     };
  //     break;
  // }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://avatar.vercel.sh/${user?.name}.png`}
              alt={`@${user?.name}`}
            />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/profile?role=${role}`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href="/">
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
