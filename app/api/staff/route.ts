import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALL_ROLES, canManageStaff } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const ROLES = ALL_ROLES;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseJsonBody(req);
  if (!parsed) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { name, email, password, role } = parsed as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };
  if (!name || !email || !password || !role || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, role },
  });

  await logAudit({
    userId: session.user.id,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    metadata: { role },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}
