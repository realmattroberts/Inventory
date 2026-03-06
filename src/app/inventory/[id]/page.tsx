import { getItemById, getItemTransactions } from "@/lib/queries/items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, ArrowDownToLine, ArrowUpFromLine, Wrench } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItemById(Number(id));
  if (!item) notFound();

  const transactions = getItemTransactions(Number(id));
  const isLowStock = item.minQuantity > 0 && item.quantity <= item.minQuantity;
  const stockValue = item.quantity * (item.price ?? 0);
  const costValue = item.quantity * (item.costPrice ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              {item.categoryName && (
                <Badge variant="outline" style={{ borderColor: item.categoryColor ?? undefined, color: item.categoryColor ?? undefined }}>
                  {item.categoryName}
                </Badge>
              )}
              {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
            </div>
            <p className="text-muted-foreground font-mono">{item.sku}</p>
          </div>
        </div>
        <Link href={`/inventory/${id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Item Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">SKU</dt>
                <dd className="font-mono font-medium">{item.sku}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">UPC</dt>
                <dd className="font-mono">{item.upc || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-muted-foreground">Description</dt>
                <dd>{item.description || "No description"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Location</dt>
                <dd>{item.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Category</dt>
                <dd>{item.categoryName || "Uncategorized"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Stock & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Stock & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Quantity on Hand</p>
              <p className={`text-3xl font-bold ${isLowStock ? "text-destructive" : ""}`}>
                {item.quantity.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">min: {item.minQuantity}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sell Price</p>
                <p className="text-lg font-semibold">{formatCurrency(item.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Price</p>
                <p className="text-lg font-semibold">{formatCurrency(item.costPrice)}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Stock Value (sell)</p>
              <p className="text-lg font-bold">{formatCurrency(stockValue)}</p>
              <p className="text-xs text-muted-foreground">cost: {formatCurrency(costValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <div className="mt-0.5">
                    {tx.type === "receive" && <ArrowDownToLine className="h-4 w-4 text-green-600" />}
                    {tx.type === "use" && <ArrowUpFromLine className="h-4 w-4 text-blue-600" />}
                    {tx.type === "adjust" && <Wrench className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={tx.type === "receive" ? "default" : tx.type === "use" ? "secondary" : "outline"}>
                        {tx.type}
                      </Badge>
                      <span className="font-medium text-sm">
                        {tx.quantity > 0 ? "+" : ""}{tx.quantity}
                      </span>
                      {tx.reference && (
                        <span className="text-xs text-muted-foreground">· {tx.reference}</span>
                      )}
                      {tx.performedBy && (
                        <span className="text-xs text-muted-foreground">· by {tx.performedBy}</span>
                      )}
                    </div>
                    {tx.notes && <p className="text-xs text-muted-foreground mt-1">{tx.notes}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
