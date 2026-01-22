import prisma from '@/lib/prisma';

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to GeneratedLogo table...');
    
    // Add userId column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GeneratedLogo" 
      ADD COLUMN IF NOT EXISTS "userId" TEXT
    `);
    console.log('✅ Added userId column');

    // Add other missing columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GeneratedLogo" 
      ADD COLUMN IF NOT EXISTS "thumbImageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "mediumImageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "logoImageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "cardImageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "casted" BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Added image URL and casted columns');

    console.log('✅ All columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingColumns();
