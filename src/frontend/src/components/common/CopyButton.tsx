"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn("gap-1.5 transition-colors", className)}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-600" />
          Skopiowano
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Kopiuj
        </>
      )}
    </Button>
  );
}
