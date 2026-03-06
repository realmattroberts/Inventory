import { NextRequest, NextResponse } from "next/server";
import { getAllItems } from "@/lib/queries/items";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const items = getAllItems(search).map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
  }));
  return NextResponse.json(items);
}
