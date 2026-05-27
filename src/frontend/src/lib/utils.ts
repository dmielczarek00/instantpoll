import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
