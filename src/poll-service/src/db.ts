import { Pool } from "pg";

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.query("SELECT 1").then(() => {
  console.log("[poll-service] PostgreSQL connected");
}).catch((err) => {
  console.error("[poll-service] PostgreSQL connection failed:", err.message);
  process.exit(1);
});