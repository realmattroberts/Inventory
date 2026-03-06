import type { items, categories, jobs, jobItems, inventoryTransactions } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Item = InferSelectModel<typeof items>;
export type Category = InferSelectModel<typeof categories>;
export type Job = InferSelectModel<typeof jobs>;
export type JobItem = InferSelectModel<typeof jobItems>;
export type InventoryTransaction = InferSelectModel<typeof inventoryTransactions>;

export type ItemWithCategory = Item & {
  category: Category | null;
};

export type JobWithItems = Job & {
  jobItems: (JobItem & { item: Item })[];
};

export type TransactionWithItem = InventoryTransaction & {
  item: Item;
};
