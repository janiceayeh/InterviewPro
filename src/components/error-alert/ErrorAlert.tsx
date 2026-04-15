import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

type Props = {
  errorMessage: string;
};

export default function ErrorAlert({ errorMessage }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3"
    >
      <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-destructive">Error</h3>
        <p className="text-sm text-destructive/80">{errorMessage}</p>
      </div>
    </motion.div>
  );
}
