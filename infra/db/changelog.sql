--liquibase formatted sql

--changeset dawid:001-init-schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE polls (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id       VARCHAR(12) NOT NULL UNIQUE,
  admin_id        VARCHAR(32) NOT NULL UNIQUE,
  title           TEXT        NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  results_visible BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id    UUID        NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text       TEXT        NOT NULL,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('single', 'multiple')),
  position   SMALLINT    NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE options (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  position    SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id     UUID        NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  fingerprint VARCHAR(64) NOT NULL,
  ip_hash     VARCHAR(64),
  cast_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vote_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id     UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id   UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE
);

CREATE TABLE result_counts (
  option_id   UUID    PRIMARY KEY REFERENCES options(id) ON DELETE CASCADE,
  vote_count  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_polls_public_id     ON polls(public_id);
CREATE INDEX idx_polls_admin_id      ON polls(admin_id);
CREATE INDEX idx_questions_poll_id   ON questions(poll_id);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_votes_poll_id       ON votes(poll_id);
CREATE INDEX idx_votes_fingerprint   ON votes(poll_id, fingerprint);
CREATE INDEX idx_vote_answers_vote   ON vote_answers(vote_id);