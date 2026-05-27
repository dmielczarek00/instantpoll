import { Users, BarChart2, Clock, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AdminPollData } from "@/types/api";

interface PollStatsProps {
  data: AdminPollData;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">{value}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function PollStats({ data }: PollStatsProps) {
  const { poll, results } = data;
  console.log("POLL:", poll);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard icon={Users}    label="Oddanych głosów"    value={results.totalVotes} />
      <StatCard icon={BarChart2} label="Pytań w ankiecie"  value={results.questions.length} />
      <StatCard icon={Activity}  label="Status"            value={poll.isActive ? "Aktywna" : "Zakończona"} />
      <StatCard icon={Clock}     label="Utworzona"         value={formatDate(poll.createdAt)} />
    </div>
  );
}
