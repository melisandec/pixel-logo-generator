const { PrismaClient } = require("@prisma/client");
const { randomBytes } = require("crypto");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Initializing demo seed pool with 9000 seeds...");

    const existing = await prisma.demoSeedPool.count();
    if (existing > 0) {
      console.log(`✓ Pool already has ${existing} seeds`);
      process.exit(0);
    }

    const seeds = [];
    const seedSet = new Set();
    for (let i = 0; i < 9000; i++) {
      let seed = randomBytes(32).toString("hex");
      while (seedSet.has(seed)) {
        seed = randomBytes(32).toString("hex");
      }
      seeds.push(seed);
      seedSet.add(seed);
    }
    console.log(`Generated ${seeds.length} unique seeds`);

    const result = await prisma.demoSeedPool.createMany({
      data: seeds.map((seed) => ({ seed, used: false })),
      skipDuplicates: true,
    });

    console.log(`✓ Inserted ${result.count} seeds into demo pool`);
    const stats = await prisma.demoSeedPool.count();
    console.log(`Total seeds in pool: ${stats}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
