"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  Trash2Icon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewTipForm } from "@/components/admin/new-tip-form";
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
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { Alert } from "@/components/ui/alert";
import PageLoading from "@/components/page-loading";
import { InterviewTip } from "@/lib/types";
import { useInterviewTips } from "@/lib/hooks";

async function tipGetHelpfulCount(tipId: string) {
  try {
    const docSnap = await getCountFromServer(
      query(
        collection(db, COLLECTIONS.interviewTipHelpfuls),
        where("tipId", "==", tipId),
        where("isHelpful", "==", true),
      ),
    );
    return { ok: true, tipHelpfulCount: docSnap.data().count };
  } catch (error) {
    return { error: error as Error };
  }
}

async function tipGetViewsCount(tipId: string) {
  try {
    const docSnap = await getCountFromServer(
      query(
        collection(db, COLLECTIONS.interviewTipViews),
        where("tipId", "==", tipId),
      ),
    );
    return { ok: true, tipViewsCount: docSnap.data().count };
  } catch (error) {
    return { error: error as Error };
  }
}

export default function TipsPage() {
  const {
    error,
    loading,
    tips,
    previous,
    next,
    reset,
    first,
    hasNext,
    hasPrev,
    refetch,
  } = useInterviewTips();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tipConfirmDeleteOpen, setTipConfirmDeleteOpen] = useState(false);
  const [tipSelected, setTipSelected] = useState<InterviewTip | null>(null);
  const [tipDeleting, setTipDeleting] = useState(false);
  const [filteredTips, setFilteredTips] = useState([]);
  const [tipHelpfulCountLoading, setTipHelpfulCountLoading] = useState(false);

  const noTipsFound = filteredTips.length === 0;

  async function deleteTip(tipId: string) {
    try {
      setTipDeleting(true);
      await deleteDoc(doc(db, COLLECTIONS.interviewTips, tipId));
      refetch();
      setTipConfirmDeleteOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete tip: ${(error as Error).message}`);
    } finally {
      setTipDeleting(false);
    }
  }

  useEffect(() => {
    first();
  }, []);

  useEffect(() => {
    (async () => {
      setTipHelpfulCountLoading(true);
      const filteredTips = tips
        .filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map(async (tip) => {
          const {
            error: helpfulErr,
            ok: helpfulOk,
            tipHelpfulCount,
          } = await tipGetHelpfulCount(tip.id);
          if (helpfulErr) {
            console.error(helpfulErr);
          } else if (helpfulOk) {
            tip.helpfulCount = tipHelpfulCount;
          }
          const {
            error: viewsErr,
            ok: viewsOk,
            tipViewsCount,
          } = await tipGetViewsCount(tip.id);
          if (viewsErr) {
            console.error(viewsErr);
          } else if (viewsOk) {
            tip.viewsCount = tipViewsCount;
          }
          return tip;
        });
      Promise.all(filteredTips).then((tips) => {
        setTipHelpfulCountLoading(false);
        setFilteredTips(tips);
      });
    })();
  }, [tips, searchQuery]);

  if (loading || tipHelpfulCountLoading) return <PageLoading />;
  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Interview Tips
          </h1>
          <p className="text-muted-foreground">
            Manage interview tips and advice
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            setTipSelected(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tip
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tips..."
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
              <TableHead className="text-foreground">Title</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Views</TableHead>
              <TableHead className="text-foreground">Helpful</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noTipsFound ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">No tips found</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTips.map((tip) => (
                <TableRow
                  key={tip.id}
                  className="border-border/30 hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground max-w-xs whitespace-normal break-normal">
                    {tip.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {tip.category}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tip.viewsCount ?? 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tip.helpfulCount ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tip.status === "published" ? "default" : "outline"
                      }
                      className={
                        tip.status === "published"
                          ? "bg-emerald-500/20 text-emerald-700"
                          : ""
                      }
                    >
                      {tip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setTipSelected(tip);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        setTipSelected(tip);
                        setTipConfirmDeleteOpen(true);
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

        {!noTipsFound && (
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

      {/* New Tip Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Interview Tip</DialogTitle>
            <DialogDescription>
              Create a new interview tip to share with users
            </DialogDescription>
          </DialogHeader>
          <NewTipForm
            tip={tipSelected}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              // Refetch tips
              if (tipSelected) {
                // Updated tip. Refetch current page
                refetch();
              } else {
                // New tip. Fetch first page
                reset();
                first();
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Tip Alert Dialog */}
      <AlertDialog
        open={tipConfirmDeleteOpen}
        onOpenChange={setTipConfirmDeleteOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Tip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this tip. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={tipDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTip(tipSelected.id)}
              disabled={tipDeleting}
            >
              {tipDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
