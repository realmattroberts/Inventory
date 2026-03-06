"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { ReviewItem, Category } from "../types";

const CATEGORY_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#6B7280", "#14B8A6", "#F43F5E",
];

type ItemCreateInlineProps = {
  item: ReviewItem;
  index: number;
  onSave: (index: number, updates: Partial<ReviewItem>) => void;
  onCancel: () => void;
};

export function ItemCreateInline({
  item,
  index,
  onSave,
  onCancel,
}: ItemCreateInlineProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState(item.newItemDescription || "");
  const [costPrice, setCostPrice] = useState(
    item.newItemCostPrice !== null ? String(item.newItemCostPrice) : ""
  );
  const [location, setLocation] = useState(item.newItemLocation || "");
  const [sku, setSku] = useState(item.sku);
  const [name, setName] = useState(item.name);

  // New category inline creation
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6B7280");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch {
        console.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

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
        setCategories((prev) =>
          [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
        );
        setCategoryId(String(cat.id));
        setShowNewCategory(false);
        setNewCategoryName("");
        setNewCategoryColor("#6B7280");
      }
    } catch {
      console.error("Failed to create category");
    }
    setCreatingCategory(false);
  };

  const handleSave = () => {
    onSave(index, {
      sku: sku.trim() || item.sku,
      name: name.trim() || item.name,
      action: "create_new",
      newItemCategoryId: categoryId ? Number(categoryId) : null,
      newItemDescription: description.trim(),
      newItemCostPrice: costPrice ? Number(costPrice) : null,
      newItemLocation: location.trim(),
    });
  };

  return (
    <div className="rounded-lg border-2 border-purple-300 bg-purple-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-purple-800 flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Create New Item
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">SKU</Label>
          <Input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="h-8 text-sm"
        />
      </div>

      {/* Category with inline create */}
      <div className="space-y-1">
        <Label className="text-xs">Category</Label>
        {showNewCategory ? (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="h-8 text-sm"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleCreateCategory())
                }
                autoFocus
              />
            </div>
            <div className="flex gap-0.5">
              {CATEGORY_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCategoryColor(c)}
                  className={`h-5 w-5 rounded-full border-2 transition-transform ${
                    newCategoryColor === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
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
              className="h-8 text-xs"
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
              className="h-8"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm h-8"
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
              className="h-8 shrink-0 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              New
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Cost Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="Optional"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., BIN-A1"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Button
        size="sm"
        className="w-full bg-purple-600 hover:bg-purple-700"
        onClick={handleSave}
        disabled={!sku.trim() || !name.trim()}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Confirm New Item
      </Button>
    </div>
  );
}
