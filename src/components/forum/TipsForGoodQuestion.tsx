import { Card } from "@/components/ui/card";

export default function TipsForGoodQuestion() {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <h3 className="font-semibold text-foreground mb-3">
        Tips for a good question:
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• Be specific about the company or interview type</li>
        <li>• Include what you've already tried or researched</li>
        <li>• Provide relevant context (role level, timeline, etc.)</li>
        <li>• Proofread for clarity</li>
        <li>• Avoid asking multiple questions in one post</li>
      </ul>
    </Card>
  );
}
