"use client";

import React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { DashboardNav } from "@/components/dashboard/nav";
import { Loader2 } from "lucide-react";
import PageLoading from "@/components/page-loading";

// ensures only logged in users have access to dashboard pages, all pages in the dashboard route group
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // navigates back to the login page if the user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading) {
    return <PageLoading />;
  }

  // prevents the brief flashing of dashboard page
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="pb-20 md:pb-8">{children}</main>
    </div>
  );
}
