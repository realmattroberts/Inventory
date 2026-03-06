"use client";

import { Button } from "@/components/ui/button";
import { Check, GitMerge, Plus, SkipForward, Loader2 } from "lucide-react";
import { ReviewItem } from "../types";

type ReviewSummaryBarProps = {
  items: ReviewItem[];
  processing: boolean;
  onProcessAll: () => void;
};

export function ReviewSummaryBar({
  items,
  processing,
  onProcessAll,
}: ReviewSummaryBarProps) {
  const confirmed = items.filter((i) => i.action === "confirmed").length;
  const rematched = items.filter((i) => i.action === "rematched").length;
  const created = items.filter((i) => i.action === "create_new").length;
  const skipped = items.filter((i) => i.action === "skipped").length;
  const pending = items.filter((i) => i.action === "pending").length;
  const total = items.length;
  const resolved = total - pending;

  const allResolved = pending === 0;

  return (
    <div className="flex items-center gap-3 flex-wrap rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {confirmed > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">
            <Check className="h-3 w-3" />
            {confirmed} Confirmed
          </span>
        )}
        {rematched > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700">
            <GitMerge className="h-3 w-3" />
            {rematched} Rematched
          </span>
        )}
        {created > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700">
            <Plus className="h-3 w-3" />
            {created} Creating
          </span>
        )}
        {skipped > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500">
            <SkipForward className="h-3 w-3" />
            {skipped} Skipped
          </span>
        )}
        {pending > 0 && (
          <span className="text-xs text-muted-foreground">
            {pending} pending
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {resolved}/{total} resolved
        </span>
      </div>

      <Button
        onClick={onProcessAll}
        disabled={!allResolved || processing}
        className={
          allResolved && !processing
            ? "bg-green-600 hover:bg-green-700"
            : ""
        }
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Process All (${resolved - skipped} items)`
        )}
      </Button>
    </div>
  );
}
