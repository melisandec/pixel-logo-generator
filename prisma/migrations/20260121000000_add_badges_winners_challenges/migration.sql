-- CreateTable
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChallengeCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prompts" TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyWinner" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "winner1Id" TEXT NOT NULL,
    "winner1EntryId" TEXT NOT NULL,
    "winner2Id" TEXT,
    "winner2EntryId" TEXT,
    "winner3Id" TEXT,
    "winner3EntryId" TEXT,

    CONSTRAINT "DailyWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Badge_userId_idx" ON "Badge"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Badge_badgeType_idx" ON "Badge"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Badge_userId_badgeType_key" ON "Badge"("userId", "badgeType");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ChallengeCompletion_userId_challengeId_key" ON "ChallengeCompletion"("userId", "challengeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ChallengeCompletion_userId_date_idx" ON "ChallengeCompletion"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DailyWinner_date_key" ON "DailyWinner"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DailyWinner_date_idx" ON "DailyWinner"("date");

-- CreateIndex (if it doesn't exist)
CREATE INDEX IF NOT EXISTS "LeaderboardEntry_username_idx" ON "LeaderboardEntry"("username");
