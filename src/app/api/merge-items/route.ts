import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, inventoryTransactions, jobItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sourceItemId, targetItemId, performedBy } = body;

  if (!sourceItemId || !targetItemId) {
    return NextResponse.json(
      { error: "Both source and target item IDs are required" },
      { status: 400 }
    );
  }

  if (sourceItemId === targetItemId) {
    return NextResponse.json(
      { error: "Cannot merge an item with itself" },
      { status: 400 }
    );
  }

  const sourceItem = db
    .select()
    .from(items)
    .where(eq(items.id, sourceItemId))
    .get();

  const targetItem = db
    .select()
    .from(items)
    .where(eq(items.id, targetItemId))
    .get();

  if (!sourceItem) {
    return NextResponse.json(
      { error: "Source item not found" },
      { status: 404 }
    );
  }

  if (!targetItem) {
    return NextResponse.json(
      { error: "Target item not found" },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();

  const runTransaction = db.$client.transaction(() => {
    // 1. Transfer quantity from source to target
    db.update(items)
      .set({
        quantity: targetItem.quantity + sourceItem.quantity,
        updatedAt: now,
      })
      .where(eq(items.id, targetItemId))
      .run();

    // 2. Move all inventory transactions from source to target
    db.update(inventoryTransactions)
      .set({ itemId: targetItemId })
      .where(eq(inventoryTransactions.itemId, sourceItemId))
      .run();

    // 3. Move all job items from source to target
    db.update(jobItems)
      .set({ itemId: targetItemId })
      .where(eq(jobItems.itemId, sourceItemId))
      .run();

    // 4. Create a merge transaction record on the target item
    db.insert(inventoryTransactions)
      .values({
        itemId: targetItemId,
        type: "adjust",
        quantity: 0,
        reference: "Item Merge",
        notes: `Merged from "${sourceItem.name}" (${sourceItem.sku}). Transferred ${sourceItem.quantity} units, all transactions, and job records.`,
        performedBy: performedBy || null,
        createdAt: now,
      })
      .run();

    // 5. Delete the source item
    db.delete(items)
      .where(eq(items.id, sourceItemId))
      .run();
  });

  runTransaction();

  return NextResponse.json({
    success: true,
    message: `Merged "${sourceItem.name}" into "${targetItem.name}"`,
  });
}
