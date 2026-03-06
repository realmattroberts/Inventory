"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Minus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/components/layout/user-picker";

type ItemOption = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
};

export default function QuickUsePage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchItems = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setItems(data);
    } catch {
      console.error("Failed to search items");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get("quantity"));
    const notes = formData.get("notes") as string;

    try {
      const res = await fetch("/api/quick-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          quantity,
          notes,
          performedBy: getCurrentUser(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setSelectedItem((prev) =>
          prev ? { ...prev, quantity: prev.quantity - quantity } : null
        );
        // Reset the form
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to use item");
      }
    } catch {
      alert("Failed to submit");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Use</h1>
          <p className="text-muted-foreground">
            Remove items from inventory without a job or work order
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Item Search */}
        <Card>
          <CardHeader>
            <CardTitle>Select Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), searchItems())
                  }
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={searchItems}
                disabled={loading}
              >
                Search
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedItem(item);
                    setSuccess(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    selectedItem?.id === item.id
                      ? "border-primary bg-accent"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </button>
              ))}
              {items.length === 0 && search && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items found. Try a different search.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Use Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5" />
              Remove from Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedItem.sku}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current stock: {selectedItem.quantity}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity to Remove *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    required
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Reason / Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="e.g., Grabbed for quick repair, personal use, damaged, etc."
                  />
                </div>

                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Item removed from inventory successfully!
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  variant="destructive"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Remove from Inventory"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Minus className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Search and select an item to remove</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
