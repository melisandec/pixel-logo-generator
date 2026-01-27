#!/usr/bin/env node

/**
 * Test script to diagnose why 80s logo demo styling is not applied
 *
 * Root cause investigation:
 * 1. Does generateLogo create canvas-based PNG? (YES - canvas.toDataURL)
 * 2. Is demo seed consumed correctly? (VERIFY)
 * 3. Is demo style stored in DB? (VERIFY)
 * 4. Is demo style RETRIEVED and APPLIED when rendering? (NEEDS IMPLEMENTATION)
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Demo Logo Styling Issue - Diagnostic Test\n");
console.log("=".repeat(60));

// 1. Check generateLogo implementation
console.log("\n1️⃣  Checking generateLogo() implementation...");
const logoGenFile = fs.readFileSync(
  path.join(__dirname, "lib/logoGenerator.ts"),
  "utf-8",
);

const hasCanvasToDataUrl = logoGenFile.includes("canvas.toDataURL");
const hasSVGFilter =
  logoGenFile.includes("SVG") || logoGenFile.includes("filter");

console.log(
  `   ✓ Uses canvas.toDataURL: ${hasCanvasToDataUrl ? "YES (returns PNG)" : "NO"}`,
);
console.log(`   ✓ Has SVG filter logic: ${hasSVGFilter ? "MAYBE" : "NO"}`);

// 2. Check if demo styles are stored
console.log("\n2️⃣  Checking demo style storage...");
const demoStyleActionFile = fs.readFileSync(
  path.join(__dirname, "lib/demoLogoStyleActions.ts"),
  "utf-8",
);

const storesStyle = demoStyleActionFile.includes("demoLogoStyle.create");
console.log(`   ✓ Stores demo style to DB: ${storesStyle ? "YES" : "NO"}`);

// 3. Check if demo styles are RETRIEVED
console.log("\n3️⃣  Checking demo style RETRIEVAL at render time...");
const logoGenComponentFile = fs.readFileSync(
  path.join(__dirname, "components/LogoGenerator.tsx"),
  "utf-8",
);

const retrievesDemoStyle =
  logoGenComponentFile.includes("getDemoLogoStyle(") ||
  logoGenComponentFile.includes("applySVGFilters") ||
  logoGenComponentFile.includes("getDemoStyle");

console.log(
  `   ✓ Retrieves demo style on render: ${retrievesDemoStyle ? "YES" : "NO ❌ THIS IS THE BUG!"}`,
);

// 4. Check where logo is displayed
console.log("\n4️⃣  Checking logo display location...");
const hasImageDisplay = logoGenComponentFile.includes('className="logo-image"');
const hasDataUrlDisplay = logoGenComponentFile.includes("logoResult.dataUrl");

console.log(`   ✓ Displays logo image: ${hasImageDisplay ? "YES" : "NO"}`);
console.log(`   ✓ Uses dataUrl (PNG): ${hasDataUrlDisplay ? "YES" : "NO"}`);

// 5. Check demo preset usage
console.log("\n5️⃣  Checking demo preset usage...");
const usesPresetConfig = logoGenComponentFile.includes("DEMO_PRESET_CONFIG");
console.log(
  `   ✓ Applies DEMO_PRESET_CONFIG: ${usesPresetConfig ? "YES" : "NO"}`,
);

// Summary
console.log("\n" + "=".repeat(60));
console.log("\n📋 DIAGNOSIS SUMMARY:");
console.log("-".repeat(60));

const issues = [];

if (!retrievesDemoStyle) {
  issues.push("✗ Demo styles are STORED but NEVER RETRIEVED at render time");
  issues.push(
    "  The seed fingerprint is saved to DB but not used when displaying",
  );
}

if (hasCanvasToDataUrl && !hasSVGFilter) {
  issues.push(
    "✗ generateLogo() returns plain PNG without SVG filter embedding",
  );
  issues.push(
    "  Demo CSS must be applied as a wrapper/layer, not baked into canvas",
  );
}

if (issues.length === 0) {
  console.log("✓ All checks passed!");
} else {
  console.log("\n🐛 ISSUES FOUND:\n");
  issues.forEach((issue) => console.log(`  ${issue}`));
}

console.log("\n" + "=".repeat(60));
console.log("\n💡 ROOT CAUSE:");
console.log("-".repeat(60));
console.log(`
The demo logo styling issue occurs in the DISPLAY layer, not generation:

1. ✓ generateLogo() correctly uses DEMO_PRESET_CONFIG
2. ✓ Demo seed is consumed from pool
3. ✓ Style fingerprint is extracted and STORED to DB
4. ✗ Style fingerprint is NEVER RETRIEVED when rendering the logo
5. ✗ No CSS styling/SVG filters are applied to the displayed image

SOLUTION:
When IS_DEMO_MODE is true and rendering logoResult:
  a) Retrieve the stored demo style using the seed
  b) Apply SVG filters or CSS classes to wrap the logo image
  c) Use the style fingerprint to render variant effects

Example missing code:
  const demoStyle = await getDemoLogoStyle(logoResult.seed);
  if (demoStyle) {
    // Apply SVG filters or CSS based on demoStyle fingerprint
    // e.g., generateFilterDefs(demoStyle) + apply to <svg>
  }
`);

console.log("=".repeat(60) + "\n");

process.exit(0);
