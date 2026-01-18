CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
  "id" TEXT PRIMARY KEY,
  "text" TEXT NOT NULL,
  "seed" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "pfpUrl" TEXT NOT NULL,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "castUrl" TEXT
);

CREATE INDEX IF NOT EXISTS "LeaderboardEntry_createdAt_idx"
ON "LeaderboardEntry" ("createdAt");
