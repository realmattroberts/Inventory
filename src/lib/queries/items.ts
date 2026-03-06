import { db } from "@/lib/db";
import { items, categories, inventoryTransactions } from "@/lib/db/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

export function getAllItems(search?: string, categoryId?: number) {
  let query = db
    .select({
      id: items.id,
      sku: items.sku,
      name: items.name,
      description: items.description,
      quantity: items.quantity,
      minQuantity: items.minQuantity,
      price: items.price,
      costPrice: items.costPrice,
      upc: items.upc,
      location: items.location,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
      categoryId: items.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id));

  const conditions = [];

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        like(items.sku, searchPattern),
        like(items.name, searchPattern),
        like(items.upc, searchPattern),
        like(items.description, searchPattern)
      )
    );
  }

  if (categoryId) {
    conditions.push(eq(items.categoryId, categoryId));
  }

  if (conditions.length > 0) {
    query = query.where(sql.join(conditions, sql` AND `)) as typeof query;
  }

  return query.orderBy(items.name).all();
}

export function getItemById(id: number) {
  return db
    .select({
      id: items.id,
      sku: items.sku,
      name: items.name,
      description: items.description,
      quantity: items.quantity,
      minQuantity: items.minQuantity,
      price: items.price,
      costPrice: items.costPrice,
      upc: items.upc,
      location: items.location,
      imageUrl: items.imageUrl,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
      categoryId: items.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(eq(items.id, id))
    .get();
}

export function getItemTransactions(itemId: number) {
  return db
    .select()
    .from(inventoryTransactions)
    .where(eq(inventoryTransactions.itemId, itemId))
    .orderBy(desc(inventoryTransactions.createdAt))
    .all();
}

export function getCategories() {
  return db.select().from(categories).orderBy(categories.name).all();
}
