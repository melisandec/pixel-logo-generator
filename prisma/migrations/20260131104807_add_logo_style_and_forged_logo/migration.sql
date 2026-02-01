/*
  Warnings:

  - A unique constraint covering the columns `[seed]` on the table `DemoLogoStyle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LogoRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- DropIndex
DROP INDEX "DemoLogoStyle_seed_idx";

-- AlterTable
ALTER TABLE "LeaderboardEntry" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LogoStyle" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "rarity" "LogoRarity" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 50,
    "baseHue" INTEGER NOT NULL,
    "accentHue" INTEGER NOT NULL,
    "bgHue" INTEGER NOT NULL,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "layout" JSONB NOT NULL,
    "effects" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogoStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForgedLogo" (
    "id" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "styleId" INTEGER NOT NULL,
    "rarity" "LogoRarity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForgedLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogoStyle_slug_key" ON "LogoStyle"("slug");

-- CreateIndex
CREATE INDEX "LogoStyle_rarity_idx" ON "LogoStyle"("rarity");

-- CreateIndex
CREATE INDEX "LogoStyle_isActive_idx" ON "LogoStyle"("isActive");

-- CreateIndex
CREATE INDEX "LogoStyle_weight_idx" ON "LogoStyle"("weight");

-- CreateIndex
CREATE INDEX "ForgedLogo_styleId_idx" ON "ForgedLogo"("styleId");

-- CreateIndex
CREATE INDEX "ForgedLogo_rarity_idx" ON "ForgedLogo"("rarity");

-- CreateIndex
CREATE INDEX "ForgedLogo_createdAt_idx" ON "ForgedLogo"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ForgedLogo_seed_styleId_key" ON "ForgedLogo"("seed", "styleId");

-- CreateIndex
CREATE UNIQUE INDEX "DemoLogoStyle_seed_key" ON "DemoLogoStyle"("seed");

-- AddForeignKey
ALTER TABLE "ForgedLogo" ADD CONSTRAINT "ForgedLogo_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "LogoStyle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
