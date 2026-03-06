import { getItemById } from "@/lib/queries/items";
import { getCategories } from "@/lib/queries/items";
import { updateItem } from "@/lib/actions/items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItemById(Number(id));
  if (!item) notFound();

  const categories = getCategories();
  const updateWithId = updateItem.bind(null, Number(id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventory/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Item</h1>
          <p className="text-muted-foreground">{item.sku} - {item.name}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" required defaultValue={item.sku} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required defaultValue={item.name} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={item.description ?? ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={item.categoryId ?? ""}
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
                <Input id="upc" name="upc" defaultValue={item.upc ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="0" defaultValue={item.quantity} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Minimum Quantity</Label>
                <Input id="minQuantity" name="minQuantity" type="number" min="0" defaultValue={item.minQuantity} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Sell Price ($) <span className="text-muted-foreground font-normal">optional</span></Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={item.price ?? ""} placeholder="Leave blank for tracking only" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price ($) <span className="text-muted-foreground font-normal">optional</span></Label>
                <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" defaultValue={item.costPrice ?? ""} placeholder="Leave blank for tracking only" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" name="location" defaultValue={item.location ?? ""} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Save Changes</Button>
              <Link href={`/inventory/${id}`}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
