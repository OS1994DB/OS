import { prisma } from "@/lib/prisma";

export async function notifyStaff({
  body,
  residentId,
  createdById,
}: {
  body: string;
  residentId?: string;
  createdById: string;
}) {
  await prisma.staffMessage.create({ data: { body, residentId, createdById } });
}
