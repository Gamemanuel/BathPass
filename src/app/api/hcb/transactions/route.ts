import { NextRequest, NextResponse } from "next/server";
import { DEMO_TRANSACTIONS } from "@/lib/demo-data";
import type { Transaction, TransactionType, TransactionStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const org_id = searchParams.get("org_id");
  const type = searchParams.get("type") as TransactionType | null;
  const status = searchParams.get("status") as TransactionStatus | null;

  let results = DEMO_TRANSACTIONS as Transaction[];
  if (org_id) results = results.filter((t) => t.org_id === org_id);
  if (type) results = results.filter((t) => t.type === type);
  if (status) results = results.filter((t) => t.status === status);

  return NextResponse.json({
    data: { items: results, total: results.length },
    error: null,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { org_id, type, amount, description, date } = body as Partial<Transaction>;

  if (!org_id || !type || amount === undefined || amount === null || !description || !date) {
    return NextResponse.json(
      { data: null, error: "org_id, type, amount, description, date are required" },
      { status: 400 }
    );
  }

  const newTxn: Transaction = {
    id: `txn_${Date.now()}`,
    org_id,
    type,
    amount,
    description,
    status: "PENDING",
    date,
    created_by: "demo_user",
    receipt_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ data: newTxn, error: null }, { status: 201 });
}
