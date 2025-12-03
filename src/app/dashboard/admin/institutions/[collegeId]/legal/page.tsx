"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface LegalDocuments {
  collegeId: string;
  collegeName: string;
  termsOfService: string;
  privacyPolicy: string;
  version: string;
  updatedAt?: string;
}

export default function InstitutionLegalDocsPage() {
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const collegeId = params.collegeId as string;

  const [terms, setTerms] = React.useState("");
  const [privacy, setPrivacy] = React.useState("");

  // ✅ Fetch Legal Documents
  const {
    data: legalData,
    isLoading,
    error,
  } = useQuery<LegalDocuments>({
    queryKey: ["college-legal", collegeId],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/admin/colleges/${collegeId}/legal`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
    enabled: !!collegeId,
  });

  // ✅ Update state when data loads
  React.useEffect(() => {
    if (legalData) {
      setTerms(legalData.termsOfService);
      setPrivacy(legalData.privacyPolicy);
    }
  }, [legalData]);

  // ✅ Update Legal Documents Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: {
      termsOfService: string;
      privacyPolicy: string;
    }) => {
      const token = getToken();
      const { data } = await axios.put(
        `${apiUrl}/api/admin/colleges/${collegeId}/legal`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["college-legal", collegeId] });
      toast({
        title: "Legal Documents Saved",
        description: `The policies for ${legalData?.collegeName} have been updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description:
          error.response?.data?.error || "Failed to update legal documents.",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      termsOfService: terms,
      privacyPolicy: privacy,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading legal documents...</span>
      </div>
    );
  }

  if (error || !legalData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load legal documents. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/admin/institutions`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Institutions
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>
            Manage Legal Documents for {legalData.collegeName}
          </CardTitle>
          <CardDescription>
            Edit the Terms of Service and Privacy Policy specific to this
            institution. These will override the platform defaults for users
            from this college.
          </CardDescription>
          {legalData.updatedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(legalData.updatedAt).toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="terms">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            </TabsList>
            <TabsContent value="terms" className="mt-4">
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="min-h-[50vh] font-mono text-sm"
                placeholder="Enter Terms of Service content here..."
              />
            </TabsContent>
            <TabsContent value="privacy" className="mt-4">
              <Textarea
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="min-h-[50vh] font-mono text-sm"
                placeholder="Enter Privacy Policy content here..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
