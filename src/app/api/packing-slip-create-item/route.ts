import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items, inventoryTransactions } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sku, name, quantity, reference, notes, performedBy, categoryId, costPrice, location, description } = body;

  if (!sku || !name || !quantity || quantity <= 0) {
    return NextResponse.json(
      { error: "SKU, name, and quantity are required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  let newItemId: number | undefined;

  const runTransaction = db.$client.transaction(() => {
    // Create the new item with quantity and optional fields from review
    const result = db
      .insert(items)
      .values({
        sku,
        name,
        description: description || `Auto-created from packing slip`,
        categoryId: categoryId || null,
        quantity,
        minQuantity: 0,
        price: null,
        costPrice: costPrice || null,
        location: location || null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    newItemId = Number(result.lastInsertRowid);

    // Create a receive transaction for the initial quantity
    db.insert(inventoryTransactions)
      .values({
        itemId: newItemId,
        type: "receive",
        quantity,
        reference: reference || "Packing Slip",
        notes: notes || `Auto-created and received from packing slip scan`,
        performedBy: performedBy || null,
        createdAt: now,
      })
      .run();
  });

  runTransaction();

  return NextResponse.json({
    success: true,
    itemId: newItemId,
    message: `Created new item "${name}" (${sku}) with ${quantity} units`,
  });
}
