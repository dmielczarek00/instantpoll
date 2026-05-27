"use client";

import { useState } from "react";
import { Trash2, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DangerZoneProps {
  onResetVotes: () => Promise<void>;
  onDeletePoll: () => Promise<void>;
}

export function DangerZone({ onResetVotes, onDeletePoll }: DangerZoneProps) {
  const [confirmDialog, setConfirmDialog] = useState<"reset" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (confirmDialog === "reset") await onResetVotes();
      if (confirmDialog === "delete") await onDeletePoll();
    } finally {
      setLoading(false);
      setConfirmDialog(null);
    }
  };

  const config = {
    reset: {
      title: "Zresetować wszystkie głosy?",
      description: "Ta operacja usunie wszystkie oddane głosy. Ankieta pozostanie aktywna. Nie można cofnąć tej operacji.",
      confirm: "Zresetuj głosy",
      variant: "outline" as const,
    },
    delete: {
      title: "Usunąć ankietę?",
      description: "Ankieta oraz wszystkie głosy zostaną trwale usunięte. Nie można cofnąć tej operacji.",
      confirm: "Usuń ankietę",
      variant: "destructive" as const,
    },
  };

  return (
    <>
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden">
        <div className="px-5 py-3 bg-red-50 dark:bg-red-950/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Operacje nieodwracalne
          </span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {/* Reset głosów */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Resetuj głosy
              </p>
              <p className="text-xs text-zinc-500">
                Usuwa wszystkie oddane głosy. Ankieta pozostaje.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDialog("reset")}
              className="flex-shrink-0 gap-1.5 text-zinc-600 dark:text-zinc-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetuj
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Usuń ankietę
              </p>
              <p className="text-xs text-zinc-500">
                Trwałe usunięcie ankiety i wszystkich danych.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDialog("delete")}
              className="flex-shrink-0 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Usuń
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog
        open={confirmDialog !== null}
        onOpenChange={(o) => !o && !loading && setConfirmDialog(null)}
      >
        <DialogContent className="max-w-sm">
          {confirmDialog && (
            <>
              <DialogHeader>
                <DialogTitle>{config[confirmDialog].title}</DialogTitle>
                <DialogDescription>
                  {config[confirmDialog].description}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmDialog(null)}
                  disabled={loading}
                >
                  Anuluj
                </Button>
                <Button
                  variant={config[confirmDialog].variant}
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    config[confirmDialog].confirm
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
