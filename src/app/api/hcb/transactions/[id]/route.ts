import { NextRequest, NextResponse } from "next/server";
import { DEMO_TRANSACTIONS } from "@/lib/demo-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const txn = DEMO_TRANSACTIONS.find((t) => t.id === id);
  if (!txn) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: txn, error: null });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const txn = DEMO_TRANSACTIONS.find((t) => t.id === id);
  if (!txn) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  const updated = { ...txn, ...body, id, updated_at: new Date().toISOString() };
  return NextResponse.json({ data: updated, error: null });
}
