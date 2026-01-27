-- CreateTable DemoSeedPool
CREATE TABLE "DemoSeedPool" (
    "seed" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,

    CONSTRAINT "DemoSeedPool_pkey" PRIMARY KEY ("seed")
);

-- CreateIndex on used status for quick lookup of available seeds
CREATE INDEX "DemoSeedPool_used_idx" ON "DemoSeedPool"("used");

-- CreateIndex on usedAt for analytics
CREATE INDEX "DemoSeedPool_usedAt_idx" ON "DemoSeedPool"("usedAt");
