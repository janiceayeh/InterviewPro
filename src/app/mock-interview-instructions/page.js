import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function MockInterviewInstructionspage() {
  return (
    <div className="flex justify-center mt-28">
      <div className="grid w-full max-w-md items-start gap-4">
        <Alert>
          <InfoIcon />
          <AlertTitle>Mock interview Instructions</AlertTitle>
          <AlertDescription>Instructions go here...</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
