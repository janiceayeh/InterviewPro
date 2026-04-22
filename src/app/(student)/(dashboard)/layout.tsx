"use client";

import React, { useRef } from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { DashboardNav } from "@/components/dashboard/nav";
import PageLoading from "@/components/page-loading";
import { routes } from "@/lib/routes";
import { toast } from "sonner";

// ensures only logged in users have access to dashboard pages, all pages in the dashboard route group
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const didRedirectRef = useRef(false);

  // navigates back to the login page if the user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(routes.userLogin());
    }
  }, [user, loading]);

  //Force navigates to the roles onboarding page when sign up wasn't completed
  useEffect(() => {
    if (!loading && !didRedirectRef.current && user && !userProfile?.role) {
      didRedirectRef.current = true;
      toast.error("Please complete sign up");
      router.push(routes.studentRoleOnboarding());
    }
  }, [userProfile?.role, user, didRedirectRef.current, loading]);

  if (loading) {
    return <PageLoading />;
  }

  // prevents the brief flashing of dashboard page
  if (loading && !(user || userProfile?.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main>{children}</main>
    </div>
  );
}
