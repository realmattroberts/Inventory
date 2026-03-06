import { db } from "@/lib/db";
import { items, categories, inventoryTransactions } from "@/lib/db/schema";
import { sql, eq, lte, desc } from "drizzle-orm";

export function getDashboardStats() {
  const totalItems = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .get();

  const totalUnits = db
    .select({ total: sql<number>`coalesce(sum(${items.quantity}), 0)` })
    .from(items)
    .get();

  const totalValue = db
    .select({
      value: sql<number>`coalesce(sum(${items.quantity} * ${items.price}), 0)`,
    })
    .from(items)
    .get();

  const totalCostValue = db
    .select({
      value: sql<number>`coalesce(sum(${items.quantity} * ${items.costPrice}), 0)`,
    })
    .from(items)
    .get();

  const lowStockCount = db
    .select({ count: sql<number>`count(*)` })
    .from(items)
    .where(sql`${items.quantity} <= ${items.minQuantity} AND ${items.minQuantity} > 0`)
    .get();

  return {
    totalItems: totalItems?.count ?? 0,
    totalUnits: totalUnits?.total ?? 0,
    totalValue: totalValue?.value ?? 0,
    totalCostValue: totalCostValue?.value ?? 0,
    lowStockCount: lowStockCount?.count ?? 0,
  };
}

export function getLowStockItems() {
  return db
    .select({
      id: items.id,
      sku: items.sku,
      name: items.name,
      quantity: items.quantity,
      minQuantity: items.minQuantity,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .where(sql`${items.quantity} <= ${items.minQuantity} AND ${items.minQuantity} > 0`)
    .orderBy(sql`${items.quantity} * 1.0 / ${items.minQuantity}`)
    .all();
}

export function getRecentTransactions(limit: number = 10) {
  return db
    .select({
      id: inventoryTransactions.id,
      type: inventoryTransactions.type,
      quantity: inventoryTransactions.quantity,
      reference: inventoryTransactions.reference,
      notes: inventoryTransactions.notes,
      performedBy: inventoryTransactions.performedBy,
      createdAt: inventoryTransactions.createdAt,
      itemName: items.name,
      itemSku: items.sku,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .orderBy(desc(inventoryTransactions.createdAt))
    .limit(limit)
    .all();
}

export function getCategoryBreakdown() {
  return db
    .select({
      name: categories.name,
      color: categories.color,
      itemCount: sql<number>`count(${items.id})`,
      totalQuantity: sql<number>`coalesce(sum(${items.quantity}), 0)`,
      totalValue: sql<number>`coalesce(sum(${items.quantity} * ${items.price}), 0)`,
    })
    .from(categories)
    .leftJoin(items, eq(categories.id, items.categoryId))
    .groupBy(categories.id)
    .orderBy(desc(sql`coalesce(sum(${items.quantity} * ${items.price}), 0)`))
    .all();
}
