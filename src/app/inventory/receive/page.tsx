"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, PackagePlus, Search, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/components/layout/user-picker";

type ItemOption = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
};

type Category = {
  id: number;
  name: string;
  color: string | null;
};

const CATEGORY_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#6B7280", "#14B8A6", "#F43F5E",
];

export default function ReceiveInventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Create new item state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItemSku, setNewItemSku] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCostPrice, setNewItemCostPrice] = useState("");
  const [newItemLocation, setNewItemLocation] = useState("");
  const [newItemMinQty, setNewItemMinQty] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);
  const [createError, setCreateError] = useState("");

  // New category inline creation
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6B7280");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      console.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const searchItems = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setHasSearched(true);
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

    const formData = new FormData(e.currentTarget);
    formData.set("itemId", String(selectedItem.id));
    formData.set("performedBy", getCurrentUser());

    try {
      const res = await fetch("/api/receive", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.push("/inventory");
        router.refresh();
      }
    } catch {
      console.error("Failed to receive inventory");
    }
    setSubmitting(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
        setNewItemCategoryId(String(cat.id));
        setShowNewCategory(false);
        setNewCategoryName("");
        setNewCategoryColor("#6B7280");
      }
    } catch {
      console.error("Failed to create category");
    }
    setCreatingCategory(false);
  };

  const handleCreateItem = async () => {
    if (!newItemSku.trim() || !newItemName.trim()) {
      setCreateError("SKU and Name are required.");
      return;
    }
    setCreatingItem(true);
    setCreateError("");

    try {
      const res = await fetch("/api/items/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newItemSku.trim(),
          name: newItemName.trim(),
          description: newItemDescription.trim() || null,
          categoryId: newItemCategoryId ? Number(newItemCategoryId) : null,
          price: newItemPrice ? Number(newItemPrice) : null,
          costPrice: newItemCostPrice ? Number(newItemCostPrice) : null,
          location: newItemLocation.trim() || null,
          minQuantity: newItemMinQty ? Number(newItemMinQty) : 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newItem: ItemOption = {
          id: data.id,
          sku: newItemSku.trim(),
          name: newItemName.trim(),
          quantity: 0,
        };
        setSelectedItem(newItem);
        setShowCreateForm(false);
        // Reset create form
        setNewItemSku("");
        setNewItemName("");
        setNewItemDescription("");
        setNewItemCategoryId("");
        setNewItemPrice("");
        setNewItemCostPrice("");
        setNewItemLocation("");
        setNewItemMinQty("");
      } else {
        const data = await res.json();
        setCreateError(data.error || "Failed to create item");
      }
    } catch {
      setCreateError("Failed to create item");
    }
    setCreatingItem(false);
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    // Pre-fill SKU from search term if it looks like a SKU
    if (search.trim() && /^[A-Za-z0-9\-_]+$/.test(search.trim())) {
      setNewItemSku(search.trim().toUpperCase());
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Receive Inventory</h1>
          <p className="text-muted-foreground">Record incoming stock</p>
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
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchItems())}
                  className="pl-10"
                />
              </div>
              <Button type="button" variant="secondary" onClick={searchItems} disabled={loading}>
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
                    setShowCreateForm(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    selectedItem?.id === item.id ? "border-primary bg-accent" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </button>
              ))}
              {items.length === 0 && hasSearched && !loading && (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No items found for &quot;{search}&quot;.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCreateForm}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Create New Item
                  </Button>
                </div>
              )}
            </div>

            {/* Always show create option at bottom when results exist */}
            {!showCreateForm && items.length > 0 && (
              <div className="border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={openCreateForm}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Item not listed? Create new
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Create Form OR Receive Form */}
        {showCreateForm ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Item
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newSku" className="text-xs">SKU *</Label>
                  <Input
                    id="newSku"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    placeholder="e.g., RES-10K-0805"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newName" className="text-xs">Name *</Label>
                  <Input
                    id="newName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., 10K Ohm Resistor"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newDesc" className="text-xs">Description</Label>
                <Input
                  id="newDesc"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="Optional description"
                  className="h-9"
                />
              </div>

              {/* Category with inline create */}
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                {showNewCategory ? (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name"
                        className="h-9"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-1">
                      {CATEGORY_COLORS.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewCategoryColor(c)}
                          className={`h-6 w-6 rounded-full border-2 transition-transform ${
                            newCategoryColor === c ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="h-9"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName("");
                      }}
                      className="h-9"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={newItemCategoryId}
                      onChange={(e) => setNewItemCategoryId(e.target.value)}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm h-9"
                    >
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCategory(true)}
                      className="h-9 shrink-0"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      New
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPrice" className="text-xs">Sell Price ($)</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newCostPrice" className="text-xs">Cost Price ($)</Label>
                  <Input
                    id="newCostPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemCostPrice}
                    onChange={(e) => setNewItemCostPrice(e.target.value)}
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newLocation" className="text-xs">Location</Label>
                  <Input
                    id="newLocation"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    placeholder="e.g., BIN-A1"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newMinQty" className="text-xs">Min Quantity</Label>
                  <Input
                    id="newMinQty"
                    type="number"
                    min="0"
                    value={newItemMinQty}
                    onChange={(e) => setNewItemMinQty(e.target.value)}
                    placeholder="0"
                    className="h-9"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}

              <Button
                type="button"
                onClick={handleCreateItem}
                disabled={creatingItem || !newItemSku.trim() || !newItemName.trim()}
                className="w-full"
              >
                {creatingItem ? "Creating..." : "Create Item & Continue to Receive"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                The item will be created with 0 quantity. Fill in the receive form next.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5" />
                Receive Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="font-medium">{selectedItem.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{selectedItem.sku}</p>
                    <p className="text-sm text-muted-foreground">Current stock: {selectedItem.quantity}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Received *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      required
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">PO / Reference Number</Label>
                    <Input
                      id="reference"
                      name="reference"
                      placeholder="e.g., PO-2025-0118"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Optional notes about this shipment..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Processing..." : "Receive Inventory"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PackagePlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Search and select an item to receive</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
