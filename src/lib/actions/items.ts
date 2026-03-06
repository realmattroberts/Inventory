"use server";

import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createItem(formData: FormData) {
  const now = new Date().toISOString();

  db.insert(items)
    .values({
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      categoryId: formData.get("categoryId")
        ? Number(formData.get("categoryId"))
        : null,
      quantity: Number(formData.get("quantity") || 0),
      minQuantity: Number(formData.get("minQuantity") || 0),
      price: formData.get("price") ? Number(formData.get("price")) : null,
      costPrice: formData.get("costPrice")
        ? Number(formData.get("costPrice"))
        : null,
      upc: (formData.get("upc") as string) || null,
      location: (formData.get("location") as string) || null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  redirect("/inventory");
}

export async function updateItem(id: number, formData: FormData) {
  db.update(items)
    .set({
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      categoryId: formData.get("categoryId")
        ? Number(formData.get("categoryId"))
        : null,
      quantity: Number(formData.get("quantity") || 0),
      minQuantity: Number(formData.get("minQuantity") || 0),
      price: formData.get("price") ? Number(formData.get("price")) : null,
      costPrice: formData.get("costPrice")
        ? Number(formData.get("costPrice"))
        : null,
      upc: (formData.get("upc") as string) || null,
      location: (formData.get("location") as string) || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(items.id, id))
    .run();

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath("/dashboard");
  redirect(`/inventory/${id}`);
}

export async function deleteItem(id: number) {
  db.delete(items).where(eq(items.id, id)).run();

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  redirect("/inventory");
}
