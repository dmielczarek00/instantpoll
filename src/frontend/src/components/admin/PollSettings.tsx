"use client";

import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function SettingRow({ label, description, checked, disabled, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {disabled && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
        <Switch checked={checked} onCheckedChange={onToggle} disabled={disabled} />
      </div>
    </div>
  );
}

interface PollSettingsProps {
  isActive: boolean;
  resultsVisible: boolean;
  saving: boolean;
  onToggleActive: () => void;
  onToggleResults: () => void;
}

export function PollSettings({
  isActive,
  resultsVisible,
  saving,
  onToggleActive,
  onToggleResults,
}: PollSettingsProps) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      <SettingRow
        label="Ankieta aktywna"
        description="Gdy wyłączona, nikt nie może oddać głosu."
        checked={isActive}
        disabled={saving}
        onToggle={onToggleActive}
      />
      <SettingRow
        label="Wyniki publiczne"
        description="Uczestnicy widzą wyniki po głosowaniu."
        checked={resultsVisible}
        disabled={saving}
        onToggle={onToggleResults}
      />
    </div>
  );
}
