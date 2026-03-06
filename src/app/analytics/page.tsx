import {
  getMonthlySpending,
  getMonthlyUsage,
  getTopItemsBySpend,
  getTopItemsByUsage,
  getCategorySpending,
  getCostPerJob,
  getActivityFeed,
} from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { ArrowDownToLine, ArrowUpFromLine, Wrench, Activity } from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function AnalyticsPage() {
  const monthlySpending = getMonthlySpending();
  const monthlyUsage = getMonthlyUsage();
  const topBySpend = getTopItemsBySpend(8);
  const topByUsage = getTopItemsByUsage(8);
  const categorySpending = getCategorySpending();
  const costPerJob = getCostPerJob();
  const activityFeed = getActivityFeed(50);

  const totalSpent = monthlySpending.reduce((s, m) => s + m.totalSpent, 0);
  const totalUsed = monthlyUsage.reduce((s, m) => s + m.totalUsed, 0);
  const totalUsageCost = monthlyUsage.reduce((s, m) => s + m.totalCost, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Spending, usage, and inventory insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent (Receiving)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">across all receiving orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">units used on jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUsageCost)}</div>
            <p className="text-xs text-muted-foreground">material cost on jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        monthlySpending={monthlySpending}
        monthlyUsage={monthlyUsage}
        categorySpending={categorySpending}
      />

      {/* Top Items Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Items by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm">
                  <th className="pb-2 text-left font-medium">Item</th>
                  <th className="pb-2 text-right font-medium">Qty Received</th>
                  <th className="pb-2 text-right font-medium">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topBySpend.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </td>
                    <td className="py-2 text-right text-sm">{item.totalReceived}</td>
                    <td className="py-2 text-right text-sm font-medium">{formatCurrency(item.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Items by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm">
                  <th className="pb-2 text-left font-medium">Item</th>
                  <th className="pb-2 text-right font-medium">Qty Used</th>
                  <th className="pb-2 text-right font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {topByUsage.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </td>
                    <td className="py-2 text-right text-sm">{item.totalUsed}</td>
                    <td className="py-2 text-right text-sm font-medium">{formatCurrency(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Cost Per Job */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Per Job</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm">
                <th className="pb-2 text-left font-medium">Job</th>
                <th className="pb-2 text-left font-medium">Customer</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Items Used</th>
                <th className="pb-2 text-right font-medium">Material Cost</th>
              </tr>
            </thead>
            <tbody>
              {costPerJob.map((job) => (
                <tr key={job.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-sm">{job.jobNumber}</td>
                  <td className="py-2 text-sm">{job.customerName}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.status === "completed" ? "bg-green-100 text-green-800" :
                      job.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {job.status === "in_progress" ? "In Progress" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-2 text-right text-sm">{job.totalItems}</td>
                  <td className="py-2 text-right text-sm font-medium">{formatCurrency(job.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity History
            <span className="text-sm font-normal text-muted-foreground">
              (last {activityFeed.length} transactions)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Action</th>
                    <th className="pb-2 text-left font-medium">Item</th>
                    <th className="pb-2 text-right font-medium">Qty</th>
                    <th className="pb-2 text-left font-medium">Reference</th>
                    <th className="pb-2 text-left font-medium">User</th>
                    <th className="pb-2 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {activityFeed.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          {tx.type === "receive" && <ArrowDownToLine className="h-3.5 w-3.5 text-green-600" />}
                          {tx.type === "use" && <ArrowUpFromLine className="h-3.5 w-3.5 text-blue-600" />}
                          {tx.type === "adjust" && <Wrench className="h-3.5 w-3.5 text-orange-600" />}
                          <Badge
                            variant={tx.type === "receive" ? "default" : tx.type === "use" ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {tx.type}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-2">
                        <Link href={`/inventory/${tx.itemId}`} className="hover:underline">
                          <p className="text-sm font-medium">{tx.itemName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{tx.itemSku}</p>
                        </Link>
                      </td>
                      <td className="py-2 text-right text-sm font-medium">
                        <span className={tx.quantity > 0 ? "text-green-700" : "text-red-700"}>
                          {tx.quantity > 0 ? "+" : ""}{tx.quantity}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground font-mono">
                        {tx.reference || "—"}
                      </td>
                      <td className="py-2 text-sm">
                        {tx.performedBy ? (
                          <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-medium">
                            {tx.performedBy}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground max-w-48 truncate">
                        {tx.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
