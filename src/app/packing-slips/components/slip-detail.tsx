"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Package,
  Check,
  GitMerge,
  Plus,
  SkipForward,
} from "lucide-react";
import { PackingSlipRecord, ParsedItem, formatDate } from "../types";

type SlipDetailProps = {
  slip: PackingSlipRecord;
  onBack: () => void;
};

function ActionBadge({ item }: { item: ParsedItem }) {
  if (item.action === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
        <Check className="h-3 w-3" /> Confirmed
      </span>
    );
  }
  if (item.action === "rematched") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
        <GitMerge className="h-3 w-3" /> Rematched
        {item.matchedItemName && (
          <span className="font-normal ml-0.5">to {item.matchedItemName}</span>
        )}
      </span>
    );
  }
  if (item.action === "create_new") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700">
        <Plus className="h-3 w-3" /> Created
      </span>
    );
  }
  if (item.action === "skipped") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
        <SkipForward className="h-3 w-3" /> Skipped
      </span>
    );
  }
  // Legacy slips without action field
  if (item.matched) {
    return <Check className="h-4 w-4 text-green-600" />;
  }
  return <span className="text-xs text-orange-600">Skipped</span>;
}

export function SlipDetail({ slip, onBack }: SlipDetailProps) {
  const items: ParsedItem[] = slip.parsedData
    ? JSON.parse(slip.parsedData)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {slip.fileName}
          </h1>
          <p className="text-muted-foreground">
            Processed {formatDate(slip.createdAt)}
            {slip.reference && ` \u00b7 ${slip.reference}`}
            {slip.performedBy && ` \u00b7 by ${slip.performedBy}`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Items Received</p>
            <p className="text-2xl font-bold">{slip.itemCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Quantity</p>
            <p className="text-2xl font-bold">
              {slip.totalQuantity.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">PO Reference</p>
            <p className="text-2xl font-bold font-mono">
              {slip.reference || "\u2014"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {slip.rawText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {slip.rawText}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      x{item.quantity}
                    </span>
                    <ActionBadge item={item} />
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No item data stored for this slip.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
