-- CreateTable for GeneratedLogo if not exists
CREATE TABLE IF NOT EXISTS "GeneratedLogo" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "rarity" TEXT,
    "presetKey" TEXT,
    "userId" TEXT,
    "username" TEXT,
    "displayName" TEXT,
    "pfpUrl" TEXT,
    "imageUrl" TEXT,
    "thumbImageUrl" TEXT,
    "mediumImageUrl" TEXT,
    "logoImageUrl" TEXT,
    "cardImageUrl" TEXT,
    "castUrl" TEXT,
    "casted" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "recasts" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "remixes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "GeneratedLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable for UserStats if not exists
CREATE TABLE IF NOT EXISTS "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "support" INTEGER NOT NULL DEFAULT 0,
    "influence" INTEGER NOT NULL DEFAULT 0,
    "creation" INTEGER NOT NULL DEFAULT 0,
    "discovery" INTEGER NOT NULL DEFAULT 0,
    "totalPower" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT NOT NULL DEFAULT 'Rookie',
    "bestRarity" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable for UserReward if not exists
CREATE TABLE IF NOT EXISTS "UserReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable for UserPreferences if not exists
CREATE TABLE IF NOT EXISTS "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "uiMode" TEXT NOT NULL DEFAULT 'simple',
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- AlterTable (views column added to LeaderboardEntry)
ALTER TABLE IF EXISTS "LeaderboardEntry" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex for GeneratedLogo
CREATE INDEX IF NOT EXISTS "GeneratedLogo_userId_idx" ON "GeneratedLogo"("userId");
CREATE INDEX IF NOT EXISTS "GeneratedLogo_createdAt_idx" ON "GeneratedLogo"("createdAt");
CREATE INDEX IF NOT EXISTS "GeneratedLogo_username_idx" ON "GeneratedLogo"("username");
CREATE INDEX IF NOT EXISTS "GeneratedLogo_rarity_idx" ON "GeneratedLogo"("rarity");
CREATE INDEX IF NOT EXISTS "GeneratedLogo_presetKey_idx" ON "GeneratedLogo"("presetKey");

-- CreateIndex for LeaderboardEntry
CREATE INDEX IF NOT EXISTS "LeaderboardEntry_createdAt_idx" ON "LeaderboardEntry"("createdAt");

-- CreateIndex for UserStats
CREATE UNIQUE INDEX IF NOT EXISTS "UserStats_username_key" ON "UserStats"("username");
CREATE INDEX IF NOT EXISTS "UserStats_userId_idx" ON "UserStats"("userId");

-- CreateIndex for UserReward
CREATE INDEX IF NOT EXISTS "UserReward_userId_idx" ON "UserReward"("userId");
CREATE INDEX IF NOT EXISTS "UserReward_username_idx" ON "UserReward"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "UserReward_username_rewardType_key" ON "UserReward"("username", "rewardType");

-- CreateIndex for UserPreferences
CREATE UNIQUE INDEX IF NOT EXISTS "UserPreferences_userId_key" ON "UserPreferences"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserPreferences_username_key" ON "UserPreferences"("username");
CREATE INDEX IF NOT EXISTS "UserPreferences_username_idx" ON "UserPreferences"("username");



