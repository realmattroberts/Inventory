"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { ItemOption } from "../types";

type ItemSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: ItemOption) => void;
  initialSearch?: string;
};

export function ItemSearchDialog({
  open,
  onClose,
  onSelect,
  initialSearch = "",
}: ItemSearchDialogProps) {
  const [search, setSearch] = useState(initialSearch);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSearch(initialSearch);
      if (initialSearch) {
        doSearch(initialSearch);
      } else {
        // Load all items initially
        doSearch("");
      }
    }
  }, [open, initialSearch]);

  const doSearch = async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/items?search=${encodeURIComponent(term)}`
      );
      const data = await res.json();
      setItems(data);
    } catch {
      console.error("Failed to search items");
    }
    setLoading(false);
  };

  const handleSearch = () => {
    doSearch(search);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Existing Item
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="pl-10"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Search
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1.5 mt-2">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Searching...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items found. Try a different search term.
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.sku}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} in stock
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
