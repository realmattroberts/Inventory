import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packingSlips } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// GET - List all packing slips
export async function GET() {
  const slips = db
    .select()
    .from(packingSlips)
    .orderBy(desc(packingSlips.createdAt))
    .all();

  return NextResponse.json(slips);
}

// POST - Save a processed packing slip
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fileName, rawText, parsedData, itemCount, totalQuantity, reference, performedBy } = body;

  if (!fileName) {
    return NextResponse.json(
      { error: "File name is required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const result = db
    .insert(packingSlips)
    .values({
      fileName,
      rawText: rawText || null,
      parsedData: parsedData ? JSON.stringify(parsedData) : null,
      itemCount: itemCount || 0,
      totalQuantity: totalQuantity || 0,
      reference: reference || null,
      performedBy: performedBy || null,
      status: "processed",
      createdAt: now,
    })
    .run();

  return NextResponse.json({
    success: true,
    id: Number(result.lastInsertRowid),
  });
}
