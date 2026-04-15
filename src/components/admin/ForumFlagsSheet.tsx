import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { ForumPostAnswerFlag, ForumPostFlag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { FORUM_POST_FLAGS } from "@/lib/constants";
import { useForumFlags } from "@/lib/hooks";
import { useEffect } from "react";
import PageLoading from "../page-loading";
import { toast } from "sonner";

function getFlag({ category, value }: { category: string; value: string }) {
  return FORUM_POST_FLAGS.find((f) => f.category === category)?.items?.find(
    (i) => i.value === value,
  );
}

type Props = {
  open: boolean;
  onOpenChange?(open: boolean): void;
  flagType: "post" | "answer";
  id: string;
};
export function ForumFlagsSheet({ open, onOpenChange, flagType, id }: Props) {
  const { flags, flagsError, flagsGetAll, flagsLoading } = useForumFlags();

  const entity = flagType == "post" ? "Post" : "Answer";

  useEffect(() => {
    flagsGetAll({
      flagType,
      id,
    });
  }, [flagType, id]);

  useEffect(() => {
    if (!flagsLoading && flagsError) {
      toast.error(`Failed to load flags: ${flagsError.message}`);
    }
  }, [flagsLoading, flagsError]);

  if (flagsLoading) {
    return <PageLoading />;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
      >
        <SheetHeader>
          <SheetTitle>{entity} Flags</SheetTitle>
          <SheetDescription>View flags for selected {entity}</SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
          <div className="flex flex-wrap gap-2">
            {flags.length === 0 ? (
              <div className="text-muted-foreground">No flags found</div>
            ) : (
              flags.map((f) => {
                const flag = getFlag({
                  category: f.flagCategory,
                  value: f.flagValue,
                });

                return (
                  <Badge key={f.id} variant="secondary" className="pl-2">
                    {flag?.label} - {flag?.description}
                  </Badge>
                );
              })
            )}
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
