import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/request";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json(
    rows.reverse().map((m) => ({ id: m.id, body: m.body, createdAt: m.createdAt.toISOString(), author: m.author })),
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = await parseJsonBody(req);
  const body = typeof parsed?.body === "string" ? parsed.body.trim() : "";
  if (!body || body.length > 2000) {
    return NextResponse.json({ error: "Message must be 1–2000 characters" }, { status: 400 });
  }
  const m = await prisma.chatMessage.create({ data: { body, authorId: session.user.id } });
  return NextResponse.json({ id: m.id }, { status: 201 });
}
