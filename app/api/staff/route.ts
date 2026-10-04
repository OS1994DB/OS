import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALL_ROLES, canManageStaff } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";
import { USERNAME_RE, normalizeUsername } from "@/lib/username";

const ROLES = ALL_ROLES;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { name, username: rawUsername, password, role } = parsed as {
    name?: string;
    username?: string;
    password?: string;
    role?: string;
  };
  const username = normalizeUsername(rawUsername);
  if (!name || !username || !password || !role || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–30 characters: lowercase letters, numbers, dots, dashes or underscores" },
      { status: 400 },
    );
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, username, passwordHash, role },
  });

  await logAudit({
    userId: session.user.id,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    metadata: { role },
  });

  return NextResponse.json({ id: user.id, name: user.name, username: user.username, role: user.role }, { status: 201 });
}
