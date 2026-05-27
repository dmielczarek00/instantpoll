import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /results/:publicId

app.get("/results/:publicId", async (req, res) => {
  const { publicId } = req.params;

  const { rows: [poll] } = await db.query(
    `SELECT id, title, results_visible FROM polls WHERE public_id = $1`,
    [publicId]
  );
  if (!poll) return res.status(404).json({ message: "Ankieta nie istnieje" });

  const { rows: questions } = await db.query(
    `SELECT id, text, type FROM questions WHERE poll_id = $1 ORDER BY position`,
    [poll.id]
  );

  const { rows: [{ count: totalVotes }] } = await db.query(
    `SELECT COUNT(*) FROM votes WHERE poll_id = $1`,
    [poll.id]
  );

  const questionResults = await Promise.all(
    questions.map(async (q) => {
      const { rows: options } = await db.query(
        `SELECT o.id, o.text, COALESCE(rc.vote_count, 0) as votes
         FROM options o
         LEFT JOIN result_counts rc ON rc.option_id = o.id
         WHERE o.question_id = $1
         ORDER BY o.position`,
        [q.id]
      );

      const totalAnswers = options.reduce((sum, o) => sum + Number(o.votes), 0);

      return {
        questionId: q.id,
        questionText: q.text,
        type: q.type,
        totalAnswers,
        options: options.map((o) => ({
          optionId: o.id,
          optionText: o.text,
          votes: Number(o.votes),
          percentage: totalAnswers > 0
            ? Math.round((Number(o.votes) / totalAnswers) * 1000) / 10
            : 0,
        })),
      };
    })
  );

  res.json({
    publicId,
    title: poll.title,
    totalVotes: Number(totalVotes),
    resultsVisible: poll.results_visible,
    questions: questionResults,
  });
});

// GET /results/admin/:adminId

app.get("/results/admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  const { rows: [poll] } = await db.query(
    `SELECT public_id FROM polls WHERE admin_id = $1`,
    [adminId]
  );
  if (!poll) return res.status(404).json({ message: "Ankieta nie istnieje" });

  return res.redirect(`/results/${poll.public_id}`);
});

const PORT = process.env.PORT ?? 3003;
app.listen(PORT, () => console.log(`[results-service] running on :${PORT}`));