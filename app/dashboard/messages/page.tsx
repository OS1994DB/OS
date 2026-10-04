import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const messages = await prisma.staffMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: true, resident: true },
    take: 100,
  });

  await prisma.user.update({ where: { id: userId }, data: { lastMessagesSeenAt: new Date() } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Messages</h1>
        <p className="mt-1 text-sm text-ink-600">Updates for all staff — care plan changes and other notices.</p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No messages yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 shadow-card">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-600">{m.createdBy.name}</span>
                <span className="text-xs text-ink-600">{m.createdAt.toLocaleString("en-GB")}</span>
              </div>
              <p className="text-sm text-ink-800">{m.body}</p>
              {m.resident && (
                <Link
                  href={`/dashboard/residents/${m.resident.id}`}
                  className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View {m.resident.name} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
