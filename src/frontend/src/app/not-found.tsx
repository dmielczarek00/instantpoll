import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-zinc-500">Strona nie istnieje</p>

      <Link
        href="/"
        className="text-sm underline text-zinc-700 hover:text-black"
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
}