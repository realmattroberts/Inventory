import { getAllJobs } from "@/lib/queries/jobs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const allJobs = getAllJobs(params.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">{allJobs.length} jobs</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Link href="/jobs">
          <Button variant={!params.status ? "default" : "outline"} size="sm">All</Button>
        </Link>
        <Link href="/jobs?status=open">
          <Button variant={params.status === "open" ? "default" : "outline"} size="sm">Open</Button>
        </Link>
        <Link href="/jobs?status=in_progress">
          <Button variant={params.status === "in_progress" ? "default" : "outline"} size="sm">In Progress</Button>
        </Link>
        <Link href="/jobs?status=completed">
          <Button variant={params.status === "completed" ? "default" : "outline"} size="sm">Completed</Button>
        </Link>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {allJobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer mb-4">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{job.customerName}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[job.status]}`}>
                        {statusLabels[job.status] || job.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{job.jobNumber}</p>
                    {job.description && (
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{formatCurrency(job.totalCost)}</p>
                    <p className="text-xs text-muted-foreground">{job.itemCount} items used</p>
                    <p className="text-xs text-muted-foreground">{formatDate(job.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {allJobs.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No jobs found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
