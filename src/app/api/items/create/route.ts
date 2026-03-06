import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    sku,
    name,
    description,
    categoryId,
    price,
    costPrice,
    location,
    minQuantity,
  } = body;

  if (!sku || !name) {
    return NextResponse.json(
      { error: "SKU and Name are required" },
      { status: 400 }
    );
  }

  // Check for duplicate SKU
  const existing = db
    .select({ id: items.id })
    .from(items)
    .where(eq(items.sku, sku.trim()))
    .get();

  if (existing) {
    return NextResponse.json(
      { error: `An item with SKU "${sku}" already exists` },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();

  const result = db
    .insert(items)
    .values({
      sku: sku.trim(),
      name: name.trim(),
      description: description || null,
      categoryId: categoryId || null,
      quantity: 0,
      minQuantity: minQuantity || 0,
      price: price ?? null,
      costPrice: costPrice ?? null,
      location: location || null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const newId = Number(result.lastInsertRowid);

  return NextResponse.json({
    id: newId,
    sku: sku.trim(),
    name: name.trim(),
  });
}
