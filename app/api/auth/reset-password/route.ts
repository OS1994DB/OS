import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { hashToken } from "@/lib/resetToken";

export async function POST(req: Request) {
  const parsed = await parseJsonBody(req);
  const token = typeof parsed?.token === "string" ? parsed.token : "";
  const password = typeof parsed?.password === "string" ? parsed.password : "";
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const record = token
    ? await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } })
    : null;
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
  await logAudit({ userId: record.userId, action: "auth.password_reset", entityType: "User", entityId: record.userId });
  return NextResponse.json({ ok: true });
}
