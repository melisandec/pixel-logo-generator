#!/usr/bin/env node
/**
 * Test script: Verify casted flag functionality
 * Tests the flow of:
 * 1. Creating a logo with casted=false
 * 2. Fetching logos in Logo Gallery (all logos)
 * 3. Marking a logo as casted via PATCH
 * 4. Fetching logos in Cast Gallery (only casted=true)
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

interface Logo {
  id: string;
  text: string;
  seed: number;
  casted: boolean;
  username?: string;
  createdAt: string;
}

async function test() {
  console.log("🧪 Testing casted flag functionality...\n");

  try {
    // Step 1: Create a test logo
    console.log("1️⃣  Creating a test logo with casted=false...");
    const testId = `test-${Date.now()}`;
    const createRes = await fetch(`${BASE_URL}/api/generated-logos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testId,
        text: "Test Logo 🎨",
        seed: 12345,
        rarity: "COMMON",
        username: "testuser",
        casted: false,
        likes: 0,
        recasts: 0,
        saves: 0,
        remixes: 0,
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create logo: ${await createRes.text()}`);
    }

    const { entry: created } = await createRes.json();
    console.log(`   ✅ Logo created with id: ${created.id}`);
    console.log(`   📊 casted = ${created.casted} (should be false)\n`);

    if (created.casted !== false) {
      throw new Error("❌ Logo should have casted=false on creation");
    }

    // Step 2: Fetch all logos (Logo Gallery)
    console.log("2️⃣  Fetching Logo Gallery (all logos, no casted filter)...");
    const allLogosRes = await fetch(
      `${BASE_URL}/api/generated-logos?sort=recent&limit=50`
    );
    if (!allLogosRes.ok) {
      throw new Error(
        `Failed to fetch all logos: ${await allLogosRes.text()}`
      );
    }

    const { entries: allLogos } = await allLogosRes.json();
    const foundInAll = allLogos.find((l: Logo) => l.id === testId);
    console.log(
      `   ✅ Found ${allLogos.length} logos total (including test logo)`
    );
    if (!foundInAll) {
      throw new Error("❌ Test logo not found in Logo Gallery");
    }
    console.log(`   📝 Test logo found in Logo Gallery\n`);

    // Step 3: Fetch only casted logos (should be empty initially)
    console.log("3️⃣  Fetching Cast Gallery (only casted=true)...");
    const castedRes = await fetch(
      `${BASE_URL}/api/generated-logos?sort=recent&casted=true&limit=50`
    );
    if (!castedRes.ok) {
      throw new Error(`Failed to fetch casted logos: ${await castedRes.text()}`);
    }

    const { entries: castedLogos } = await castedRes.json();
    const foundInCasted = castedLogos.find((l: Logo) => l.id === testId);
    console.log(`   ✅ Found ${castedLogos.length} casted logos`);
    if (foundInCasted) {
      throw new Error(
        "❌ Test logo should NOT be in Cast Gallery yet (casted=false)"
      );
    }
    console.log(`   📝 Test logo correctly NOT in Cast Gallery yet\n`);

    // Step 4: Mark logo as casted via PATCH
    console.log("4️⃣  Patching logo to mark as casted=true...");
    const patchRes = await fetch(`${BASE_URL}/api/generated-logos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: testId,
        casted: true,
      }),
    });

    if (!patchRes.ok) {
      throw new Error(`Failed to patch logo: ${await patchRes.text()}`);
    }

    const { entry: patched } = await patchRes.json();
    console.log(`   ✅ Logo patched successfully`);
    console.log(`   📊 casted = ${patched.casted} (should be true)\n`);

    if (patched.casted !== true) {
      throw new Error("❌ Logo should have casted=true after patching");
    }

    // Step 5: Fetch casted logos again (should now include test logo)
    console.log("5️⃣  Fetching Cast Gallery again (should now include test logo)...");
    const castedRes2 = await fetch(
      `${BASE_URL}/api/generated-logos?sort=recent&casted=true&limit=50`
    );
    if (!castedRes2.ok) {
      throw new Error(
        `Failed to fetch casted logos: ${await castedRes2.text()}`
      );
    }

    const { entries: castedLogos2 } = await castedRes2.json();
    const foundInCasted2 = castedLogos2.find((l: Logo) => l.id === testId);
    console.log(`   ✅ Found ${castedLogos2.length} casted logos`);
    if (!foundInCasted2) {
      throw new Error("❌ Test logo should now be in Cast Gallery");
    }
    console.log(`   📝 Test logo now correctly in Cast Gallery\n`);

    // Step 6: Verify logo still in Logo Gallery
    console.log("6️⃣  Verifying logo still in Logo Gallery...");
    const allLogosRes2 = await fetch(
      `${BASE_URL}/api/generated-logos?sort=recent&limit=50`
    );
    if (!allLogosRes2.ok) {
      throw new Error(
        `Failed to fetch all logos: ${await allLogosRes2.text()}`
      );
    }

    const { entries: allLogos2 } = await allLogosRes2.json();
    const foundInAll2 = allLogos2.find((l: Logo) => l.id === testId);
    if (!foundInAll2) {
      throw new Error("❌ Test logo should still be in Logo Gallery");
    }
    console.log(
      `   ✅ Found ${allLogos2.length} logos total (still includes test logo)\n`
    );

    console.log("✨ All tests passed! Casted flag functionality works correctly.\n");
    console.log("Summary:");
    console.log("  ✅ Logo created with casted=false");
    console.log("  ✅ Logo appears in Logo Gallery");
    console.log("  ✅ Logo NOT in Cast Gallery initially");
    console.log("  ✅ PATCH endpoint successfully updates casted=true");
    console.log("  ✅ Logo now appears in Cast Gallery");
    console.log("  ✅ Logo still appears in Logo Gallery");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

test();
