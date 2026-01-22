-- CreateTable for Feedback
CREATE TABLE IF NOT EXISTS "Feedback" (
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

-- CreateTable for Analytics
CREATE TABLE IF NOT EXISTS "Analytics" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable for UserPreferences
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt");
CREATE INDEX IF NOT EXISTS "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analytics_eventType_idx" ON "Analytics"("eventType");
CREATE INDEX IF NOT EXISTS "Analytics_createdAt_idx" ON "Analytics"("createdAt");
CREATE INDEX IF NOT EXISTS "Analytics_userId_idx" ON "Analytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserPreferences_userId_key" ON "UserPreferences"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserPreferences_username_key" ON "UserPreferences"("username");
CREATE INDEX IF NOT EXISTS "UserPreferences_username_idx" ON "UserPreferences"("username");
