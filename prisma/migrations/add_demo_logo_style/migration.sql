-- CreateTable DemoLogoStyle
CREATE TABLE "DemoLogoStyle" (
    "id" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "palette" TEXT NOT NULL,
    "gradient" TEXT NOT NULL,
    "glow" TEXT NOT NULL,
    "chrome" TEXT NOT NULL,
    "bloom" TEXT NOT NULL,
    "texture" TEXT NOT NULL,
    "lighting" TEXT NOT NULL,
    "generatedLogoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoLogoStyle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemoLogoStyle_seed_idx" ON "DemoLogoStyle"("seed");

-- CreateIndex
CREATE INDEX "DemoLogoStyle_palette_idx" ON "DemoLogoStyle"("palette");

-- CreateIndex
CREATE INDEX "DemoLogoStyle_glow_idx" ON "DemoLogoStyle"("glow");

-- CreateIndex
CREATE INDEX "DemoLogoStyle_createdAt_idx" ON "DemoLogoStyle"("createdAt");
