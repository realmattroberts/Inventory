"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  GitMerge,
  Plus,
  Pencil,
  SkipForward,
  Undo2,
  ChevronDown,
  Package,
} from "lucide-react";
import { ReviewItem, ReviewAction } from "../types";

type ReviewItemCardProps = {
  item: ReviewItem;
  index: number;
  onUpdate: (index: number, updates: Partial<ReviewItem>) => void;
  onOpenSearch: (index: number) => void;
  onOpenCreate: (index: number) => void;
};

const actionStyles: Record<ReviewAction, string> = {
  pending: "border-border bg-card",
  confirmed: "border-green-300 bg-green-50 dark:bg-green-950/20",
  rematched: "border-blue-300 bg-blue-50 dark:bg-blue-950/20",
  create_new: "border-purple-300 bg-purple-50 dark:bg-purple-950/20",
  skipped: "border-gray-200 bg-gray-50 dark:bg-gray-900/40 opacity-60",
};

export function ReviewItemCard({
  item,
  index,
  onUpdate,
  onOpenSearch,
  onOpenCreate,
}: ReviewItemCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editQty, setEditQty] = useState(String(item.quantity));
  const [editName, setEditName] = useState(item.name);
  const [editSku, setEditSku] = useState(item.sku);

  const isResolved = item.action !== "pending";

  const handleConfirm = () => {
    onUpdate(index, { action: "confirmed" });
  };

  const handleSkip = () => {
    onUpdate(index, { action: "skipped" });
  };

  const handleUndo = () => {
    onUpdate(index, { action: "pending" });
  };

  const handleSaveEdit = () => {
    onUpdate(index, {
      quantity: Math.max(1, parseInt(editQty) || item.quantity),
      name: editName.trim() || item.name,
      sku: editSku.trim() || item.sku,
    });
    setEditOpen(false);
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all ${actionStyles[item.action]}`}
    >
      {/* Header row: name/sku + qty */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">{item.name}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {item.sku}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg font-bold">x{item.quantity}</span>
        </div>
      </div>

      {/* Match info */}
      {item.autoMatched && item.matchedItemId && item.action === "pending" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-md px-2.5 py-1.5">
          <Package className="h-3.5 w-3.5 shrink-0" />
          <span>
            Matched:{" "}
            <span className="font-medium text-foreground">
              {item.matchedItemName}
            </span>
            {item.matchedItemQty !== null && (
              <span className="ml-1">({item.matchedItemQty} in stock)</span>
            )}
          </span>
        </div>
      )}

      {/* Resolved state info */}
      {item.action === "confirmed" && (
        <div className="flex items-center gap-2 text-xs text-green-700 mb-3 bg-green-100 rounded-md px-2.5 py-1.5">
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span>
            Receiving into:{" "}
            <span className="font-medium">{item.matchedItemName || item.name}</span>
            {item.matchedItemQty !== null && (
              <span className="ml-1">({item.matchedItemQty} in stock)</span>
            )}
          </span>
        </div>
      )}

      {item.action === "rematched" && (
        <div className="flex items-center gap-2 text-xs text-blue-700 mb-3 bg-blue-100 rounded-md px-2.5 py-1.5">
          <GitMerge className="h-3.5 w-3.5 shrink-0" />
          <span>
            Rematched to:{" "}
            <span className="font-medium">
              {item.matchedItemName} ({item.matchedItemSku})
            </span>
          </span>
        </div>
      )}

      {item.action === "create_new" && (
        <div className="flex items-center gap-2 text-xs text-purple-700 mb-3 bg-purple-100 rounded-md px-2.5 py-1.5">
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span>
            Will create new item:{" "}
            <span className="font-medium">
              {item.name} ({item.sku})
            </span>
          </span>
        </div>
      )}

      {item.action === "skipped" && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <SkipForward className="h-3.5 w-3.5 shrink-0" />
          <span>This item will be skipped</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isResolved ? (
          <>
            {item.autoMatched && item.matchedItemId && (
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                onClick={handleConfirm}
              >
                <Check className="mr-1 h-3 w-3" />
                Confirm
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onOpenSearch(index)}
            >
              <GitMerge className="mr-1 h-3 w-3" />
              Rematch
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onOpenCreate(index)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Create New
            </Button>
            <Popover open={editOpen} onOpenChange={setEditOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditQty(String(item.quantity));
                    setEditName(item.name);
                    setEditSku(item.sku);
                  }}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Edit Item</p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">SKU</Label>
                      <Input
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        className="h-8 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleSkip}
            >
              Skip
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={handleUndo}
            >
              <Undo2 className="mr-1 h-3 w-3" />
              Change
            </Button>
            {item.action !== "skipped" && (
              <Popover open={editOpen} onOpenChange={setEditOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditQty(String(item.quantity));
                      setEditName(item.name);
                      setEditSku(item.sku);
                    }}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Edit Item</p>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
