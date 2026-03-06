"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Plus, GitMerge, SkipForward } from "lucide-react";
import { ReviewItem } from "../types";

type SlipDoneProps = {
  reviewItems: ReviewItem[];
  onBackToHistory: () => void;
  onScanAnother: () => void;
};

export function SlipDone({
  reviewItems,
  onBackToHistory,
  onScanAnother,
}: SlipDoneProps) {
  const confirmed = reviewItems.filter(
    (i) => i.action === "confirmed"
  ).length;
  const rematched = reviewItems.filter(
    (i) => i.action === "rematched"
  ).length;
  const created = reviewItems.filter(
    (i) => i.action === "create_new"
  ).length;
  const skipped = reviewItems.filter(
    (i) => i.action === "skipped"
  ).length;
  const totalReceived = confirmed + rematched + created;
  const totalQty = reviewItems
    .filter((i) => i.action !== "skipped" && i.action !== "pending")
    .reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBackToHistory}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Packing Slips</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Check className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-xl font-bold mb-2">Inventory Updated!</h2>
          <p className="text-muted-foreground mb-4">
            {totalReceived} item{totalReceived !== 1 ? "s" : ""} received
            ({totalQty.toLocaleString()} total units)
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {confirmed > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-700">
                <Check className="h-3.5 w-3.5" />
                {confirmed} Confirmed
              </span>
            )}
            {rematched > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700">
                <GitMerge className="h-3.5 w-3.5" />
                {rematched} Rematched
              </span>
            )}
            {created > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700">
                <Plus className="h-3.5 w-3.5" />
                {created} Created
              </span>
            )}
            {skipped > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-500">
                <SkipForward className="h-3.5 w-3.5" />
                {skipped} Skipped
              </span>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={onBackToHistory}>View History</Button>
            <Button variant="outline" onClick={onScanAnother}>
              Scan Another
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
