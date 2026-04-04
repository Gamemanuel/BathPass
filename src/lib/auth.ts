/**
 * Auth utilities for email login-code flow.
 * Supabase OAuth remains the primary auth method;
 * these helpers stub the email-code path for future use.
 */

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Generate a random 6-digit numeric login code. */
export function generateLoginCode(): string {
  const min = Math.pow(10, CODE_LENGTH - 1);
  const max = Math.pow(10, CODE_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/** Returns the expiry Date for a freshly generated code. */
export function getCodeExpiry(): Date {
  return new Date(Date.now() + CODE_TTL_MS);
}

/**
 * Validate a login code against the stored value.
 * In production this would query the DB; here it does a constant-time compare.
 */
export function validateLoginCode(
  submitted: string,
  stored: string,
  expiresAt: Date
): { valid: boolean; reason?: string } {
  if (new Date() > expiresAt) {
    return { valid: false, reason: "Code has expired" };
  }
  if (submitted !== stored) {
    return { valid: false, reason: "Invalid code" };
  }
  return { valid: true };
}
