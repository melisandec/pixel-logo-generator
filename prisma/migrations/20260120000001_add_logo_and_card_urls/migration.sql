-- AddColumn logoImageUrl and cardImageUrl to LeaderboardEntry
ALTER TABLE "LeaderboardEntry" ADD COLUMN "logoImageUrl" TEXT;
ALTER TABLE "LeaderboardEntry" ADD COLUMN "cardImageUrl" TEXT;

-- Set initial values to imageUrl for backwards compatibility
UPDATE "LeaderboardEntry" SET "logoImageUrl" = "imageUrl", "cardImageUrl" = "imageUrl" WHERE "logoImageUrl" IS NULL;
