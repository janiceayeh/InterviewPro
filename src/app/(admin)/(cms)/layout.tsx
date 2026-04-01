"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAdminAuth } from "@/lib/context/admin-auth-context";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(routes.adminLogin());
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="min-h-screen bg-background/50 p-8">{children}</div>
      </main>
    </div>
  );
}
