import { NextRequest, NextResponse } from "next/server";
import { generateLoginCode, getCodeExpiry } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body as { email?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { data: null, error: "A valid email is required" },
      { status: 400 }
    );
  }

  const code = generateLoginCode();
  const expires_at = getCodeExpiry();

  // In production: persist code to DB and send email
  // For demo: just return success (never return the code in prod)
  console.log(`[DEV] Login code for ${email}: ${code}`);

  return NextResponse.json({
    data: { message: "Login code sent", expires_at: expires_at.toISOString() },
    error: null,
  });
}
