import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export async function GET() {
  const all = db.select().from(categories).orderBy(categories.name).all();
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, color } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Category name is required" },
      { status: 400 }
    );
  }

  const result = db
    .insert(categories)
    .values({
      name: name.trim(),
      description: null,
      color: color || "#6B7280",
    })
    .run();

  const newId = Number(result.lastInsertRowid);

  return NextResponse.json({
    id: newId,
    name: name.trim(),
    color: color || "#6B7280",
  });
}
