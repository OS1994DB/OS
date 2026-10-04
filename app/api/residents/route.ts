import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageResidents } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageResidents(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await parseJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { name, dateOfBirth, roomNumber, keyContactName, keyContactPhone } = body as {
    name?: string;
    dateOfBirth?: string;
    roomNumber?: string;
    keyContactName?: string;
    keyContactPhone?: string;
  };

  if (!name || !dateOfBirth || !roomNumber || !keyContactName || !keyContactPhone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const resident = await prisma.resident.create({
    data: {
      name,
      dateOfBirth: new Date(dateOfBirth),
      roomNumber,
      keyContactName,
      keyContactPhone,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: "resident.create",
    entityType: "Resident",
    entityId: resident.id,
  });

  return NextResponse.json(resident, { status: 201 });
}
