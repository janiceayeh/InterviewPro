"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useUserProfiles } from "@/lib/hooks";
import PageLoading from "@/components/page-loading";

export default function UsersPage() {
  const {
    error,
    loading,
    userProfiles,
    previous,
    next,
    first,
    hasNext,
    hasPrev,
  } = useUserProfiles();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = userProfiles?.filter((u) =>
    u?.email?.toLowerCase()?.includes(searchQuery.toLowerCase()),
  );

  const noUsersFound = filteredUsers.length === 0;

  const planColor = {
    free: "bg-gray-500/20 text-gray-700",
    pro: "bg-blue-500/20 text-blue-700",
    enterprise: "bg-purple-500/20 text-purple-700",
  };

  useEffect(() => {
    first();
  }, []);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Users</h1>
          <p className="text-muted-foreground">
            Manage platform users and subscriptions
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 bg-muted/30">
              <TableHead className="text-foreground">Email</TableHead>
              <TableHead className="text-foreground">Name</TableHead>
              <TableHead className="text-foreground">Interviews</TableHead>
              <TableHead className="text-foreground">Joined</TableHead>
              <TableHead className="text-right text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noUsersFound ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">No users found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-border/30 hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {`${user.firstname} ${user.lastname}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.interviewSessionsCompleted ?? 0}
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm">
                    {user.createdAt?.toDate()?.toDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!noUsersFound && (
          <div className="w-full flex justify-center items-center">
            <div className="flex gap-2">
              <Button variant="outline" disabled={!hasPrev} onClick={previous}>
                Previous
              </Button>
              <Button disabled={!hasNext} onClick={next}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
