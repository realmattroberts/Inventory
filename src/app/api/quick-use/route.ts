import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, inventoryTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { itemId, quantity, notes, performedBy } = body;

  if (!itemId || !quantity || quantity <= 0) {
    return NextResponse.json(
      { error: "Invalid item or quantity" },
      { status: 400 }
    );
  }

  const item = db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.quantity < quantity) {
    return NextResponse.json(
      {
        error: `Insufficient stock: have ${item.quantity}, trying to remove ${quantity}`,
      },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const runTransaction = db.$client.transaction(() => {
    db.update(items)
      .set({
        quantity: item.quantity - quantity,
        updatedAt: now,
      })
      .where(eq(items.id, itemId))
      .run();

    db.insert(inventoryTransactions)
      .values({
        itemId,
        type: "use",
        quantity: -quantity,
        reference: "Quick Use",
        notes: notes || "Removed without work order",
        performedBy: performedBy || null,
        createdAt: now,
      })
      .run();
  });
  runTransaction();

  return NextResponse.json({ success: true });
}
