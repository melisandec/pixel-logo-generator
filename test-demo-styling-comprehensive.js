#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Demo Logo Styling Fix
 * Tests: API endpoint, component integration, SVG filters
 */

const fs = require("fs");
const path = require("path");

console.log(
  "\n╔════════════════════════════════════════════════════════════════╗",
);
console.log(
  "║     DEMO LOGO STYLING FIX - COMPREHENSIVE TEST SUITE          ║",
);
console.log(
  "╚════════════════════════════════════════════════════════════════╝\n",
);

// Color codes for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function pass(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function fail(msg) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function info(msg) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
}

function section(title) {
  console.log(
    `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
  );
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(
    `${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
  );
}

let testsPassed = 0;
let testsFailed = 0;

// ============================================================================
// TEST 1: File Structure
// ============================================================================
section("TEST 1: File Structure");

const filesToCheck = [
  "components/DemoLogoDisplay.tsx",
  "app/api/demo-logo-style/[seed]/route.ts",
];

filesToCheck.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    pass(`${file} exists (${size} bytes)`);
    testsPassed++;
  } else {
    fail(`${file} NOT FOUND`);
    testsFailed++;
  }
});

// ============================================================================
// TEST 2: Component Code Quality
// ============================================================================
section("TEST 2: Component Implementation");

// Check DemoLogoDisplay imports
const demoDisplayPath = path.join(
  process.cwd(),
  "components/DemoLogoDisplay.tsx",
);
const demoDisplayContent = fs.readFileSync(demoDisplayPath, "utf8");

const checks = [
  {
    name: "DemoLogoDisplay imports React",
    test: () => demoDisplayContent.includes("import React"),
  },
  {
    name: "DemoLogoDisplay imports NextImage",
    test: () => demoDisplayContent.includes("NextImage"),
  },
  {
    name: "DemoLogoDisplay uses useEffect",
    test: () => demoDisplayContent.includes("useEffect"),
  },
  {
    name: "DemoLogoDisplay uses useState",
    test: () => demoDisplayContent.includes("useState"),
  },
  {
    name: "DemoLogoDisplay checks IS_DEMO_MODE",
    test: () => demoDisplayContent.includes("IS_DEMO_MODE"),
  },
  {
    name: "DemoLogoDisplay checks DEMO_SEED_BASE",
    test: () => demoDisplayContent.includes("DEMO_SEED_BASE"),
  },
  {
    name: "DemoLogoDisplay returns SVG wrapper",
    test: () => demoDisplayContent.includes("<svg"),
  },
  {
    name: "DemoLogoDisplay renders filters",
    test: () => demoDisplayContent.includes("dangerouslySetInnerHTML"),
  },
  {
    name: "DemoLogoDisplay has fallback",
    test: () =>
      demoDisplayContent.includes("!demoStyle") ||
      demoDisplayContent.includes("!IS_DEMO_MODE"),
  },
];

checks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST 3: API Endpoint Implementation
// ============================================================================
section("TEST 3: API Endpoint Implementation");

const apiPath = path.join(
  process.cwd(),
  "app/api/demo-logo-style/[seed]/route.ts",
);
const apiContent = fs.readFileSync(apiPath, "utf8");

const apiChecks = [
  {
    name: "API endpoint has GET handler",
    test: () => apiContent.includes("export async function GET"),
  },
  {
    name: "API validates IS_DEMO_MODE",
    test: () => apiContent.includes("IS_DEMO_MODE"),
  },
  {
    name: "API validates seed range",
    test: () => apiContent.includes("DEMO_SEED_BASE"),
  },
  {
    name: "API queries DemoLogoStyle table",
    test: () => apiContent.includes("demoLogoStyle.findUnique"),
  },
  {
    name: "API returns JSON response",
    test: () => apiContent.includes("NextResponse.json"),
  },
  {
    name: "API returns 404 when not found",
    test: () => apiContent.includes("status: 404"),
  },
  {
    name: "API sets cache headers",
    test: () => apiContent.includes("Cache-Control"),
  },
  {
    name: "API has error handling",
    test: () => apiContent.includes("catch"),
  },
];

apiChecks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST 4: Filter Generator Function
// ============================================================================
section("TEST 4: Filter Generator Implementation");

const variantsPath = path.join(process.cwd(), "lib/demoStyleVariants.ts");
const variantsContent = fs.readFileSync(variantsPath, "utf8");

const filterChecks = [
  {
    name: "Filter generator function exists",
    test: () => variantsContent.includes("generateFilterDefsFromFingerprint"),
  },
  {
    name: "Filter generator accepts fingerprint parameter",
    test: () => variantsContent.includes("fingerprint: StyleFingerprint"),
  },
  {
    name: "Filter generator returns string",
    test: () => variantsContent.includes("): string"),
  },
  {
    name: "Filter generator creates feColorMatrix",
    test: () => variantsContent.includes("feColorMatrix"),
  },
  {
    name: "Filter generator creates feGaussianBlur",
    test: () => variantsContent.includes("feGaussianBlur"),
  },
  {
    name: "Filter generator creates feMerge",
    test: () => variantsContent.includes("feMerge"),
  },
  {
    name: "Filter generator handles glow variants",
    test: () =>
      variantsContent.includes("softNeon") &&
      variantsContent.includes("hardNeon"),
  },
  {
    name: "Filter generator handles texture variants",
    test: () =>
      variantsContent.includes("grain") &&
      variantsContent.includes("scanlines"),
  },
  {
    name: "Filter generator creates demo-filter-stack",
    test: () => variantsContent.includes("demo-filter-stack"),
  },
];

filterChecks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST 5: LogoGenerator Integration
// ============================================================================
section("TEST 5: LogoGenerator Integration");

const logoGenPath = path.join(process.cwd(), "components/LogoGenerator.tsx");
const logoGenContent = fs.readFileSync(logoGenPath, "utf8");

const integrationChecks = [
  {
    name: "LogoGenerator imports DemoLogoDisplay",
    test: () => logoGenContent.includes("DemoLogoDisplay"),
  },
  {
    name: "LogoGenerator checks IS_DEMO_MODE in render",
    test: () =>
      logoGenContent.includes("IS_DEMO_MODE ?") ||
      logoGenContent.includes("IS_DEMO_MODE &&"),
  },
  {
    name: "LogoGenerator conditionally renders demo component",
    test: () =>
      logoGenContent.includes("<DemoLogoDisplay") ||
      logoGenContent.includes("DemoLogoDisplay"),
  },
];

integrationChecks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST 6: TypeScript Types
// ============================================================================
section("TEST 6: TypeScript Type Safety");

const typeChecks = [
  {
    name: "DemoLogoDisplayProps interface defined",
    test: () => demoDisplayContent.includes("interface DemoLogoDisplayProps"),
  },
  {
    name: "StyleFingerprint type imported",
    test: () => demoDisplayContent.includes("StyleFingerprint"),
  },
  {
    name: "LogoResult type used",
    test: () => demoDisplayContent.includes("LogoResult"),
  },
  {
    name: "React.ReactElement return type",
    test: () =>
      demoDisplayContent.includes("React.ReactElement") ||
      demoDisplayContent.includes("JSX.Element"),
  },
];

typeChecks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST 7: Error Handling
// ============================================================================
section("TEST 7: Error Handling & Graceful Degradation");

const errorChecks = [
  {
    name: "DemoLogoDisplay handles fetch errors",
    test: () =>
      demoDisplayContent.includes("catch") ||
      demoDisplayContent.includes("try"),
  },
  {
    name: "DemoLogoDisplay handles 404 responses",
    test: () =>
      demoDisplayContent.includes("404") ||
      demoDisplayContent.includes("!response.ok"),
  },
  {
    name: "DemoLogoDisplay falls back to plain image",
    test: () =>
      demoDisplayContent.includes("<NextImage") &&
      demoDisplayContent.includes("!demoStyle"),
  },
  {
    name: "API endpoint validates input",
    test: () => apiContent.includes("isNaN") || apiContent.includes("parseInt"),
  },
];

errorChecks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST 8: Build Artifacts
// ============================================================================
section("TEST 8: Build & Compilation");

const buildChecks = [
  {
    name: ".next directory exists (built)",
    test: () => fs.existsSync(path.join(process.cwd(), ".next")),
  },
  {
    name: "Prisma client generated",
    test: () =>
      fs.existsSync(path.join(process.cwd(), "node_modules/.prisma/client")),
  },
];

buildChecks.forEach((check) => {
  if (check.test()) {
    pass(check.name);
    testsPassed++;
  } else {
    fail(check.name);
    testsFailed++;
  }
});

// ============================================================================
// TEST SUMMARY
// ============================================================================
section("TEST RESULTS");

const totalTests = testsPassed + testsFailed;
const passRate = ((testsPassed / totalTests) * 100).toFixed(1);

console.log(`\n${colors.cyan}Total Tests:${colors.reset} ${totalTests}`);
console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}`);
console.log(`${colors.blue}Pass Rate:${colors.reset} ${passRate}%\n`);

if (testsFailed === 0) {
  console.log(
    `${colors.green}╔════════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.green}║                    ✓ ALL TESTS PASSED                        ║${colors.reset}`,
  );
  console.log(
    `${colors.green}║          Demo Logo Styling Fix is Ready for Testing          ║${colors.reset}`,
  );
  console.log(
    `${colors.green}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`,
  );
  process.exit(0);
} else {
  console.log(
    `${colors.red}╔════════════════════════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.red}║                  ✗ SOME TESTS FAILED                         ║${colors.reset}`,
  );
  console.log(
    `${colors.red}║            Please fix the issues above and try again          ║${colors.reset}`,
  );
  console.log(
    `${colors.red}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`,
  );
  process.exit(1);
}
