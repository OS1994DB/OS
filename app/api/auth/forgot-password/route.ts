import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { hashToken } from "@/lib/resetToken";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 60 * 60 * 1000;

// Always answers the same way so the endpoint can't be used to discover
// which email addresses have accounts.
export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  const email = typeof parsed?.email === "string" ? parsed.email.toLowerCase().trim() : "";
  const generic = NextResponse.json({ ok: true });
  if (!email) return generic;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return generic;

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  await logAudit({ userId: user.id, action: "auth.reset_requested", entityType: "User", entityId: user.id });

  const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
  await sendMail(
    user.email,
    "Reset your password",
    `Hello ${user.name},\n\nUse this link to choose a new password (valid for 1 hour):\n${base}/reset-password?token=${token}\n\nIf you didn't ask for this, ignore this email.`,
  );
  return generic;
}
