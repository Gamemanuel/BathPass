import { NextRequest, NextResponse } from "next/server";
import { DEMO_ORGANIZATIONS } from "@/lib/demo-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = DEMO_ORGANIZATIONS.find((o) => o.id === id);
  if (!org) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: org, error: null });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = DEMO_ORGANIZATIONS.find((o) => o.id === id);
  if (!org) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
  const body = await req.json();
  const updated = { ...org, ...body, id, updated_at: new Date().toISOString() };
  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = DEMO_ORGANIZATIONS.find((o) => o.id === id);
  if (!org) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: { id }, error: null });
}
