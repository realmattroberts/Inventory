"use server";

import { db } from "@/lib/db";
import { jobs, jobItems, items, inventoryTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJob(formData: FormData) {
  const now = new Date().toISOString();

  const result = db
    .insert(jobs)
    .values({
      jobNumber: formData.get("jobNumber") as string,
      customerName: formData.get("customerName") as string,
      description: (formData.get("description") as string) || null,
      status: "open",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect(`/jobs/${result.lastInsertRowid}`);
}

export async function updateJobStatus(id: number, status: string) {
  db.update(jobs)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(jobs.id, id))
    .run();

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  revalidatePath("/dashboard");
}

export async function useItemsOnJob(
  jobId: number,
  itemsToUse: { itemId: number; quantity: number }[]
) {
  const now = new Date().toISOString();
  const job = db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) throw new Error("Job not found");

  const runTransaction = db.$client.transaction(() => {
    for (const { itemId, quantity } of itemsToUse) {
      const item = db.select().from(items).where(eq(items.id, itemId)).get();
      if (!item) throw new Error(`Item ${itemId} not found`);
      if (item.quantity < quantity) {
        throw new Error(
          `Insufficient stock for ${item.name}: have ${item.quantity}, need ${quantity}`
        );
      }

      // Deduct from inventory
      db.update(items)
        .set({
          quantity: item.quantity - quantity,
          updatedAt: now,
        })
        .where(eq(items.id, itemId))
        .run();

      // Create job item record
      db.insert(jobItems)
        .values({
          jobId,
          itemId,
          quantityUsed: quantity,
          createdAt: now,
        })
        .run();

      // Create transaction record
      db.insert(inventoryTransactions)
        .values({
          itemId,
          type: "use",
          quantity: -quantity,
          reference: job.jobNumber,
          notes: `Used on job: ${job.customerName}`,
          createdAt: now,
        })
        .run();
    }

    // Update job status to in_progress if currently open
    if (job.status === "open") {
      db.update(jobs)
        .set({ status: "in_progress", updatedAt: now })
        .where(eq(jobs.id, jobId))
        .run();
    }
  });
  runTransaction();

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
}
