/**
 * Migration script to populate casted flag for existing logos with castUrl
 * Run with: npx ts-node scripts/migrate-casted-flag.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting migration: populating casted flag for existing castUrls...');

    // Find all logos with castUrl but casted = false
    const logosWithCastUrl = await prisma.generatedLogo.findMany({
      where: {
        castUrl: {
          not: null,
        },
        casted: false,
      },
    });

    console.log(`Found ${logosWithCastUrl.length} logos with castUrl but casted=false`);

    if (logosWithCastUrl.length > 0) {
      // Update all of them to casted = true
      const updateResult = await prisma.generatedLogo.updateMany({
        where: {
          castUrl: {
            not: null,
          },
          casted: false,
        },
        data: {
          casted: true,
        },
      });

      console.log(`✅ Updated ${updateResult.count} logos to casted=true`);
    } else {
      console.log('No logos needed updating');
    }

    // Verify
    const castedCount = await prisma.generatedLogo.count({
      where: { casted: true },
    });

    console.log(`\nTotal casted logos now: ${castedCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
