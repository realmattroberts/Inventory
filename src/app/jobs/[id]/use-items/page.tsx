"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/components/layout/user-picker";

type ItemOption = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
};

type SelectedItem = ItemOption & { quantityToUse: number };

export default function UseItemsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [searchResults, setSearchResults] = useState<ItemOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const searchItems = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      console.error("Failed to search");
    }
    setLoading(false);
  };

  const addItem = (item: ItemOption) => {
    if (selectedItems.some((si) => si.id === item.id)) return;
    setSelectedItems([...selectedItems, { ...item, quantityToUse: 1 }]);
  };

  const removeItem = (id: number) => {
    setSelectedItems(selectedItems.filter((si) => si.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    setSelectedItems(
      selectedItems.map((si) => (si.id === id ? { ...si, quantityToUse: qty } : si))
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${jobId}/use-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((si) => ({
            itemId: si.id,
            quantity: si.quantityToUse,
          })),
          performedBy: getCurrentUser(),
        }),
      });

      if (res.ok) {
        router.push(`/jobs/${jobId}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to use items");
      }
    } catch {
      setError("Failed to submit");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Use Items on Job</h1>
          <p className="text-muted-foreground">Select items and quantities to use</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchItems())}
                  className="pl-10"
                />
              </div>
              <Button type="button" variant="secondary" onClick={searchItems} disabled={loading}>
                Search
              </Button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((item) => {
                const isSelected = selectedItems.some((si) => si.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isSelected ? "opacity-50" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Avail: {item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addItem(item)}
                        disabled={isSelected || item.quantity === 0}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items to Use ({selectedItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItems.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Search and add items to use on this job.
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Available: {item.quantity}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={item.quantityToUse}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        className="w-20 text-center"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Processing..." : "Confirm & Use Items"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
