import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { THIRD_PARTY_CATEGORIES } from "@/lib/thirdParties";
import { AddThirdPartyForm, ToggleActiveButton } from "@/components/ThirdPartyManager";

const DAY = 86_400_000;

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  const canManage = canManagePpp(session!.user.role);
  const all = await prisma.thirdParty.findMany({ orderBy: { name: "asc" } });
  const now = Date.now();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">Services</h1>
          <p className="mt-1 text-sm text-ink-600">Third-party services and suppliers</p>
        </div>
        {canManage && <AddThirdPartyForm />}
      </div>

      {all.length === 0 && (
        <div className="rounded-xl2 border border-dashed border-ink-700/15 bg-cream-100 py-10 text-center">
          <p className="text-sm text-ink-600">No services added yet.</p>
        </div>
      )}

      {THIRD_PARTY_CATEGORIES.map((cat) => {
        const rows = all.filter((r) => r.category === cat.code);
        if (rows.length === 0) return null;
        return (
          <section key={cat.code} className="mb-6">
            <h2 className="mb-2 font-display text-base font-semibold text-ink-800">{cat.label}</h2>
            <ul className="overflow-hidden rounded-xl2 border border-ink-700/10 bg-cream-100 shadow-card">
              {rows.map((r) => {
                const days = r.renewalDate ? Math.ceil((r.renewalDate.getTime() - now) / DAY) : null;
                const dueSoon = r.active && days !== null && days <= 30;
                return (
                  <li key={r.id} className={`flex flex-wrap items-start justify-between gap-3 border-b border-ink-700/10 px-4 py-3 text-sm last:border-b-0 ${r.active ? "" : "opacity-60"}`}>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-800">
                        {r.name}{!r.active && <span className="ml-2 text-xs font-normal text-ink-600">(inactive)</span>}
                      </p>
                      <p className="text-ink-600">
                        {[r.contactName, r.phone, r.email].filter(Boolean).join(" · ") || "No contact details"}
                      </p>
                      {r.notes && <p className="text-ink-700">{r.notes}</p>}
                      {r.renewalDate && (
                        <p className={dueSoon ? "font-medium text-coral-700" : "text-xs text-ink-600"}>
                          Renewal {r.renewalDate.toLocaleDateString("en-GB")}
                          {dueSoon && (days! < 0 ? ` · overdue by ${-days!} days` : ` · due in ${days} days`)}
                        </p>
                      )}
                    </div>
                    {canManage && <ToggleActiveButton id={r.id} active={r.active} />}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
