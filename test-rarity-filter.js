#!/usr/bin/env node

/**
 * Test script to verify rarity filter functionality in gallery
 * Tests the filtering logic applied in LogoGenerator.tsx
 */

const RARITY_OPTIONS = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

// Mock gallery entries with various rarities
const mockGalleryEntries = [
  { id: "1", name: "Common Logo", rarity: "COMMON", presetKey: "default" },
  { id: "2", name: "Rare Logo", rarity: "RARE", presetKey: "neon" },
  { id: "3", name: "Epic Logo", rarity: "EPIC", presetKey: "retro" },
  { id: "4", name: "Legendary Logo", rarity: "LEGENDARY", presetKey: "cyber" },
  { id: "5", name: "Unknown Rarity", rarity: null, presetKey: "default" },
  { id: "6", name: "Another Common", rarity: "COMMON", presetKey: "neon" },
];

/**
 * Filters gallery entries by rarity (mimics LogoGenerator logic)
 */
function filterByRarity(entries, rarityFilter) {
  return entries.filter((entry) => {
    const rarityValue = entry.rarity
      ? String(entry.rarity).toUpperCase()
      : "UNKNOWN";
    const matchesRarity =
      rarityFilter === "all" ||
      (rarityFilter === "Unknown"
        ? rarityValue === "UNKNOWN"
        : rarityValue === rarityFilter);
    return matchesRarity;
  });
}

// Test cases
const tests = [
  {
    name: "Show all entries when filter is 'all'",
    filter: "all",
    expectedCount: 6,
    expectedIds: ["1", "2", "3", "4", "5", "6"],
  },
  {
    name: "Filter to COMMON rarity",
    filter: "COMMON",
    expectedCount: 2,
    expectedIds: ["1", "6"],
  },
  {
    name: "Filter to RARE rarity",
    filter: "RARE",
    expectedCount: 1,
    expectedIds: ["2"],
  },
  {
    name: "Filter to EPIC rarity",
    filter: "EPIC",
    expectedCount: 1,
    expectedIds: ["3"],
  },
  {
    name: "Filter to LEGENDARY rarity",
    filter: "LEGENDARY",
    expectedCount: 1,
    expectedIds: ["4"],
  },
  {
    name: "Filter to Unknown rarity",
    filter: "Unknown",
    expectedCount: 1,
    expectedIds: ["5"],
  },
];

// Run tests
let passedTests = 0;
let failedTests = 0;

console.log("🎮 Running Rarity Filter Tests\n");
console.log("================================\n");

tests.forEach((test, index) => {
  const result = filterByRarity(mockGalleryEntries, test.filter);
  const resultIds = result.map((r) => r.id);
  const idsMatch =
    JSON.stringify(resultIds.sort()) ===
    JSON.stringify(test.expectedIds.sort());
  const countMatch = result.length === test.expectedCount;

  if (countMatch && idsMatch) {
    console.log(`✅ Test ${index + 1}: ${test.name}`);
    console.log(`   Filter: "${test.filter}" → ${result.length} results`);
    passedTests++;
  } else {
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Filter: "${test.filter}"`);
    console.log(
      `   Expected: ${test.expectedCount} entries (${test.expectedIds.join(", ")})`,
    );
    console.log(`   Got: ${result.length} entries (${resultIds.join(", ")})`);
    failedTests++;
  }
  console.log();
});

console.log("================================\n");
console.log(`📊 Results: ${passedTests} passed, ${failedTests} failed\n`);

if (failedTests === 0) {
  console.log("✨ All rarity filter tests passed!");
  process.exit(0);
} else {
  console.log("⚠️ Some tests failed!");
  process.exit(1);
}
