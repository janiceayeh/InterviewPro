"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/context/admin-auth-context";
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  Users,
  MessageSquare,
  MessageCircle,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { routes } from "@/lib/routes";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: routes.adminDashboard(),
    permission: "view_analytics",
  },
  {
    label: "Interview Questions",
    icon: FileText,
    href: routes.adminInterviewQuestions(),
    permission: "manage_questions",
  },
  {
    label: "Tips",
    icon: Lightbulb,
    href: routes.adminTips(),
    permission: "manage_tips",
  },
  {
    label: "Users",
    icon: Users,
    href: routes.adminUsers(),
    permission: "manage_users",
  },
  {
    label: "Forum Moderation",
    icon: MessageSquare,
    href: routes.adminForumModeration(),
    permission: "manage_forum",
  },
  {
    label: "Settings",
    icon: Settings,
    href: routes.adminSettings(),
    permission: "manage_admins",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, hasPermission, role } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const visibleItems = menuItems.filter((item) =>
    hasPermission(item.permission),
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border/50 transition-all duration-300 z-1000",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="h-16 border-b border-border/30 flex items-center justify-between px-4">
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-foreground">Admin</h2>
            <p className="text-xs text-muted-foreground">InterviewPro</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary/90 text-primary-foreground",
                  isCollapsed && "px-2 justify-center",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30 bg-muted/30">
        {!isCollapsed && (
          <div className="mb-4 p-3 bg-background rounded-lg border border-border/30">
            <p className="text-xs font-semibold text-foreground mb-1">
              Logged in as
            </p>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {user?.email}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              <span className="text-xs text-muted-foreground capitalize">
                {role?.replace("-", " ")}
              </span>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
