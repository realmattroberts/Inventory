"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { ReviewItem, ItemOption } from "../types";
import { ReviewItemCard } from "./review-item-card";
import { ReviewSummaryBar } from "./review-summary-bar";
import { ItemSearchDialog } from "./item-search-dialog";
import { ItemCreateInline } from "./item-create-inline";

type SlipReviewProps = {
  rawText: string;
  reviewItems: ReviewItem[];
  processing: boolean;
  onUpdateItem: (index: number, updates: Partial<ReviewItem>) => void;
  onProcessAll: () => void;
  onBack: () => void;
};

export function SlipReview({
  rawText,
  reviewItems,
  processing,
  onUpdateItem,
  onProcessAll,
  onBack,
}: SlipReviewProps) {
  const [searchDialogIndex, setSearchDialogIndex] = useState<number | null>(
    null
  );
  const [createFormIndex, setCreateFormIndex] = useState<number | null>(null);
  const [rawTextCollapsed, setRawTextCollapsed] = useState(false);

  const handleOpenSearch = (index: number) => {
    setCreateFormIndex(null);
    setSearchDialogIndex(index);
  };

  const handleOpenCreate = (index: number) => {
    setSearchDialogIndex(null);
    setCreateFormIndex(index);
  };

  const handleSearchSelect = (item: ItemOption) => {
    if (searchDialogIndex === null) return;
    onUpdateItem(searchDialogIndex, {
      action: "rematched",
      matchedItemId: item.id,
      matchedItemName: item.name,
      matchedItemSku: item.sku,
      matchedItemQty: item.quantity,
    });
    setSearchDialogIndex(null);
  };

  const handleCreateSave = (
    index: number,
    updates: Partial<ReviewItem>
  ) => {
    onUpdateItem(index, updates);
    setCreateFormIndex(null);
  };

  // Reference from raw text
  const poMatch = rawText.match(/PO:\s*(PO-[\w-]+)/);
  const poRef = poMatch?.[1] || null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Review Packing Slip
          </h1>
          <p className="text-muted-foreground">
            Review each item before receiving into inventory
            {poRef && (
              <span className="ml-2 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {poRef}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      <ReviewSummaryBar
        items={reviewItems}
        processing={processing}
        onProcessAll={onProcessAll}
      />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Raw Text (collapsible on left) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Extracted Text
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setRawTextCollapsed(!rawTextCollapsed)}
                >
                  {rawTextCollapsed ? "Show" : "Hide"}
                </Button>
              </div>
            </CardHeader>
            {!rawTextCollapsed && (
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 rounded-lg p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {rawText}
                </pre>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Item Review Cards */}
        <div className="space-y-3">
          {reviewItems.map((item, i) => (
            <div key={i}>
              {createFormIndex === i ? (
                <ItemCreateInline
                  item={item}
                  index={i}
                  onSave={handleCreateSave}
                  onCancel={() => setCreateFormIndex(null)}
                />
              ) : (
                <ReviewItemCard
                  item={item}
                  index={i}
                  onUpdate={onUpdateItem}
                  onOpenSearch={handleOpenSearch}
                  onOpenCreate={handleOpenCreate}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search Dialog */}
      <ItemSearchDialog
        open={searchDialogIndex !== null}
        onClose={() => setSearchDialogIndex(null)}
        onSelect={handleSearchSelect}
        initialSearch={
          searchDialogIndex !== null
            ? reviewItems[searchDialogIndex]?.originalName || ""
            : ""
        }
      />
    </div>
  );
}
