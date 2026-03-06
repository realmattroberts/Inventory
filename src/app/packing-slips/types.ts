export type ReviewAction = "pending" | "confirmed" | "rematched" | "create_new" | "skipped";

export type ReviewItem = {
  originalSku: string;
  originalName: string;
  originalQuantity: number;
  // Editable fields
  sku: string;
  name: string;
  quantity: number;
  // Match state
  autoMatched: boolean;
  matchedItemId: number | null;
  matchedItemName: string | null;
  matchedItemSku: string | null;
  matchedItemQty: number | null;
  // Action
  action: ReviewAction;
  // For create_new
  newItemCategoryId: number | null;
  newItemDescription: string;
  newItemCostPrice: number | null;
  newItemLocation: string;
};

export type PackingSlipRecord = {
  id: number;
  fileName: string;
  rawText: string | null;
  parsedData: string | null;
  itemCount: number;
  totalQuantity: number;
  reference: string | null;
  performedBy: string | null;
  status: string;
  createdAt: string;
};

export type ParsedItem = {
  sku: string;
  name: string;
  quantity: number;
  matched: boolean;
  itemId?: number;
  willCreate?: boolean;
  // ReviewItem fields (stored after review workflow)
  action?: ReviewAction;
  matchedItemName?: string;
  matchedItemSku?: string;
};

export type ItemOption = {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  categoryId?: number | null;
};

export type Category = {
  id: number;
  name: string;
  color: string | null;
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
