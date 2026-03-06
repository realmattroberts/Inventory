"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  ArrowRight,
  Merge,
  Check,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/components/layout/user-picker";

type ItemOption = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
};

export default function MergeItemsPage() {
  const router = useRouter();
  const [searchSource, setSearchSource] = useState("");
  const [searchTarget, setSearchTarget] = useState("");
  const [sourceResults, setSourceResults] = useState<ItemOption[]>([]);
  const [targetResults, setTargetResults] = useState<ItemOption[]>([]);
  const [sourceItem, setSourceItem] = useState<ItemOption | null>(null);
  const [targetItem, setTargetItem] = useState<ItemOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const searchItems = async (
    query: string,
    setter: (items: ItemOption[]) => void
  ) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/items?search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setter(data);
    } catch {
      console.error("Failed to search");
    }
    setLoading(false);
  };

  const handleMerge = async () => {
    if (!sourceItem || !targetItem) return;
    if (sourceItem.id === targetItem.id) {
      setError("Cannot merge an item with itself.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/merge-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceItemId: sourceItem.id,
          targetItemId: targetItem.id,
          performedBy: getCurrentUser(),
        }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to merge items");
      }
    } catch {
      setError("Failed to merge items");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Merge Items</h1>
        </div>
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center">
            <Check className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-bold mb-2">Items Merged!</h2>
            <p className="text-muted-foreground mb-2">
              <strong>{sourceItem?.name}</strong> ({sourceItem?.sku}) has been
              merged into <strong>{targetItem?.name}</strong> ({targetItem?.sku}
              ).
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The duplicate has been removed. All quantity and transaction
              history was transferred.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/inventory/${targetItem?.id}`}>
                <Button>View Merged Item</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setDone(false);
                  setSourceItem(null);
                  setTargetItem(null);
                  setSourceResults([]);
                  setTargetResults([]);
                  setSearchSource("");
                  setSearchTarget("");
                }}
              >
                Merge Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merge Items</h1>
          <p className="text-muted-foreground">
            Combine a duplicate item into the correct one. The source item will
            be deleted.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Source (duplicate to remove) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-destructive">
              Source (will be deleted)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search duplicate item..."
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    searchItems(searchSource, setSourceResults))
                  }
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => searchItems(searchSource, setSourceResults)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sourceResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSourceItem(item)}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    sourceItem?.id === item.id
                      ? "border-destructive bg-red-50"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.sku}
                    </p>
                  </div>
                  <span className="text-sm">Qty: {item.quantity}</span>
                </button>
              ))}
            </div>

            {sourceItem && (
              <div className="rounded-lg border-2 border-destructive bg-red-50 p-3">
                <p className="text-xs text-destructive font-medium mb-1">
                  WILL BE DELETED:
                </p>
                <p className="font-medium">{sourceItem.name}</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {sourceItem.sku}
                </p>
                <p className="text-sm">Qty: {sourceItem.quantity}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <ArrowRight className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Target (keep this one) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-700">
              Target (will be kept)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search correct item..."
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    searchItems(searchTarget, setTargetResults))
                  }
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => searchItems(searchTarget, setTargetResults)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {targetResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTargetItem(item)}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    targetItem?.id === item.id
                      ? "border-green-600 bg-green-50"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.sku}
                    </p>
                  </div>
                  <span className="text-sm">Qty: {item.quantity}</span>
                </button>
              ))}
            </div>

            {targetItem && (
              <div className="rounded-lg border-2 border-green-600 bg-green-50 p-3">
                <p className="text-xs text-green-700 font-medium mb-1">
                  WILL BE KEPT:
                </p>
                <p className="font-medium">{targetItem.name}</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {targetItem.sku}
                </p>
                <p className="text-sm">
                  Qty: {targetItem.quantity}
                  {sourceItem && (
                    <span className="text-green-700 font-medium">
                      {" "}
                      + {sourceItem.quantity} ={" "}
                      {targetItem.quantity + sourceItem.quantity}
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Merge Action */}
      {sourceItem && targetItem && (
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Merge Summary:</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>
                    Transfer {sourceItem.quantity} units from{" "}
                    <span className="font-mono">{sourceItem.sku}</span> to{" "}
                    <span className="font-mono">{targetItem.sku}</span>
                  </li>
                  <li>
                    Move all transaction history to the target item
                  </li>
                  <li>
                    Move any job item records to the target item
                  </li>
                  <li className="text-destructive font-medium">
                    Permanently delete &quot;{sourceItem.name}&quot; (
                    {sourceItem.sku})
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            <Button
              onClick={handleMerge}
              disabled={submitting}
              className="w-full"
            >
              <Merge className="mr-2 h-4 w-4" />
              {submitting ? "Merging..." : "Merge Items"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
