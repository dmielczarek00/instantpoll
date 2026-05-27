"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PollStats } from "./PollStats";
import { ResultsChart } from "./ResultsChart";
import { LinksPanel } from "./LinksPanel";
import { PollSettings } from "./PollSettings";
import { DangerZone } from "./DangerZone";
import { updatePollSettings, deletePoll, resetVotes } from "@/lib/api";
import type { AdminPollData } from "@/types/api";

interface AdminPanelProps {
  initialData: AdminPollData;
  adminId: string;
}

export function AdminPanel({ initialData, adminId }: AdminPanelProps) {
  const router = useRouter();
  const [data, setData] = useState<AdminPollData>(initialData);
  const [saving, setSaving] = useState(false);

const handleToggle = async (field: "isActive" | "resultsVisible") => {
  setSaving(true);

  setData((prev) => ({
    ...prev,
    poll: {
      ...prev.poll,
      [field]: !prev.poll[field],
    },
  }));

  try {
    await updatePollSettings(adminId, {
      [field]: !data.poll[field],
    });
  } catch {
    setData((prev) => ({
      ...prev,
      poll: {
        ...prev.poll,
        [field]: data.poll[field],
      },
    }));
  } finally {
    setSaving(false);
  }
};

  const handleResetVotes = async () => {
    await resetVotes(adminId);
    // Odśwież dane
    const updated = await updatePollSettings(adminId, {});
    setData({ ...updated, results: { ...updated.results, totalVotes: 0 } });
  };

  const handleDeletePoll = async () => {
    await deletePoll(adminId);
    router.push("/");
  };

  return (
    <div className="space-y-8">
      <PollStats data={data} />

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Linki</h2>
        <LinksPanel publicUrl={data.publicUrl} adminUrl={data.adminUrl} />
      </section>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 space-y-1">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white pt-4 pb-1">
          Ustawienia
        </h2>
        <PollSettings
          isActive={data.poll.isActive}
          resultsVisible={data.poll.resultsVisible}
          saving={saving}
          onToggleActive={() => handleToggle("isActive")}
          onToggleResults={() => handleToggle("resultsVisible")}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Wyniki</h2>
          <span className="text-xs text-zinc-400">
            {data.results.totalVotes} głosów
          </span>
        </div>
        {data.results.totalVotes === 0 ? (
          <p className="text-sm text-zinc-400 py-6 text-center">
            Nikt jeszcze nie zagłosował.
          </p>
        ) : (
          <ResultsChart results={data.results} />
        )}
      </section>

      <DangerZone
        onResetVotes={handleResetVotes}
        onDeletePoll={handleDeletePoll}
      />
    </div>
  );
}
