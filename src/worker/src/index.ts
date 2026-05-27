import "dotenv/config";
import { Pool } from "pg";
import { createClient } from "redis";

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL });

interface VoteEvent {
  pollId: string;
  voteId: string;
  answers: Array<{ questionId: string; optionIds: string[] }>;
}

async function processVoteEvent(event: VoteEvent) {
  // Dla każdej opcji inkrementuj licznik w result_counts
  for (const answer of event.answers) {
    for (const optionId of answer.optionIds) {
      await db.query(
        `INSERT INTO result_counts (option_id, vote_count)
         VALUES ($1, 1)
         ON CONFLICT (option_id)
         DO UPDATE SET vote_count = result_counts.vote_count + 1,
                       updated_at = NOW()`,
        [optionId]
      );
    }
  }
  console.log(`[worker] Processed vote ${event.voteId}`);
}

async function run() {
  await redis.connect();
  console.log("[worker] Started, listening on vote_events queue...");

  // Nieskończona pętla blokujące czytanie z kolejki (BRPOP)
  while (true) {
    try {
      // Czeka max 5s na nowe zdarzenie
      const result = await redis.brPop("vote_events", 5);
      if (result) {
        const event: VoteEvent = JSON.parse(result.element);
        await processVoteEvent(event);
      }
    } catch (err) {
      console.error("[worker] Error:", err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

run();