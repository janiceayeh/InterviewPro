"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { routes } from "@/lib/routes";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ForgotPasswordFormSchema = z.object({
  email: z.email("A valid email is required"),
});
const resolver = zodResolver(ForgotPasswordFormSchema);
type ForgotPasswordFormData = z.infer<typeof ForgotPasswordFormSchema>;

type Props = {
  userType: "student" | "admin";
};
export default function ForgotPasswordForm({ userType }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginLink =
    userType === "student" ? routes.userLogin() : routes.adminLogin();

  const form = useForm({
    resolver: resolver,
  });

  const email = form.watch("email");

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async ({ email }) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      const errorMessage =
        err.code === "auth/user-not-found"
          ? "No account found with this email address"
          : err.message || "Failed to send password reset email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 mx-auto mb-2">
              <Mail className="size-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-center">
              {submitted
                ? "Check your email for reset instructions"
                : "Enter your email address and we will send you a link to reset your password"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <div className="flex items-center justify-center size-16 rounded-full bg-success/10">
                    <CheckCircle2 className="size-8 text-success" />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-foreground font-medium">
                    Password reset email sent!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We have sent a password reset link to{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check your email and follow the instructions to reset your
                    password.
                  </p>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="size-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    If you don&apos;t see the email within 5 minutes, check your
                    spam folder.
                  </AlertDescription>
                </Alert>

                <Button asChild className="w-full">
                  <Link href={loginLink}>Back to Login</Link>
                </Button>
              </motion.div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            autoFocus
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={field.value}
                            onChange={field.onChange}
                            disabled={loading}
                            className="h-10"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert
                      variant="destructive"
                      className="bg-destructive/10 border-destructive/20"
                    >
                      <AlertCircle className="size-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 size-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center pt-2">
                    <Button
                      variant="ghost"
                      asChild
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Link
                        href={loginLink}
                        className="flex items-center gap-1"
                      >
                        <ArrowLeft className="size-4" />
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
