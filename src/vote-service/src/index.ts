import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { createClient } from "redis";

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({ connectionString: process.env.DATABASE_URL });

const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().then(() => console.log("[vote-service] Redis connected"));

// POST /votes

app.post("/votes", async (req, res) => {
  const { publicId, fingerprint, answers } = req.body;

  if (!publicId || !fingerprint || !answers?.length) {
    return res.status(400).json({ message: "Nieprawidłowe dane" });
  }

  const { rows: [poll] } = await db.query(
    `SELECT id, is_active FROM polls WHERE public_id = $1`,
    [publicId]
  );
  if (!poll) return res.status(404).json({ message: "Ankieta nie istnieje" });
  if (!poll.is_active) return res.status(403).json({ message: "Ankieta jest nieaktywna" });

  // Sprawdź duplikat — najpierw Redis, potem baza
  const redisKey = `voted:${poll.id}:${fingerprint}`;
  const alreadyVotedRedis = await redis.get(redisKey);
  if (alreadyVotedRedis) {
    return res.status(409).json({ message: "Już oddałeś głos w tej ankiecie" });
  }

  const { rows: [existingVote] } = await db.query(
    `SELECT id FROM votes WHERE poll_id = $1 AND fingerprint = $2 LIMIT 1`,
    [poll.id, fingerprint]
  );
  if (existingVote) {
    await redis.setEx(redisKey, 86400, "1"); // zapisz w cache na 24h
    return res.status(409).json({ message: "Już oddałeś głos w tej ankiecie" });
  }

  // Zapisz głos w transakcji
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { rows: [vote] } = await client.query(
      `INSERT INTO votes (poll_id, fingerprint) VALUES ($1, $2) RETURNING id`,
      [poll.id, fingerprint]
    );

    for (const answer of answers) {
      for (const optionId of answer.optionIds) {
        await client.query(
          `INSERT INTO vote_answers (vote_id, question_id, option_id)
           VALUES ($1, $2, $3)`,
          [vote.id, answer.questionId, optionId]
        );
      }
    }

    await client.query("COMMIT");

    // Zapisz w Redis (blokada duplikatu)
    await redis.setEx(redisKey, 86400, "1");

    // Wyślij zdarzenie do Redisa aktualizuja result_counts
    await redis.lPush("vote_events", JSON.stringify({
      pollId: poll.id,
      voteId: vote.id,
      answers,
    }));

    res.status(201).json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[POST /votes]", err);
    res.status(500).json({ message: "Błąd serwera" });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT ?? 3002;
app.listen(PORT, () => console.log(`[vote-service] running on :${PORT}`));