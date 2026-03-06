import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { packingSlips } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET - Get a single packing slip by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const slip = db
    .select()
    .from(packingSlips)
    .where(eq(packingSlips.id, Number(id)))
    .get();

  if (!slip) {
    return NextResponse.json(
      { error: "Packing slip not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(slip);
}

// PATCH - Update a packing slip (rename, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { fileName } = body;

  if (!fileName || !fileName.trim()) {
    return NextResponse.json(
      { error: "File name is required" },
      { status: 400 }
    );
  }

  const existing = db
    .select()
    .from(packingSlips)
    .where(eq(packingSlips.id, Number(id)))
    .get();

  if (!existing) {
    return NextResponse.json(
      { error: "Packing slip not found" },
      { status: 404 }
    );
  }

  db.update(packingSlips)
    .set({ fileName: fileName.trim() })
    .where(eq(packingSlips.id, Number(id)))
    .run();

  return NextResponse.json({ success: true });
}
