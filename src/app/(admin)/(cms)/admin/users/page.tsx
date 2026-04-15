"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye, Trash2Icon, Loader2, XIcon } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { COLLECTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ApiResponse, DeleteUserResponseDto, UserProfile } from "@/lib/types";
import { routes } from "@/lib/routes";

export default function UsersPage() {
  const {
    loading,
    userProfiles,
    previous,
    next,
    first,
    hasNext,
    hasPrev,
    refetch,
    search,
    reset,
  } = useUserProfiles();

  const [searchQuery, setSearchQuery] = useState("");
  const [userConfirmDelete, setUserConfirmDelete] = useState(false);
  const [userDeleting, setUserDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const noUsersFound = userProfiles?.length === 0;

  const handleClear = () => {
    setSearchQuery("");
    reset();
    first();
  };

  async function removeUser(user: UserProfile) {
    try {
      setUserDeleting(true);
      await deleteDoc(doc(db, COLLECTIONS.users, user.id));
      const res = await fetch(routes.api.deleteUser({ email: user.email }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = (await res.json()) as ApiResponse<DeleteUserResponseDto>;
      if (data?.error) {
        toast.error(`Failed to delete user: ${data.error}`);
        return;
      }

      if (data?.data?.ok) {
        toast;
        refetch();
        setUserConfirmDelete(false);
        toast.success("User deleted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete user: ${(error as Error).message}`);
    } finally {
      setUserDeleting(false);
    }
  }

  useEffect(() => {
    first();
  }, []);

  if (loading) return <PageLoading />;

  return (
    <>
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
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search({ searchTerm: searchQuery });
              }
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <XIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
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
                userProfiles?.map((user) => (
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
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserConfirmDelete(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!noUsersFound && (
            <div className="w-full flex justify-center items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!hasPrev}
                  onClick={previous}
                >
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

      {/* Confirm Delete User */}
      <AlertDialog open={userConfirmDelete} onOpenChange={setUserConfirmDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={userDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => removeUser(selectedUser)}
              disabled={userDeleting}
            >
              {userDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
