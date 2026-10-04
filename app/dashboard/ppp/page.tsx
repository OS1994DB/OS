import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageMedications } from "@/lib/permissions";
import { PpeStock } from "@/components/PpeStock";

export default async function PppPage() {
  const session = await getServerSession(authOptions);
  const [items, sums, recent] = await Promise.all([
    prisma.ppeItem.findMany({ orderBy: { name: "asc" } }),
    prisma.ppeMovement.groupBy({ by: ["itemId"], _sum: { change: true } }),
    prisma.ppeMovement.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { item: true, by: true } }),
  ]);
  const stock = new Map(sums.map((s) => [s.itemId, s._sum.change ?? 0]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">PPP</h1>
        <p className="mt-1 text-sm text-ink-600">Protective equipment stock — gloves, aprons, masks and more</p>
      </div>
      <PpeStock
        canManage={canManageMedications(session!.user.role)}
        items={items.map((i) => ({ id: i.id, name: i.name, unit: i.unit, reorderLevel: i.reorderLevel, stock: stock.get(i.id) ?? 0 }))}
      />
      <h2 className="mb-2 mt-8 font-display text-base font-semibold text-ink-800">Recent activity</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-ink-600">Nothing yet.</p>
      ) : (
        <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
          {recent.map((m) => (
            <li key={m.id} className="border-b border-ink-700/10 px-4 py-3 text-sm last:border-b-0">
              <span className="font-medium text-ink-800">{m.item.name}</span>{" "}
              <span className={m.change > 0 ? "text-brand-700" : "text-ink-700"}>{m.change > 0 ? `+${m.change}` : m.change}</span>
              <span className="text-ink-600"> · {m.createdAt.toLocaleString("en-GB")} · {m.by.name}</span>
              {m.note && <p className="text-ink-700">{m.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
