import { getCategories } from "@/lib/queries/items";
import { createItem } from "@/lib/actions/items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewItemPage() {
  const categories = getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Item</h1>
          <p className="text-muted-foreground">Create a new inventory item</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" required placeholder="e.g., RES-10K-0805" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required placeholder="e.g., 10K Ohm Resistor" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Item description..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upc">UPC / Barcode</Label>
                <Input id="upc" name="upc" placeholder="e.g., 012345678905" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="0" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Minimum Quantity (reorder point)</Label>
                <Input id="minQuantity" name="minQuantity" type="number" min="0" defaultValue="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Sell Price ($) <span className="text-muted-foreground font-normal">optional</span></Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="Leave blank for tracking only" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price ($) <span className="text-muted-foreground font-normal">optional</span></Label>
                <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" placeholder="Leave blank for tracking only" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" name="location" placeholder="e.g., BIN-A1, SHELF-E2" />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Create Item</Button>
              <Link href="/inventory">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
