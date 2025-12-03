"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Search,
  Lightbulb,
  Users,
  Briefcase,
  Settings,
  FileText,
  Building2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import type { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface SearchResults {
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  ideas: Array<{
    _id: string;
    title: string;
    domain: string;
    innovatorName?: string;
  }>;
  colleges: Array<{
    _id: string;
    collegeName: string;
    email: string;
  }>;
  mentors: Array<{
    _id: string;
    name: string;
    organization?: string;
  }>;
}

export function UniversalSearch({ role }: { role: Role }) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const router = useRouter();
  const [os, setOs] = React.useState<"mac" | "windows" | null>(null);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    // Set OS for shortcut display
    if (typeof window !== "undefined") {
      setOs(
        navigator.userAgent.toLowerCase().includes("mac") ? "mac" : "windows"
      );
    }

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // ✅ Fetch search results from API
  const { data: searchResp, isLoading } = useQuery({
    queryKey: ["universal-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;

      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/search/global?q=${encodeURIComponent(debouncedQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const results: SearchResults = searchResp?.data || {
    users: [],
    ideas: [],
    colleges: [],
    mentors: [],
  };

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    setSearchQuery(""); // Clear search on select
    command();
  }, []);

  const getGroupIcon = (groupName: string) => {
    switch (groupName) {
      case "Ideas":
        return <Lightbulb className="mr-2 h-4 w-4" />;
      case "Users":
        return <Users className="mr-2 h-4 w-4" />;
      case "Innovators":
        return <Users className="mr-2 h-4 w-4" />;
      case "TTCs":
        return <Briefcase className="mr-2 h-4 w-4" />;
      case "Institutions":
        return <Building2 className="mr-2 h-4 w-4" />;
      case "Mentors":
        return <GraduationCap className="mr-2 h-4 w-4" />;
      case "Plans":
        return <Settings className="mr-2 h-4 w-4" />;
      default:
        return <FileText className="mr-2 h-4 w-4" />;
    }
  };

  const getRoleBasedHref = (type: string, id: string) => {
    // Generate appropriate URLs based on item type and user role
    switch (type) {
      case "idea":
        return `/dashboard/ideas/${id}?role=${role}`;
      case "user":
        return `/dashboard/users/${id}?role=${role}`;
      case "college":
        return `/dashboard/admin/institutions/${id}?role=${role}`;
      case "mentor":
        return `/dashboard/mentors/${id}?role=${role}`;
      default:
        return "#";
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "relative h-9 w-9 p-0 text-muted-foreground hover:text-foreground sm:h-10 sm:w-64 sm:px-3 sm:justify-start"
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline-flex sm:ml-2">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          {os === "mac" ? (
            <span className="text-xs">⌘</span>
          ) : (
            <span className="text-xs">Ctrl</span>
          )}
          K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={`Search users, ideas, colleges, mentors...`}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}

          {/* Empty State - No Query */}
          {!isLoading && searchQuery.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search across the platform...
            </div>
          )}

          {/* Empty State - Query Too Short */}
          {!isLoading && searchQuery.length > 0 && searchQuery.length < 2 && (
            <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
          )}

          {/* Empty State - No Results */}
          {!isLoading &&
            debouncedQuery.length >= 2 &&
            results.users.length === 0 &&
            results.ideas.length === 0 &&
            results.colleges.length === 0 &&
            results.mentors.length === 0 && (
              <CommandEmpty>
                No results found for "{debouncedQuery}"
              </CommandEmpty>
            )}

          {/* Ideas Results */}
          {results.ideas.length > 0 && (
            <CommandGroup heading="Ideas">
              {results.ideas.map((idea) => (
                <CommandItem
                  key={idea._id}
                  value={idea.title}
                  onSelect={() => {
                    runCommand(() =>
                      router.push(getRoleBasedHref("idea", idea._id))
                    );
                  }}
                >
                  {getGroupIcon("Ideas")}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{idea.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {idea.domain}
                      {idea.innovatorName && ` • by ${idea.innovatorName}`}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Users Results */}
          {results.users.length > 0 && (
            <CommandGroup heading="Users">
              {results.users.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user.name}
                  onSelect={() => {
                    runCommand(() =>
                      router.push(getRoleBasedHref("user", user._id))
                    );
                  }}
                >
                  {getGroupIcon("Users")}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email} • {user.role.replace("_", " ")}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Colleges/Institutions Results */}
          {results.colleges.length > 0 && (
            <CommandGroup heading="Institutions">
              {results.colleges.map((college) => (
                <CommandItem
                  key={college._id}
                  value={college.collegeName}
                  onSelect={() => {
                    runCommand(() =>
                      router.push(getRoleBasedHref("college", college._id))
                    );
                  }}
                >
                  {getGroupIcon("Institutions")}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{college.collegeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {college.email}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Mentors Results */}
          {results.mentors.length > 0 && (
            <CommandGroup heading="Mentors">
              {results.mentors.map((mentor) => (
                <CommandItem
                  key={mentor._id}
                  value={mentor.name}
                  onSelect={() => {
                    runCommand(() =>
                      router.push(getRoleBasedHref("mentor", mentor._id))
                    );
                  }}
                >
                  {getGroupIcon("Mentors")}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{mentor.name}</p>
                    {mentor.organization && (
                      <p className="text-xs text-muted-foreground">
                        {mentor.organization}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
