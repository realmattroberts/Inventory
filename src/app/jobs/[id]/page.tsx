import { getJobById } from "@/lib/queries/jobs";
import { updateJobStatus } from "@/lib/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJobById(Number(id));
  if (!job) notFound();

  async function markCompleted() {
    "use server";
    await updateJobStatus(Number(id), "completed");
  }

  async function markInProgress() {
    "use server";
    await updateJobStatus(Number(id), "in_progress");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{job.customerName}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                {statusLabels[job.status] || job.status}
              </span>
            </div>
            <p className="text-muted-foreground font-mono">{job.jobNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {job.status !== "completed" && (
            <Link href={`/jobs/${id}/use-items`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Use Items
              </Button>
            </Link>
          )}
          {job.status === "open" && (
            <form action={markInProgress}>
              <Button variant="outline">Start Job</Button>
            </form>
          )}
          {job.status === "in_progress" && (
            <form action={markCompleted}>
              <Button variant="outline">Mark Completed</Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Job Number</dt>
                <dd className="font-mono font-medium">{job.jobNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Customer</dt>
                <dd className="font-medium">{job.customerName}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-muted-foreground">Description</dt>
                <dd>{job.description || "No description"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Created</dt>
                <dd>{formatDate(job.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Last Updated</dt>
                <dd>{formatDate(job.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Items Used</p>
              <p className="text-2xl font-bold">
                {job.items.reduce((sum, ji) => sum + ji.quantityUsed, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Material Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(job.totalCost)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Used */}
      <Card>
        <CardHeader>
          <CardTitle>Items Used</CardTitle>
        </CardHeader>
        <CardContent>
          {job.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items used on this job yet.</p>
              {job.status !== "completed" && (
                <Link href={`/jobs/${id}/use-items`}>
                  <Button variant="outline" className="mt-3">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Items
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Item</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Qty Used</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Line Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {job.items.map((ji) => (
                    <tr key={ji.id} className="border-b">
                      <td className="px-4 py-3 font-mono text-sm">
                        <Link href={`/inventory/${ji.itemId}`} className="text-primary hover:underline">
                          {ji.itemSku}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{ji.itemName}</td>
                      <td className="px-4 py-3 text-right text-sm">{ji.quantityUsed}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatCurrency(ji.itemCostPrice)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {formatCurrency(ji.quantityUsed * (ji.itemCostPrice ?? 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(ji.createdAt)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-medium">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm">Total</td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(job.totalCost)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
