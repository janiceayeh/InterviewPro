"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/context/admin-auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border/50 shadow-xl">
        <div className="p-8">
          {/* Logo/Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Portal
            </h1>
            <p className="text-muted-foreground text-sm">InterviewPro CMS</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              className="mb-6 border-destructive/50 bg-destructive/10"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <div className="ml-3">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address
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
              <p className="text-xs text-muted-foreground mt-1">
                Demo: admin@interviewpro.com
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="border-border/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Demo: any password works for demo accounts
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <Link href="/admin/reset-password">
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-primary/80"
              >
                Forgot Password?
              </Button>
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/30">
            <p className="text-xs font-semibold text-foreground mb-2">
              Demo Accounts:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Super Admin: admin@interviewpro.com</p>
              <p>Content Manager: content@interviewpro.com</p>
              <p>Moderator: moderator@interviewpro.com</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
