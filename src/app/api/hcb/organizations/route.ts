import { NextRequest, NextResponse } from "next/server";
import { DEMO_ORGANIZATIONS } from "@/lib/demo-data";
import type { Organization } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const status = searchParams.get("status") ?? "ALL";

  let results = DEMO_ORGANIZATIONS as Organization[];
  if (search) {
    results = results.filter(
      (o) =>
        o.name.toLowerCase().includes(search) ||
        o.slug.toLowerCase().includes(search)
    );
  }
  if (status !== "ALL") {
    results = results.filter((o) => o.status === status);
  }

  return NextResponse.json({ data: results, error: null });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, slug, description } = body as Partial<Organization>;

  if (!name || !slug) {
    return NextResponse.json(
      { data: null, error: "name and slug are required" },
      { status: 400 }
    );
  }

  const newOrg: Organization = {
    id: `org_${Date.now()}`,
    name,
    slug,
    description: description ?? null,
    balance: 0,
    status: "ACTIVE",
    created_by: "demo_user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 1,
  };

  return NextResponse.json({ data: newOrg, error: null }, { status: 201 });
}
