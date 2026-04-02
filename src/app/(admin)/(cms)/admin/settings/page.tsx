"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Trash2, Plus, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/lib/context/admin-auth-context";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  role: "super-admin" | "content-manager" | "moderator";
  createdAt: string;
}

const roleDescriptions = {
  "super-admin": "Full access to all features and admin management",
  "content-manager": "Can manage interview questions and tips",
  moderator: "Can moderate forum posts and manage users",
};

export default function SettingsPage() {
  const { user, role } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<
    "super-admin" | "content-manager" | "moderator"
  >("content-manager");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Mock data - in real app, fetch from API
        setAdmins([
          {
            id: "1",
            email: "admin@interviewpro.com",
            role: "super-admin",
            createdAt: "2024-01-15",
          },
          {
            id: "2",
            email: "content@interviewpro.com",
            role: "content-manager",
            createdAt: "2024-02-20",
          },
          {
            id: "3",
            email: "moderator@interviewpro.com",
            role: "moderator",
            createdAt: "2024-03-10",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Please enter an email");
      return;
    }

    try {
      setIsAddingAdmin(true);
      // Mock API call
      const newAdmin: AdminUser = {
        id: Math.random().toString(),
        email: newAdminEmail,
        role: newAdminRole,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAdmins([...admins, newAdmin]);
      setNewAdminEmail("");
      setNewAdminRole("content-manager");
      toast.success("Admin added successfully");
    } catch (error) {
      toast.error("Failed to add admin");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = (email: string) => {
    if (email === user?.email) {
      toast.error("You can't remove your own account");
      return;
    }
    setAdmins(admins.filter((a) => a.email !== email));
    toast.success("Admin removed");
  };

  const roleColor = {
    "super-admin": "bg-purple-500/20 text-purple-700",
    "content-manager": "bg-blue-500/20 text-blue-700",
    moderator: "bg-amber-500/20 text-amber-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">
          Manage admin users and system settings
        </p>
      </div>

      {/* Current User Info */}
      <Card className="p-6 border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your Account
        </h2>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Email</Label>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">Role</Label>
            <Badge
              className={roleColor[role as keyof typeof roleColor]}
              className="mt-1"
            >
              {role?.replace("-", " ")}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              {roleDescriptions[role as keyof typeof roleDescriptions]}
            </p>
          </div>
        </div>
      </Card>

      {/* Admin Users Management */}
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Admin Users
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage administrators and their roles
            </p>
          </div>
          {role === "super-admin" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-foreground">
                      Role
                    </Label>
                    <Select
                      value={newAdminRole}
                      onValueChange={(value: any) => setNewAdminRole(value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                        <SelectItem value="content-manager">
                          Content Manager
                        </SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      {roleDescriptions[newAdminRole]}
                    </p>
                  </div>
                  <Button
                    onClick={handleAddAdmin}
                    disabled={isAddingAdmin}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isAddingAdmin ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-sm font-semibold text-foreground py-3">
                  Email
                </th>
                <th className="text-left text-sm font-semibold text-foreground py-3">
                  Role
                </th>
                <th className="text-left text-sm font-semibold text-foreground py-3">
                  Added
                </th>
                {role === "super-admin" && (
                  <th className="text-right text-sm font-semibold text-foreground py-3">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={role === "super-admin" ? 4 : 3}
                    className="text-center py-8"
                  >
                    <div className="text-muted-foreground">
                      Loading admins...
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "super-admin" ? 4 : 3}
                    className="text-center py-8"
                  >
                    <div className="text-muted-foreground">No admins found</div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-border/30 hover:bg-muted/50"
                  >
                    <td className="py-3 text-foreground font-medium">
                      {admin.email}
                    </td>
                    <td className="py-3">
                      <Badge className={roleColor[admin.role]}>
                        {admin.role.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground text-sm">
                      {admin.createdAt}
                    </td>
                    {role === "super-admin" && (
                      <td className="py-3 text-right">
                        {admin.email === user?.email ? (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAdmin(admin.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Information */}
      <Card className="p-6 border-border/50">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Role Permissions
        </h2>
        <div className="space-y-3">
          {Object.entries(roleDescriptions).map(([roleName, description]) => (
            <div
              key={roleName}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/30"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground capitalize">
                  {roleName.replace("-", " ")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
