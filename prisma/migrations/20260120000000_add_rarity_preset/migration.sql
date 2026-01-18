-- Add optional metadata for cast gallery filtering
ALTER TABLE "LeaderboardEntry" ADD COLUMN "rarity" TEXT;
ALTER TABLE "LeaderboardEntry" ADD COLUMN "presetKey" TEXT;
