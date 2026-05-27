import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { VotingForm } from "@/components/voting/VotingForm";
import { fetchPoll } from "@/lib/api";

interface Props {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  try {
    const poll = await fetchPoll(publicId);
    return { title: poll.title };
  } catch {
    return { title: "Ankieta" };
  }
}

export default async function PollPage({ params }: Props) {
  const { publicId } = await params;

  let poll;
  try {
    poll = await fetchPoll(publicId);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-2xl mx-auto px-4 py-10">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Ankieta
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {poll.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Liczba pytań: {poll.questions.length}
            </p>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-4 py-8">
          <VotingForm poll={poll} />
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-6">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-xs text-zinc-400 text-center">InstantPoll</p>
        </div>
      </footer>
    </div>
  );
}