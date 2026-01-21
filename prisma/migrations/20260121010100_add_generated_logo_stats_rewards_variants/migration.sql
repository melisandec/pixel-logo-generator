-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "logoImageUrl" TEXT,
    "cardImageUrl" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "pfpUrl" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "recasts" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT,
    "presetKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "castUrl" TEXT,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prompts" TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyWinner" (
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

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedLogo" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "GeneratedLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
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

-- CreateTable
CREATE TABLE "UserReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "uiMode" TEXT NOT NULL DEFAULT 'simple',
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaderboardEntry_createdAt_idx" ON "LeaderboardEntry"("createdAt");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_username_idx" ON "LeaderboardEntry"("username");

-- CreateIndex
CREATE INDEX "Badge_userId_idx" ON "Badge"("userId");

-- CreateIndex
CREATE INDEX "Badge_badgeType_idx" ON "Badge"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_userId_badgeType_key" ON "Badge"("userId", "badgeType");

-- CreateIndex
CREATE INDEX "ChallengeCompletion_userId_date_idx" ON "ChallengeCompletion"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeCompletion_userId_challengeId_key" ON "ChallengeCompletion"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyWinner_date_key" ON "DailyWinner"("date");

-- CreateIndex
CREATE INDEX "DailyWinner_date_idx" ON "DailyWinner"("date");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Analytics_eventType_idx" ON "Analytics"("eventType");

-- CreateIndex
CREATE INDEX "Analytics_createdAt_idx" ON "Analytics"("createdAt");

-- CreateIndex
CREATE INDEX "Analytics_userId_idx" ON "Analytics"("userId");

-- CreateIndex
CREATE INDEX "GeneratedLogo_userId_idx" ON "GeneratedLogo"("userId");

-- CreateIndex
CREATE INDEX "GeneratedLogo_createdAt_idx" ON "GeneratedLogo"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedLogo_username_idx" ON "GeneratedLogo"("username");

-- CreateIndex
CREATE INDEX "GeneratedLogo_rarity_idx" ON "GeneratedLogo"("rarity");

-- CreateIndex
CREATE INDEX "GeneratedLogo_presetKey_idx" ON "GeneratedLogo"("presetKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_username_key" ON "UserStats"("username");

-- CreateIndex
CREATE INDEX "UserStats_userId_idx" ON "UserStats"("userId");

-- CreateIndex
CREATE INDEX "UserReward_userId_idx" ON "UserReward"("userId");

-- CreateIndex
CREATE INDEX "UserReward_username_idx" ON "UserReward"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserReward_username_rewardType_key" ON "UserReward"("username", "rewardType");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_username_key" ON "UserPreferences"("username");

-- CreateIndex
CREATE INDEX "UserPreferences_username_idx" ON "UserPreferences"("username");

