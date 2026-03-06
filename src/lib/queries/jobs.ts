import { db } from "@/lib/db";
import { jobs, jobItems, items } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export function getAllJobs(status?: string) {
  let query = db
    .select({
      id: jobs.id,
      jobNumber: jobs.jobNumber,
      customerName: jobs.customerName,
      description: jobs.description,
      status: jobs.status,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      itemCount: sql<number>`(SELECT count(*) FROM job_items WHERE job_items.job_id = jobs.id)`,
      totalCost: sql<number>`(SELECT coalesce(sum(ji.quantity_used * i.cost_price), 0) FROM job_items ji JOIN items i ON ji.item_id = i.id WHERE ji.job_id = jobs.id)`,
    })
    .from(jobs);

  if (status) {
    query = query.where(eq(jobs.status, status)) as typeof query;
  }

  return query.orderBy(desc(jobs.createdAt)).all();
}

export function getJobById(id: number) {
  const job = db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .get();

  if (!job) return null;

  const jobItemsList = db
    .select({
      id: jobItems.id,
      quantityUsed: jobItems.quantityUsed,
      createdAt: jobItems.createdAt,
      itemId: items.id,
      itemSku: items.sku,
      itemName: items.name,
      itemPrice: items.price,
      itemCostPrice: items.costPrice,
    })
    .from(jobItems)
    .innerJoin(items, eq(jobItems.itemId, items.id))
    .where(eq(jobItems.jobId, id))
    .orderBy(desc(jobItems.createdAt))
    .all();

  const totalCost = jobItemsList.reduce(
    (sum, ji) => sum + ji.quantityUsed * (ji.itemCostPrice ?? 0),
    0
  );

  return { ...job, items: jobItemsList, totalCost };
}
