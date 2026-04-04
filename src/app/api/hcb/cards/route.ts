import { NextRequest, NextResponse } from "next/server";
import { DEMO_CARDS } from "@/lib/demo-data";
import type { Card, CardType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const org_id = searchParams.get("org_id");
  const status = searchParams.get("status");

  let results = DEMO_CARDS as Card[];
  if (org_id) results = results.filter((c) => c.org_id === org_id);
  if (status) results = results.filter((c) => c.status === status);

  return NextResponse.json({ data: results, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { org_id, type, holder_name, last_four } = body as Partial<Card> & {
    type?: CardType;
  };

  if (!org_id || !holder_name || !last_four) {
    return NextResponse.json(
      { data: null, error: "org_id, holder_name, last_four are required" },
      { status: 400 }
    );
  }

  const newCard: Card = {
    id: `card_${Date.now()}`,
    org_id,
    status: "ACTIVE",
    type: type ?? "VIRTUAL",
    last_four,
    holder_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ data: newCard, error: null }, { status: 201 });
}
