import { NextRequest, NextResponse } from "next/server";
import { DEMO_CARDS } from "@/lib/demo-data";
import type { CardStatus } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const card = DEMO_CARDS.find((c) => c.id === id);
  if (!card) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: card, error: null });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const card = DEMO_CARDS.find((c) => c.id === id);
  if (!card) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status } = body as { status?: CardStatus };

  if (status && !["ACTIVE", "FROZEN", "CANCELLED"].includes(status)) {
    return NextResponse.json(
      { data: null, error: "Invalid status" },
      { status: 400 }
    );
  }

  const updated = { ...card, ...body, id, updated_at: new Date().toISOString() };
  return NextResponse.json({ data: updated, error: null });
}
