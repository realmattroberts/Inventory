import { getDashboardStats, getLowStockItems, getRecentTransactions, getCategoryBreakdown } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Boxes, DollarSign, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Wrench } from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function DashboardPage() {
  const stats = getDashboardStats();
  const lowStockItems = getLowStockItems();
  const recentTransactions = getRecentTransactions(10);
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">unique items tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">items in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">cost: {formatCurrency(stats.totalCostValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">items need restock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">All items are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{item.sku}</span>
                        {item.categoryName && (
                          <Badge variant="outline" style={{ borderColor: item.categoryColor ?? undefined }} className="text-xs">
                            {item.categoryName}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{item.quantity}</p>
                      <p className="text-xs text-muted-foreground">min: {item.minQuantity}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5">
                    {tx.type === "receive" && <ArrowDownToLine className="h-4 w-4 text-green-600" />}
                    {tx.type === "use" && <ArrowUpFromLine className="h-4 w-4 text-blue-600" />}
                    {tx.type === "adjust" && <Wrench className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tx.itemName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.type === "receive" && `+${tx.quantity} received`}
                      {tx.type === "use" && `${tx.quantity} used`}
                      {tx.type === "adjust" && `${tx.quantity > 0 ? "+" : ""}${tx.quantity} adjusted`}
                      {tx.reference && ` · ${tx.reference}`}
                      {tx.performedBy && ` · by ${tx.performedBy}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color ?? "#6B7280" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cat.itemCount} items · {formatCurrency(cat.totalValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
