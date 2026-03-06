import { getAllItems } from "@/lib/queries/items";
import { getCategories } from "@/lib/queries/items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const categoryId = params.category ? Number(params.category) : undefined;
  const allItems = getAllItems(search, categoryId);
  const categories = getCategories();

  const totalValue = allItems.reduce(
    (sum, item) => sum + item.quantity * (item.price ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            {allItems.length} items · Total value:{" "}
            {formatCurrency(totalValue)}
          </p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by SKU, name, or UPC..."
                defaultValue={search}
                className="pl-10"
              />
            </div>
            <select
              name="category"
              defaultValue={params.category || ""}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Min</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">UPC</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item) => {
                  const isLowStock =
                    item.minQuantity > 0 && item.quantity <= item.minQuantity;
                  return (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="font-mono text-sm font-medium text-primary hover:underline"
                        >
                          {item.sku}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="text-sm hover:underline"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {item.categoryName && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: item.categoryColor ?? undefined,
                              color: item.categoryColor ?? undefined,
                            }}
                          >
                            {item.categoryName}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-medium text-sm ${
                            isLowStock
                              ? "text-destructive font-bold"
                              : ""
                          }`}
                        >
                          {item.quantity.toLocaleString()}
                        </span>
                        {isLowStock && (
                          <span className="ml-1 text-xs text-destructive">LOW</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        {item.minQuantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {item.upc || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.location || "—"}
                      </td>
                    </tr>
                  );
                })}
                {allItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No items found. Try adjusting your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
