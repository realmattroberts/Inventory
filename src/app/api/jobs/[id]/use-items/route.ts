import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, jobs, jobItems, inventoryTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jobId = Number(id);
  const body = await request.json();
  const itemsToUse: { itemId: number; quantity: number }[] = body.items;
  const performedBy: string | null = body.performedBy || null;

  if (!itemsToUse || itemsToUse.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  const job = db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  try {
    const now = new Date().toISOString();
    const runTransaction = db.$client.transaction(() => {
      for (const { itemId, quantity } of itemsToUse) {
        const item = db.select().from(items).where(eq(items.id, itemId)).get();
        if (!item) throw new Error(`Item ${itemId} not found`);
        if (item.quantity < quantity) {
          throw new Error(`Insufficient stock for ${item.name}: have ${item.quantity}, need ${quantity}`);
        }

        db.update(items)
          .set({ quantity: item.quantity - quantity, updatedAt: now })
          .where(eq(items.id, itemId))
          .run();

        db.insert(jobItems)
          .values({ jobId, itemId, quantityUsed: quantity, createdAt: now })
          .run();

        db.insert(inventoryTransactions)
          .values({
            itemId,
            type: "use",
            quantity: -quantity,
            reference: job.jobNumber,
            notes: `Used on job: ${job.customerName}`,
            performedBy,
            createdAt: now,
          })
          .run();
      }

      if (job.status === "open") {
        db.update(jobs)
          .set({ status: "in_progress", updatedAt: now })
          .where(eq(jobs.id, jobId))
          .run();
      }
    });
    runTransaction();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to use items";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
