import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import { FORUM_POST_FLAGS } from "@/lib/constants";
import { Item, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { useState } from "react";
import { useFlagPost } from "@/lib/hooks";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Flag = (typeof FORUM_POST_FLAGS)[number]["items"][number];

type Props = {
  open: boolean;
  onOpenChange(open: boolean): void;
  flagType: "post" | "answer";
  id: string;
  userId: string;
};
export default function ReportPostDialog({
  onOpenChange,
  open,
  flagType,
  id,
  userId,
}: Props) {
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const { isFlaggingPost, flagPost } = useFlagPost();

  const handleFlagPost = async () => {
    const { ok, error } = await flagPost({
      userId,
      flagCategory: selectedFlag.category,
      flagType,
      flagValue: selectedFlag.value,
      id,
    });
    if (error) {
      toast.error(`Failed to send report: ${error.message}`);
    }

    if (ok) {
      toast.success("Report sent successfully");
      setSelectedFlag(null);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <form>
        <SheetContent className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Report Post</SheetTitle>
            <SheetDescription>
              Select your reason for reporting this post
            </SheetDescription>
          </SheetHeader>
          <div className="px-2">
            <Combobox<Flag>
              items={FORUM_POST_FLAGS}
              modal={true}
              itemToStringValue={(item) => item.label}
              value={selectedFlag}
              onValueChange={(item) => setSelectedFlag(item)}
            >
              <ComboboxInput placeholder="Select a reason" />
              <ComboboxContent>
                <ComboboxEmpty>No reasons</ComboboxEmpty>
                <ComboboxList>
                  {(group, index) => (
                    <ComboboxGroup key={group.category} items={group.items}>
                      <ComboboxLabel>{group.category}</ComboboxLabel>
                      <ComboboxCollection>
                        {(item) => (
                          <ComboboxItem
                            key={item.value}
                            value={item}
                            className="cursor-pointer"
                          >
                            <Item size="sm" className="p-0">
                              <ItemContent>
                                <ItemTitle className="whitespace-nowrap">
                                  {item.label}
                                </ItemTitle>
                                <ItemDescription>
                                  {item.description}
                                </ItemDescription>
                              </ItemContent>
                            </Item>
                          </ComboboxItem>
                        )}
                      </ComboboxCollection>
                      {index < FORUM_POST_FLAGS.length - 1 && (
                        <ComboboxSeparator />
                      )}
                    </ComboboxGroup>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Button
              type="button"
              className="w-full mt-2"
              disabled={!selectedFlag || isFlaggingPost}
              onClick={handleFlagPost}
            >
              {isFlaggingPost ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reporting Post...
                </>
              ) : (
                "Report Post"
              )}
            </Button>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </form>
    </Sheet>
  );
}
