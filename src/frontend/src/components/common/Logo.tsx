import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 select-none", className)}
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
        <span className="text-white dark:text-zinc-900 font-bold text-sm leading-none">
          IP
        </span>
      </div>
      <span className="font-semibold text-zinc-900 dark:text-white tracking-tight">
        InstantPoll
      </span>
    </Link>
  );
}
