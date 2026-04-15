"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import PageLoading from "@/components/page-loading";
import { useAdminAuth } from "@/lib/context/admin-auth-context";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push(routes.adminLogin());
    }
  }, [admin, isLoading]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main
        className="transition-all duration-300 min-w-0 ml-auto"
        style={{ width: "calc(100% - var(--sidebar-width))" }}
      >
        <div className="p-8 bg-background/50 min-h-screen overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
