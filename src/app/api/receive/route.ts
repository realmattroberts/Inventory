import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, inventoryTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const itemId = Number(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));
  const reference = (formData.get("reference") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const performedBy = (formData.get("performedBy") as string) || null;

  if (!itemId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Invalid item or quantity" }, { status: 400 });
  }

  const item = db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const runTransaction = db.$client.transaction(() => {
    db.update(items)
      .set({
        quantity: item.quantity + quantity,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(items.id, itemId))
      .run();

    db.insert(inventoryTransactions)
      .values({
        itemId,
        type: "receive",
        quantity,
        reference,
        notes,
        performedBy,
        createdAt: new Date().toISOString(),
      })
      .run();
  });
  runTransaction();

  return NextResponse.json({ success: true });
}
