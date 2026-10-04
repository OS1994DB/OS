import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAddAssessments } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { parseJsonBody } from "@/lib/request";

const KINDS: readonly string[] = ["GENERAL", "RISK"];
const RISK_LEVELS: readonly string[] = ["LOW", "MEDIUM", "HIGH"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAddAssessments(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await parseJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { kind, title, riskLevel, findings, reviewDate } = body as {
    kind?: string;
    title?: string;
    riskLevel?: string;
    findings?: string;
    reviewDate?: string;
  };

  if (!kind || !KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || !findings || typeof findings !== "string") {
    return NextResponse.json({ error: "Missing title or findings" }, { status: 400 });
  }
  if (kind === "RISK" && (!riskLevel || !RISK_LEVELS.includes(riskLevel))) {
    return NextResponse.json({ error: "Risk assessments require a risk level" }, { status: 400 });
  }

  const assessment = await prisma.assessment.create({
    data: {
      residentId: id,
      kind,
      title,
      riskLevel: kind === "RISK" ? riskLevel : null,
      findings,
      reviewDate: reviewDate ? new Date(reviewDate) : null,
      completedById: session.user.id,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: kind === "RISK" ? "risk_assessment.create" : "assessment.create",
    entityType: "Assessment",
    entityId: assessment.id,
    metadata: { residentId: id, title, riskLevel: assessment.riskLevel },
  });

  return NextResponse.json(assessment, { status: 201 });
}
