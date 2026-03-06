import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color"), // hex color for UI badges
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  price: real("price"), // sell price
  costPrice: real("cost_price"), // what we pay
  upc: text("upc"),
  location: text("location"), // warehouse bin/location
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobNumber: text("job_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"), // open, in_progress, completed
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobItems = sqliteTable("job_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  quantityUsed: integer("quantity_used").notNull(),
  createdAt: text("created_at").notNull(),
});

export const inventoryTransactions = sqliteTable("inventory_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  type: text("type").notNull(), // 'receive', 'use', 'adjust'
  quantity: integer("quantity").notNull(), // positive = in, negative = out
  reference: text("reference"), // PO number, job number, etc.
  notes: text("notes"),
  performedBy: text("performed_by"), // which user performed this action
  createdAt: text("created_at").notNull(),
});

export const packingSlips = sqliteTable("packing_slips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fileName: text("file_name").notNull(),
  rawText: text("raw_text"),
  parsedData: text("parsed_data"), // JSON string of parsed items
  itemCount: integer("item_count").default(0),
  totalQuantity: integer("total_quantity").default(0),
  reference: text("reference"), // PO number from the slip
  performedBy: text("performed_by"), // which user scanned this slip
  status: text("status").notNull().default("pending"), // pending, processed
  createdAt: text("created_at").notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  transactions: many(inventoryTransactions),
  jobItems: many(jobItems),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  jobItems: many(jobItems),
}));

export const jobItemsRelations = relations(jobItems, ({ one }) => ({
  job: one(jobs, {
    fields: [jobItems.jobId],
    references: [jobs.id],
  }),
  item: one(items, {
    fields: [jobItems.itemId],
    references: [items.id],
  }),
}));

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    item: one(items, {
      fields: [inventoryTransactions.itemId],
      references: [items.id],
    }),
  })
);
