#!/usr/bin/env node

/**
 * Manual Entry Recovery Script
 * Use this to manually add the missing user entry back to the database
 * Usage: node recover-missing-entry.js [options]
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔄 MISSING ENTRY RECOVERY SCRIPT\n');
  console.log('This script will help restore the missing logo entry:\n');
  console.log('- Username: 111iks 🟣');
  console.log('- Text: "Coucou"');
  console.log('- Rarity: EPIC');
  console.log('- Seed: 960660649\n');

  const mode = await question('Choose mode:\n1) View current database\n2) Recover missing entry\n3) Fix incomplete entries\n> ');

  if (mode === '1') {
    console.log('\n📊 Current Database Status:\n');
    
    const genCount = await prisma.generatedLogo.count();
    const legacyCount = await prisma.leaderboardEntry.count();
    
    console.log(`Total entries: ${genCount + legacyCount}`);
    console.log(`  - GeneratedLogo: ${genCount}`);
    console.log(`  - LeaderboardEntry: ${legacyCount}\n`);

    const users = await prisma.generatedLogo.findMany({
      distinct: ['username'],
      select: { username: true },
      orderBy: { username: 'asc' },
    });

    console.log('Users in database:');
    users.forEach((u) => {
      console.log(`  - ${u.username}`);
    });

    console.log('\n❌ Missing users:');
    console.log('  - 111iks');
  } else if (mode === '2') {
    console.log('\n🔄 RECOVER MISSING ENTRY\n');
    console.log('Enter the data for the missing entry:\n');

    const username = await question('Username (default: 111iks): ') || '111iks';
    const text = await question('Text (default: Coucou): ') || 'Coucou';
    const seed = parseInt(await question('Seed (default: 960660649): ') || '960660649');
    const rarity = await question('Rarity (default: EPIC): ') || 'EPIC';
    const imageUrl = await question('Image URL (optional): ') || null;
    const logoImageUrl = await question('Logo Image URL (optional): ') || null;
    const cardImageUrl = await question('Card Image URL (optional): ') || null;
    const pfpUrl = await question('PFP URL (optional): ') || null;
    const displayName = await question('Display Name (optional): ') || null;
    const createdAt = await question('Created At timestamp (YYYY-MM-DD or leave for 2 days ago): ') || null;

    // Calculate creation date if not provided
    let createdAtDate = new Date();
    if (createdAt) {
      createdAtDate = new Date(createdAt);
    } else {
      // 2 days ago
      createdAtDate.setDate(createdAtDate.getDate() - 2);
    }

    const payload = {
      id: `missing-entry-${Date.now()}`,
      text,
      seed,
      rarity: rarity.toUpperCase(),
      username: username.toLowerCase(),
      displayName: displayName || username,
      pfpUrl,
      imageUrl,
      logoImageUrl,
      cardImageUrl,
      createdAt: createdAtDate,
    };

    console.log('\n📋 Entry to be created:\n');
    console.log(JSON.stringify(payload, null, 2));

    const confirm = await question('\n✅ Create this entry? (yes/no): ');
    if (confirm.toLowerCase() === 'yes') {
      try {
        const created = await prisma.generatedLogo.create({
          data: payload,
        });
        console.log('\n✨ Entry created successfully!');
        console.log(`ID: ${created.id}`);
        console.log(`Username: ${created.username}`);
        console.log(`Text: ${created.text}`);
        console.log(`Rarity: ${created.rarity}`);
        console.log(`Created: ${created.createdAt}`);
      } catch (error) {
        console.error('\n❌ Error creating entry:', error.message);
      }
    } else {
      console.log('Cancelled.');
    }
  } else if (mode === '3') {
    console.log('\n🔧 FIX INCOMPLETE ENTRIES\n');
    
    const incomplete = await prisma.generatedLogo.findMany({
      where: { rarity: null },
      select: { id: true, text: true, username: true, seed: true },
    });

    if (incomplete.length === 0) {
      console.log('✅ No incomplete entries found!');
    } else {
      console.log(`Found ${incomplete.length} incomplete entries:\n`);
      incomplete.forEach((entry, idx) => {
        console.log(`${idx + 1}. User: ${entry.username}, Text: "${entry.text}", Seed: ${entry.seed}`);
      });

      const fixId = await question('\nEnter ID to fix (or leave blank to skip): ');
      if (fixId) {
        const entry = incomplete.find((e) => e.id === fixId);
        if (entry) {
          const newRarity = await question(`Enter rarity for "${entry.text}" (COMMON, RARE, EPIC, LEGENDARY): `);
          if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(newRarity.toUpperCase())) {
            const updated = await prisma.generatedLogo.update({
              where: { id: fixId },
              data: { rarity: newRarity.toUpperCase() },
            });
            console.log(`\n✅ Updated: ${updated.text} → ${updated.rarity}`);
          } else {
            console.log('Invalid rarity value.');
          }
        }
      }
    }
  }

  rl.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
