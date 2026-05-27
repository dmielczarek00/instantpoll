import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { customAlphabet } from "nanoid";

const app = express();
app.use(cors());
app.use(express.json());

// nanoid generuje krótkie ID
const nanoidPublic = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);
const nanoidAdmin  = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 24);

// POST /polls

app.post("/polls", async (req, res) => {
  const { title, questions } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Tytuł jest wymagany" });
  }
  if (!questions?.length) {
    return res.status(400).json({ message: "Ankieta musi mieć pytania" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const publicId = nanoidPublic();
    const adminId  = nanoidAdmin();

    const { rows: [poll] } = await client.query(
      `INSERT INTO polls (public_id, admin_id, title)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [publicId, adminId, title.trim()]
    );

    const fullQuestions = [];
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];

      const { rows: [question] } = await client.query(
        `INSERT INTO questions (poll_id, text, type, position)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [poll.id, q.text.trim(), q.type, qi]
      );

      const options = [];
      for (let oi = 0; oi < q.options.length; oi++) {
        const { rows: [option] } = await client.query(
          `INSERT INTO options (question_id, text, position)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [question.id, q.options[oi].text.trim(), oi]
        );

        await client.query(
          `INSERT INTO result_counts (option_id, vote_count) VALUES ($1, 0)`,
          [option.id]
        );

        options.push({ id: option.id, text: option.text });
      }

      fullQuestions.push({
        id: question.id,
        text: question.text,
        type: question.type,
        options,
      });
    }

    await client.query("COMMIT");

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    res.status(201).json({
      poll: {
        id: poll.id,
        publicId: poll.public_id,
        adminId: poll.admin_id,
        title: poll.title,
        questions: fullQuestions,
        isActive: poll.is_active,
        resultsVisible: poll.results_visible,
        createdAt: poll.created_at,
        totalVotes: 0,
      },
      publicUrl: `${appUrl}/poll/${poll.public_id}`,
      adminUrl:  `${appUrl}/admin/${poll.admin_id}`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[POST /polls]", err);
    res.status(500).json({ message: "Błąd serwera" });
  } finally {
    client.release();
  }
});

// GET /polls/:publicId

app.get("/polls/:publicId", async (req, res) => {
  const { publicId } = req.params;

  const { rows: [poll] } = await db.query(
    `SELECT * FROM polls WHERE public_id = $1`,
    [publicId]
  );
  if (!poll) return res.status(404).json({ message: "Ankieta nie istnieje" });

  const { rows: questions } = await db.query(
    `SELECT * FROM questions WHERE poll_id = $1 ORDER BY position`,
    [poll.id]
  );

  const fullQuestions = await Promise.all(
    questions.map(async (q) => {
      const { rows: options } = await db.query(
        `SELECT id, text FROM options WHERE question_id = $1 ORDER BY position`,
        [q.id]
      );
      return { id: q.id, text: q.text, type: q.type, options };
    })
  );

  const { rows: [{ count }] } = await db.query(
    `SELECT COUNT(*) FROM votes WHERE poll_id = $1`,
    [poll.id]
  );

  res.json({
    id: poll.id,
    publicId: poll.public_id,
    adminId: poll.admin_id,
    title: poll.title,
    questions: fullQuestions,
    isActive: poll.is_active,
    resultsVisible: poll.results_visible,
    createdAt: poll.created_at,
    totalVotes: Number(count),
  });
});

// GET /polls/admin/:adminId

app.get("/polls/admin/:adminId", async (req, res) => {
  const { adminId } = req.params;

  const { rows: [poll] } = await db.query(
    `SELECT * FROM polls WHERE admin_id = $1`,
    [adminId]
  );
  if (!poll) return res.status(404).json({ message: "Ankieta nie istnieje" });

  res.json({
    id: poll.id,
    publicId: poll.public_id,
    adminId: poll.admin_id,
    title: poll.title,
    isActive: poll.is_active,
    resultsVisible: poll.results_visible,
    createdAt: poll.created_at,
  });
});

// PATCH /polls/admin/:adminId

app.patch("/polls/admin/:adminId", async (req, res) => {
  const { adminId } = req.params;
  const { isActive, resultsVisible } = req.body;

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (isActive !== undefined)       { updates.push(`is_active = $${idx++}`);       values.push(isActive); }
  if (resultsVisible !== undefined) { updates.push(`results_visible = $${idx++}`); values.push(resultsVisible); }

  if (!updates.length) return res.status(400).json({ message: "Brak pól do aktualizacji" });

  updates.push(`updated_at = NOW()`);
  values.push(adminId);

  const { rows: [poll] } = await db.query(
    `UPDATE polls SET ${updates.join(", ")} WHERE admin_id = $${idx} RETURNING *`,
    values
  );
  if (!poll) return res.status(404).json({ message: "Ankieta nie istnieje" });

  res.json({ isActive: poll.is_active, resultsVisible: poll.results_visible });
});

// DELETE /polls/admin/:adminId

app.delete("/polls/admin/:adminId", async (req, res) => {
  const { adminId } = req.params;
  const { rowCount } = await db.query(
    `DELETE FROM polls WHERE admin_id = $1`,
    [adminId]
  );
  if (!rowCount) return res.status(404).json({ message: "Ankieta nie istnieje" });
  res.json({ success: true });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`[poll-service] running on :${PORT}`));