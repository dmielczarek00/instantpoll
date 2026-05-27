import { Header } from "@/components/common/Header";
import { PollCreator } from "@/components/poll-creator/PollCreator";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section — krótkie intro */}
        <section className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Stwórz ankietę
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Bez konta, bez konfiguracji — wystarczy wypełnić i udostępnić link.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-8">
          <PollCreator />
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-6">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs text-zinc-400 text-center">
            InstantPoll · Dawid Mielczarek & Mateusz Rudnik
          </p>
        </div>
      </footer>
    </div>
  );
}
