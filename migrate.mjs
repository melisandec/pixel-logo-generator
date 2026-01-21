import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log('Migrating casted flag...');
  
  const result = await prisma.generatedLogo.updateMany({
    where: {
      castUrl: { not: null },
      casted: false,
    },
    data: { casted: true },
  });
  
  console.log(`✅ Updated ${result.count} logos`);
  
  const stats = await prisma.generatedLogo.groupBy({
    by: ['casted'],
    _count: true,
  });
  
  console.log('Stats:', stats);
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
