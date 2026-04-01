import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/context/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();
  const { sendResetEmail } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendResetEmail(email);
      setIsSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border/50 shadow-xl">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSubmitted
                ? "Check your email for instructions"
                : "Enter your admin email to receive a password reset link"}
            </p>
          </div>

          {isSubmitted ? (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                <div>
                  <p className="text-foreground font-medium mb-2">
                    Check your email
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We've sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => router.push("/admin/login")}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Back to Login
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <Alert
                  className="mb-6 border-destructive/50 bg-destructive/10"
                  variant="destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-destructive">
                      {error}
                    </p>
                  </div>
                </Alert>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground font-medium"
                  >
                    Admin Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@interviewpro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="border-border/50 focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <Link href="/admin/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary hover:text-primary/80 pl-0"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> If you don't receive an email within a
                  few minutes, check your spam folder.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
