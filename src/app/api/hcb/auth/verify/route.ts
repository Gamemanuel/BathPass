import { NextRequest, NextResponse } from "next/server";
import { validateLoginCode } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, code } = body as { email?: string; code?: string };

  if (!email || !code) {
    return NextResponse.json(
      { data: null, error: "email and code are required" },
      { status: 400 }
    );
  }

  // Demo stub: accept any 6-digit code
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { data: null, error: "Invalid code format" },
      { status: 400 }
    );
  }

  // DEMO ONLY: In production, look up the stored code from the database
  // and verify against the submitted code. Never use a hardcoded code.
  // Remove this block entirely before deploying to production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { data: null, error: "Email login not yet configured" },
      { status: 501 }
    );
  }

  const demoCode = process.env.DEMO_LOGIN_CODE;
  if (!demoCode) {
    return NextResponse.json(
      { data: null, error: "DEMO_LOGIN_CODE env var not set" },
      { status: 500 }
    );
  }
  const DEMO_STORED_CODE = demoCode;
  const DEMO_EXPIRY = new Date(Date.now() + 10 * 60 * 1000);

  const result = validateLoginCode(code, DEMO_STORED_CODE, DEMO_EXPIRY);
  if (!result.valid) {
    return NextResponse.json(
      { data: null, error: result.reason ?? "Invalid code" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    data: { message: "Login successful", email },
    error: null,
  });
}
