import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { fetchAdminData } from "@/lib/api";

interface Props {
  params: Promise<{ adminId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { adminId } = await params;
  try {
    const data = await fetchAdminData(adminId);
    return { title: `Panel — ${data.poll.title}` };
  } catch {
    return { title: "Panel administratora" };
  }
}

export default async function AdminPage({ params }: Props) {
  const { adminId } = await params;

  let adminData;
  try {
    adminData = await fetchAdminData(adminId);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Panel administratora
              </p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  adminData.poll.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    adminData.poll.isActive ? "bg-emerald-500" : "bg-zinc-400"
                  }`}
                />
                {adminData.poll.isActive ? "Aktywna" : "Zakończona"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {adminData.poll.title}
            </h1>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-8">
          <AdminPanel initialData={adminData} adminId={adminId} />
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-6">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs text-zinc-400 text-center">InstantPoll</p>
        </div>
      </footer>
    </div>
  );
}