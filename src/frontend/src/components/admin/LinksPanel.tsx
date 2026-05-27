"use client";

import { Link2, ShieldCheck } from "lucide-react";
import { CopyButton } from "@/components/common/CopyButton";

interface LinksPanelProps {
  publicUrl: string;
  adminUrl: string;
}

export function LinksPanel({ publicUrl, adminUrl }: LinksPanelProps) {
  return (
    <div className="space-y-3">
      {/* Link publiczny */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Link2 className="w-3.5 h-3.5" />
          Link do głosowania
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <p className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono">
            {publicUrl}
          </p>
          <CopyButton text={publicUrl} />
        </div>
      </div>

      {/* Link admina */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Link administratora (prywatny)
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="flex-1 text-xs text-amber-700 dark:text-amber-400 truncate font-mono">
            {adminUrl}
          </p>
          <CopyButton text={adminUrl} />
        </div>
      </div>
    </div>
  );
}
