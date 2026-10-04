import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManagePpp } from "@/lib/permissions";
import { PppActions, PppFileList } from "@/components/PppLibrary";

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
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">PPP</h1>
        <p className="mt-1 text-sm text-ink-600">Policies, procedures and protocols</p>
      </div>

      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink-600">
        <Link href="/dashboard/ppp" className="hover:text-brand-600">All files</Link>
        {crumbs.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <span>/</span>
            <Link href={`/dashboard/ppp?folder=${c.id}`} className="hover:text-brand-600">{c.name}</Link>
          </span>
        ))}
      </nav>

      <PppActions folderId={currentId} canManage={canManage} />

      {subfolders.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {subfolders.map((f) => (
            <Link key={f.id} href={`/dashboard/ppp?folder=${f.id}`} className="rounded-xl2 border border-ink-700/10 bg-cream-100 p-4 text-sm font-medium text-ink-800 shadow-card hover:border-brand-500/40">
              📁 {f.name}
            </Link>
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
