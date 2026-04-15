import { Button } from "../ui/button";

type Props = {
  previous: () => Promise<void>;
  hasPrev: boolean;
  next: () => Promise<void>;
  hasNext: boolean;
};
export default function PaginationButtons({
  hasNext,
  hasPrev,
  next,
  previous,
}: Props) {
  return (
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
  );
}
