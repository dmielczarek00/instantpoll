"use client";

import { ExternalLink, Link2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/CopyButton";

interface ShareModalProps {
  open: boolean;
  publicUrl: string;
  adminUrl: string;
  pollTitle: string;
  onClose: () => void;
  onNewPoll: () => void;
}

export function ShareModal({
  open,
  publicUrl,
  adminUrl,
  pollTitle,
  onClose,
  onNewPoll,
}: ShareModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Ankieta gotowa!</DialogTitle>
          <DialogDescription>
            Zapisz poniższe linki — <strong>linku administratora nie odzyskasz</strong> po
            zamknięciu tego okna.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Link2 className="w-4 h-4" aria-hidden="true" />
              Link do głosowania
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <p className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono">
                {publicUrl}
              </p>
              <CopyButton text={publicUrl} />
            </div>
            <p className="text-xs text-zinc-400">
              Udostępnij ten link uczestnikom ankiety.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Link administratora
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="flex-1 text-xs text-amber-700 dark:text-amber-400 truncate font-mono">
                {adminUrl}
              </p>
              <CopyButton text={adminUrl} />
            </div>
            <p className="text-xs text-zinc-400">
              Tylko Ty masz ten link. Pozwala zarządzać ankietą i przeglądać wyniki.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 w-full justify-center">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none sm:min-w-[180px]"
            onClick={onNewPoll}
          >
            Nowa ankieta
          </Button>
          <Button
            className="flex-1 sm:flex-none sm:min-w-[180px]"
            onClick={() => window.open(publicUrl, "_blank")}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Otwórz ankietę
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
