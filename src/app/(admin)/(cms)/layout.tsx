"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import PageLoading from "@/components/page-loading";
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
    return <PageLoading />;
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
