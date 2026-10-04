import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { BackLink } from "@/components/BackLink";
import { DeleteFolderButton, PppActions, PppFileList } from "@/components/PppLibrary";

export default async function PppPage({ searchParams }: { searchParams: Promise<{ folder?: string }> }) {
  const { folder } = await searchParams;
  const session = await getServerSession(authOptions);
  const canManage = canManagePpp(session!.user.role);

  const allFolders = await prisma.pppFolder.findMany({ orderBy: { name: "asc" } });
  const byId = new Map(allFolders.map((f) => [f.id, f]));
  const pathOf = (id: string): string => {
    const parts: string[] = [];
    for (let cur = byId.get(id); cur; cur = cur.parentId ? byId.get(cur.parentId) : undefined) parts.unshift(cur.name);
    return parts.join(" / ");
  };

  const current = folder ? byId.get(folder) : null;
  if (folder && !current) notFound();
  const currentId = current?.id ?? null;
  const parent = current?.parentId ? byId.get(current.parentId) : null;

  const crumbs: { id: string; name: string }[] = [];
  for (let cur = current; cur; cur = cur.parentId ? byId.get(cur.parentId) : undefined) crumbs.unshift({ id: cur.id, name: cur.name });

  const subfolders = allFolders.filter((f) => f.parentId === currentId);
  const files = await prisma.pppFile.findMany({
    where: { folderId: currentId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, size: true, createdAt: true, uploadedBy: { select: { name: true } } },
  });

  return (
    <div>
      {current && (
        <BackLink
          href={parent ? `/dashboard/ppp?folder=${parent.id}` : "/dashboard/ppp"}
          label={parent ? parent.name : "PPP"}
        />
      )}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">{current ? current.name : "PPP"}</h1>
          <p className="mt-1 text-sm text-ink-600">{current ? "Policies, procedures and protocols" : "Policies, procedures and protocols — open a folder to see its files"}</p>
        </div>
        {current && canManage && (
          <DeleteFolderButton
            id={current.id}
            name={current.name}
            afterHref={parent ? `/dashboard/ppp?folder=${parent.id}` : "/dashboard/ppp"}
          />
        )}
      </div>

      {crumbs.length > 0 && (
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink-600">
          <Link href="/dashboard/ppp" className="hover:text-brand-600">PPP</Link>
          {crumbs.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <span>/</span>
              <Link href={`/dashboard/ppp?folder=${c.id}`} className="hover:text-brand-600">{c.name}</Link>
            </span>
          ))}
        </nav>
      )}

      <PppActions folderId={currentId} canManage={canManage} />

      {subfolders.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {subfolders.map((f) => (
            <div key={f.id} className="flex flex-col items-center rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 text-center shadow-card">
              <Link href={`/dashboard/ppp?folder=${f.id}`} className="flex w-full flex-col items-center hover:text-brand-700">
                <span className="text-3xl" aria-hidden>📁</span>
                <span className="mt-2 w-full truncate font-medium text-ink-800">{f.name}</span>
              </Link>
              {canManage && (
                <div className="mt-2">
                  <DeleteFolderButton id={f.id} name={f.name} small />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PppFileList
        canManage={canManage}
        currentFolderId={currentId}
        folders={allFolders.map((f) => ({ id: f.id, path: pathOf(f.id) })).sort((a, b) => a.path.localeCompare(b.path))}
        files={files.map((f) => ({ id: f.id, name: f.name, size: f.size, createdAt: f.createdAt.toISOString(), by: f.uploadedBy.name }))}
      />
    </div>
  );
}
