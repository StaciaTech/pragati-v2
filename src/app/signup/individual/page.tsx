"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/icons";
import { ArrowLeft, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MOCK_DOMAINS_WITH_SUBDOMAINS } from "@/lib/data/platform";
import { Suspense } from "react";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ FIX: Base schema WITHOUT refine (so we can extend it)
const baseSchemaFields = {
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
};

// ✅ Mentor schema with extend
const mentorSchema = z
  .object({
    ...baseSchemaFields,
    expertiseCategory: z
      .string()
      .min(1, { message: "Please select an expertise category." }),
    expertiseSubCategory: z.string().optional(),
    bio: z
      .any()
      .refine((files) => files?.length > 0, "Bio/CV file is required.")
      .refine((files) => {
        if (!files?.[0]) return false;
        const fileSize = files[0].size;
        return fileSize <= 10 * 1024 * 1024; // 10MB
      }, "File size must be less than 10MB")
      .refine((files) => {
        if (!files?.[0]) return false;
        const fileType = files[0].type;
        return [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(fileType);
      }, "Only .pdf, .doc, .docx files are allowed"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ✅ Innovator schema
const innovatorSchema = z
  .object(baseSchemaFields)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ✅ Separate component that uses useSearchParams
function SignupForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMentorSignup = searchParams.get("role") === "mentor";

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isOtpSending, setIsOtpSending] = React.useState(false);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otpTimer, setOtpTimer] = React.useState(0);

  const signupSchema = isMentorSignup ? mentorSchema : innovatorSchema;
  type SignupFormValues = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      otp: "",
      password: "",
      confirmPassword: "",
      ...(isMentorSignup && {
        expertiseCategory: "",
        expertiseSubCategory: "",
        bio: undefined,
      }),
    },
  });

  const expertiseCategory = form.watch("expertiseCategory" as any);
  const email = form.watch("email");

  const selectedDomainData = MOCK_DOMAINS_WITH_SUBDOMAINS.find(
    (d) => d.name === expertiseCategory
  );

  // OTP Timer countdown
  React.useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  React.useEffect(() => {
    if (isMentorSignup) {
      form.setValue("expertiseSubCategory" as any, "");
    }
  }, [expertiseCategory, form, isMentorSignup]);

  // ✅ Send OTP to Email
  const handleSendOtp = async () => {
    // Validate email first
    const emailError = form.getFieldState("email").error;
    if (!email || emailError) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsOtpSending(true);

    try {
      const response = await axios.post(`${apiUrl}/api/auth/otp/send`, {
        email: email,
      });

      if (response.data.success) {
        setIsOtpSent(true);
        setOtpTimer(600); // 10 minutes in seconds
        toast({
          title: "OTP Sent!",
          description: `A 6-digit verification code has been sent to ${email}`,
        });
      }
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsOtpSending(false);
    }
  };

  // ✅ Submit Signup Form
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);

    try {
      // Determine role based on signup type
      const role = isMentorSignup ? "mentor" : "individual_innovator";

      // Prepare form data for multipart upload (if mentor with bio)
      let requestData: any;
      let headers: any = {
        "Content-Type": "application/json",
      };

      if (isMentorSignup && (data as any).bio?.[0]) {
        // Use FormData for file upload
        const formData = new FormData();

        // Add JSON data as a string field
        const jsonData = {
          role,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          otp: data.otp,
          password: data.password,
          expertiseCategory: (data as any).expertiseCategory,
          expertiseSubCategory: (data as any).expertiseSubCategory || "",
        };

        formData.append("json", JSON.stringify(jsonData));
        formData.append("bio", (data as any).bio[0]); // File object

        requestData = formData;
        headers = {}; // Let browser set Content-Type with boundary for multipart
      } else {
        // JSON data for individual innovator
        requestData = {
          role,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          otp: data.otp,
          password: data.password,
        };
      }

      // Make API call
      const response = await axios.post(
        `${apiUrl}/api/auth/signup/public`,
        requestData,
        { headers }
      );

      if (response.data.success) {
        // Show success message
        toast({
          title: "Account Created Successfully!",
          description:
            "Your registration is pending approval. You'll receive an email once your account is activated.",
        });

        // ✅ Note: Signup doesn't return a token (account is pending approval)
        // Token will be received after login when account is activated
        // localStorage.setItem("token", response.data.token); // Not applicable here

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push(
            `/login?message=Account created! Please wait for admin approval.`
          );
        }, 2000);
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create account. Please try again.";

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <CardTitle className="text-2xl">
            {isMentorSignup
              ? "External Mentor Signup"
              : "Individual Innovator Signup"}
          </CardTitle>
          <CardDescription>
            {isMentorSignup
              ? "Join our network of experts to guide the next generation."
              : "Create your account to start validating ideas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ada" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Lovelace" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ada.lovelace@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ Send OTP Button - Email-based */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isOtpSent ? "secondary" : "default"}
                  className="flex-1"
                  onClick={handleSendOtp}
                  disabled={isOtpSending || otpTimer > 0 || !email}
                >
                  {isOtpSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : otpTimer > 0 ? (
                    `Resend in ${Math.floor(otpTimer / 60)}:${String(
                      otpTimer % 60
                    ).padStart(2, "0")}`
                  ) : isOtpSent ? (
                    "Resend OTP"
                  ) : (
                    "Send OTP to Email"
                  )}
                </Button>
              </div>

              {/* OTP Input */}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        {...field}
                        disabled={!isOtpSent}
                      />
                    </FormControl>
                    <FormMessage />
                    {isOtpSent && (
                      <p className="text-xs text-muted-foreground">
                        OTP sent to {email}. Check your inbox.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Mentor-specific Fields */}
              {isMentorSignup && (
                <>
                  <FormField
                    control={form.control}
                    name="expertiseCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expertise Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary area of expertise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_DOMAINS_WITH_SUBDOMAINS.map((domain) => (
                              <SelectItem key={domain.name} value={domain.name}>
                                {domain.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedDomainData &&
                    selectedDomainData.subDomains.length > 0 && (
                      <FormField
                        control={form.control}
                        name="expertiseSubCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-Category (Optional)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a sub-category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedDomainData.subDomains.map((sub) => (
                                  <SelectItem key={sub} value={sub}>
                                    {sub}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Upload Bio/CV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="file"
                              className="pl-10"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => onChange(e.target.files)}
                              {...rest}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {value?.[0] && (
                          <p className="text-xs text-muted-foreground">
                            Selected: {value[0].name} (
                            {(value[0].size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Password Fields */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full !mt-6"
                disabled={isSubmitting || !isOtpSent}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Info Text */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                Your account will be pending approval. You'll receive an email
                once activated.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Main page export with Suspense wrapper
export default function IndividualSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
