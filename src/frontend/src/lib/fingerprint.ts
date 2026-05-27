const STORAGE_KEY = "ip_fp";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const fp = generateUUID();
    localStorage.setItem(STORAGE_KEY, fp);
    return fp;
  } catch {
    // localStorage zablokowany
    return generateUUID();
  }
}

// Sprawdza czy użytkownik już głosował w danej ankiecie
export function hasVoted(publicId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`voted_${publicId}`) === "1";
  } catch {
    return false;
  }
}

// Zapisuje oddanie głosu
export function markVoted(publicId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`voted_${publicId}`, "1");
  } catch {
  }
}
