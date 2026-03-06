import { db } from "@/lib/db";
import { items, categories, inventoryTransactions, jobs, jobItems, packingSlips } from "@/lib/db/schema";
import { sql, eq, desc, and, gte, lte } from "drizzle-orm";

export function getMonthlySpending() {
  return db
    .select({
      month: sql<string>`strftime('%Y-%m', ${inventoryTransactions.createdAt})`,
      totalSpent: sql<number>`coalesce(sum(${inventoryTransactions.quantity} * ${items.costPrice}), 0)`,
      totalItems: sql<number>`sum(${inventoryTransactions.quantity})`,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .where(eq(inventoryTransactions.type, "receive"))
    .groupBy(sql`strftime('%Y-%m', ${inventoryTransactions.createdAt})`)
    .orderBy(sql`strftime('%Y-%m', ${inventoryTransactions.createdAt})`)
    .all();
}

export function getMonthlyUsage() {
  return db
    .select({
      month: sql<string>`strftime('%Y-%m', ${inventoryTransactions.createdAt})`,
      totalUsed: sql<number>`coalesce(sum(abs(${inventoryTransactions.quantity})), 0)`,
      totalCost: sql<number>`coalesce(sum(abs(${inventoryTransactions.quantity}) * ${items.costPrice}), 0)`,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .where(eq(inventoryTransactions.type, "use"))
    .groupBy(sql`strftime('%Y-%m', ${inventoryTransactions.createdAt})`)
    .orderBy(sql`strftime('%Y-%m', ${inventoryTransactions.createdAt})`)
    .all();
}

export function getTopItemsBySpend(limit: number = 10) {
  return db
    .select({
      id: items.id,
      sku: items.sku,
      name: items.name,
      totalSpent: sql<number>`coalesce(sum(${inventoryTransactions.quantity} * ${items.costPrice}), 0)`,
      totalReceived: sql<number>`sum(${inventoryTransactions.quantity})`,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .where(eq(inventoryTransactions.type, "receive"))
    .groupBy(items.id)
    .orderBy(desc(sql`coalesce(sum(${inventoryTransactions.quantity} * ${items.costPrice}), 0)`))
    .limit(limit)
    .all();
}

export function getTopItemsByUsage(limit: number = 10) {
  return db
    .select({
      id: items.id,
      sku: items.sku,
      name: items.name,
      totalUsed: sql<number>`coalesce(sum(abs(${inventoryTransactions.quantity})), 0)`,
      totalCost: sql<number>`coalesce(sum(abs(${inventoryTransactions.quantity}) * ${items.costPrice}), 0)`,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .where(eq(inventoryTransactions.type, "use"))
    .groupBy(items.id)
    .orderBy(desc(sql`coalesce(sum(abs(${inventoryTransactions.quantity})), 0)`))
    .limit(limit)
    .all();
}

export function getCategorySpending() {
  return db
    .select({
      name: categories.name,
      color: categories.color,
      totalSpent: sql<number>`coalesce(sum(${inventoryTransactions.quantity} * ${items.costPrice}), 0)`,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .innerJoin(categories, eq(items.categoryId, categories.id))
    .where(eq(inventoryTransactions.type, "receive"))
    .groupBy(categories.id)
    .orderBy(desc(sql`coalesce(sum(${inventoryTransactions.quantity} * ${items.costPrice}), 0)`))
    .all();
}

export function getCostPerJob() {
  return db
    .select({
      id: jobs.id,
      jobNumber: jobs.jobNumber,
      customerName: jobs.customerName,
      status: jobs.status,
      totalCost: sql<number>`coalesce(sum(${jobItems.quantityUsed} * ${items.costPrice}), 0)`,
      totalItems: sql<number>`sum(${jobItems.quantityUsed})`,
    })
    .from(jobs)
    .innerJoin(jobItems, eq(jobs.id, jobItems.jobId))
    .innerJoin(items, eq(jobItems.itemId, items.id))
    .groupBy(jobs.id)
    .orderBy(desc(sql`coalesce(sum(${jobItems.quantityUsed} * ${items.costPrice}), 0)`))
    .all();
}

export function getActivityFeed(limit: number = 50) {
  return db
    .select({
      id: inventoryTransactions.id,
      type: inventoryTransactions.type,
      quantity: inventoryTransactions.quantity,
      reference: inventoryTransactions.reference,
      notes: inventoryTransactions.notes,
      performedBy: inventoryTransactions.performedBy,
      createdAt: inventoryTransactions.createdAt,
      itemId: items.id,
      itemName: items.name,
      itemSku: items.sku,
    })
    .from(inventoryTransactions)
    .innerJoin(items, eq(inventoryTransactions.itemId, items.id))
    .orderBy(desc(inventoryTransactions.createdAt))
    .limit(limit)
    .all();
}
