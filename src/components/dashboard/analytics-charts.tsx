"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MonthlyData = { month: string; totalSpent: number; totalItems: number };
type UsageData = { month: string; totalUsed: number; totalCost: number };
type CategoryData = { name: string; color: string | null; totalSpent: number };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function AnalyticsCharts({
  monthlySpending,
  monthlyUsage,
  categorySpending,
}: {
  monthlySpending: MonthlyData[];
  monthlyUsage: UsageData[];
  categorySpending: CategoryData[];
}) {
  const spendingData = monthlySpending.map((m) => ({
    name: formatMonth(m.month),
    spent: Math.round(m.totalSpent * 100) / 100,
  }));

  const usageData = monthlyUsage.map((m) => ({
    name: formatMonth(m.month),
    used: m.totalUsed,
    cost: Math.round(m.totalCost * 100) / 100,
  }));

  const pieData = categorySpending
    .filter((c) => c.totalSpent > 0)
    .map((c) => ({
      name: c.name,
      value: Math.round(c.totalSpent * 100) / 100,
      color: c.color || "#6B7280",
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Monthly Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending (Receiving)</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="spent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No spending data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage (Items Used on Jobs)</CardTitle>
        </CardHeader>
        <CardContent>
          {usageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="used" name="Units Used" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No usage data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Category Spending Pie Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No category data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
