#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Migrating casted flag for logos with castUrl...');
    
    // Check how many have castUrl but casted=false
    const logosWithCastUrl = await prisma.generatedLogo.findMany({
      where: {
        castUrl: {
          not: null,
        },
        casted: false,
      },
      select: { id: true, text: true, castUrl: true },
      take: 3,
    });
    
    console.log(`Found ${logosWithCastUrl.length} sample logos with castUrl but casted=false`);
    if (logosWithCastUrl.length > 0) {
      console.log('Sample:', logosWithCastUrl[0]);
    }
    
    // Update all of them
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
    
    // Get final count
    const castedCount = await prisma.generatedLogo.count({
      where: { casted: true },
    });
    
    const totalCount = await prisma.generatedLogo.count();
    
    console.log(`\n📊 Final stats:`);
    console.log(`   Total logos: ${totalCount}`);
    console.log(`   Casted logos: ${castedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
