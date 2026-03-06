"use server";

import { db } from "@/lib/db";
import { items, inventoryTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function receiveInventory(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));
  const reference = (formData.get("reference") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const performedBy = (formData.get("performedBy") as string) || null;

  if (!itemId || !quantity || quantity <= 0) {
    throw new Error("Invalid item or quantity");
  }

  const item = db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) throw new Error("Item not found");

  // Atomic transaction: update quantity + create record
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

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  redirect("/inventory");
}

export async function adjustInventory(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const quantity = Number(formData.get("quantity")); // can be negative
  const notes = (formData.get("notes") as string) || null;
  const performedBy = (formData.get("performedBy") as string) || null;

  if (!itemId) throw new Error("Invalid item");

  const item = db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) throw new Error("Item not found");

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
        type: "adjust",
        quantity,
        reference: null,
        notes,
        performedBy,
        createdAt: new Date().toISOString(),
      })
      .run();
  });
  runTransaction();

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
}
