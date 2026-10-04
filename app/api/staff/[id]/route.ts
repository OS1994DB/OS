import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { USERNAME_HELP, USERNAME_RE, normalizeUsername } from "@/lib/username";

// Manager-only: reset a staff member's password and/or (de)activate the account.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { password, active, username: rawUsername } = parsed as { password?: unknown; active?: unknown; username?: unknown };

  const data: { passwordHash?: string; active?: boolean; username?: string } = {};
  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }
  if (active !== undefined) {
    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    if (!active && id === session.user.id) {
      return NextResponse.json({ error: "You can't deactivate your own account" }, { status: 400 });
    }
    data.active = active;
  }
  if (rawUsername !== undefined) {
    const username = normalizeUsername(rawUsername);
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json({ error: `Username must be ${USERNAME_HELP}` }, { status: 400 });
    }
    const taken = await prisma.user.findUnique({ where: { username } });
    if (taken && taken.id !== id) {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
    }
    data.username = username;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.update({ where: { id: id }, data });

  if (data.passwordHash) {
    await logAudit({
      userId: session.user.id,
      action: "user.password_reset",
      entityType: "User",
      entityId: id,
    });
  }
  if (data.username) {
    await logAudit({
      userId: session.user.id,
      action: "user.rename",
      entityType: "User",
      entityId: id,
      metadata: { from: target.username, to: data.username },
    });
  }
  if (data.active !== undefined) {
    await logAudit({
      userId: session.user.id,
      action: data.active ? "user.reactivate" : "user.deactivate",
      entityType: "User",
      entityId: id,
    });
  }

  return NextResponse.json({ ok: true });
}
