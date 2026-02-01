#!/usr/bin/env node

/**
 * VERCEL BLOB STORAGE AUDIT
 * 
 * Checks what images are stored in Vercel Blob storage
 * Useful for understanding storage usage and finding orphaned images
 */

const fs = require("fs");
const path = require("path");

async function auditBlobStorage() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🔍 VERCEL BLOB STORAGE AUDIT 🔍                       ║
║     Checking Vercel Blob for stored logo images                ║
╚════════════════════════════════════════════════════════════════╝
`);

  // Check environment
  console.log("\n📋 ENVIRONMENT CONFIGURATION:\n");
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log(`  BLOB_READ_WRITE_TOKEN: ${token ? "✓ SET" : "❌ NOT SET"}`);
  console.log(`  NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || "⚠️  NOT SET (using localhost)"}`);

  if (!token) {
    console.log(`
⚠️  BLOB STORAGE NOT CONFIGURED

Vercel Blob is optional. Current configuration:
  • BLOB_READ_WRITE_TOKEN not set
  • Images stored in: In-memory cache (10 min TTL)
  • Persistence: Temporary (not persisted across server restarts)

═══════════════════════════════════════════════════════════════════

TO ENABLE VERCEL BLOB:

1. Set BLOB_READ_WRITE_TOKEN in your .env:
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

2. Generate token at: https://vercel.com/account/store

3. Redeploy or restart server

4. Re-run this script to see blob storage details

═══════════════════════════════════════════════════════════════════
`);
    return;
  }

  // If token is set, try to list blobs
  console.log("\n📦 ATTEMPTING BLOB LIST:\n");

  try {
    const blobModule = await import("@vercel/blob");
    if (!blobModule?.list) {
      console.log("  ⚠️  @vercel/blob module loaded but 'list' method not available");
      console.log("  This is expected - list requires different API");
      console.log("\nℹ️  In-memory images stored: unknown (no query available)");
      console.log("   Use: node test-demo-styling-comprehensive.js to generate test logos");
      return;
    }

    // Try to list with prefix
    console.log("  Attempting to list blobs with 'logos/' prefix...\n");

    try {
      // Note: list() might not be available in all @vercel/blob versions
      // If available, it would return blob metadata
      const result = await blobModule.list({
        prefix: "logos/",
        limit: 100,
      });

      if (result.blobs && result.blobs.length > 0) {
        console.log(`  ✓ Found ${result.blobs.length} logo blobs:\n`);
        result.blobs.forEach((blob, idx) => {
          const sizeKB = (blob.size / 1024).toFixed(2);
          const date = new Date(blob.uploadedAt).toLocaleString();
          console.log(`  ${idx + 1}. ${blob.pathname}`);
          console.log(`     Size: ${sizeKB} KB`);
          console.log(`     Uploaded: ${date}`);
          console.log(`     URL: ${blob.url}`);
          console.log();
        });

        // Summary
        const totalSize = result.blobs.reduce((sum, b) => sum + b.size, 0);
        console.log(`\n  📊 SUMMARY:`);
        console.log(`     Total blobs: ${result.blobs.length}`);
        console.log(`     Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      } else {
        console.log("  ✓ No logo blobs found in Vercel Blob storage");
        console.log("  (Images may be in in-memory cache with 10min TTL)");
      }
    } catch (e) {
      if (e.message.includes("not a function")) {
        console.log("  ℹ️  Vercel Blob 'list' API not available in this version");
        console.log(`     Current @vercel/blob version: check package.json`);
        console.log(`     Available methods: put, delete, copy (check docs)`);
      } else {
        console.log(`  ⚠️  Error listing blobs: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ Error importing @vercel/blob: ${e.message}`);
    console.log("     Make sure '@vercel/blob' is installed: npm install @vercel/blob");
  }

  // Show storage information
  console.log(`
═══════════════════════════════════════════════════════════════════

📍 BLOB STORAGE LOCATIONS:

Path Pattern:    logos/{seed}-{randomId}.png
Example:         logos/960660649-abc123xyz.png
Storage:         Vercel Blob (if token set) OR in-memory
TTL:             ∞ (Vercel) or 10 minutes (in-memory)

═══════════════════════════════════════════════════════════════════

🔗 API ROUTE:

Endpoint:        POST /api/logo-image
Input:           { dataUrl, cardDataUrl, text, seed }
Output:          { imageUrl, cardImageUrl }
Logic:           
  1. Try Vercel Blob upload (if token set)
  2. Fall back to in-memory store if upload fails
  3. Return appropriate URL

═══════════════════════════════════════════════════════════════════

📊 IN-MEMORY CACHE STATUS:

Since database is empty, in-memory cache also likely empty.
  • Max cache entries: Unlimited
  • Cache TTL: 10 minutes
  • Storage: Server RAM (cleared on restart)
  • Size limit: Practical limit is available RAM

To test cache:
  1. Generate a logo on the app
  2. Check /api/logo-image?id=<id> endpoint
  3. Or run: node database-audit.js (checks only DB, not cache)

═══════════════════════════════════════════════════════════════════

🎯 RECOMMENDATIONS:

1. For production: Enable Vercel Blob
   • Set BLOB_READ_WRITE_TOKEN
   • Images persist across restarts
   • Better for CDN and edge caching

2. For development: In-memory is fine
   • Temporary 10-minute storage
   • No additional configuration needed
   • Images lost on server restart (OK for dev)

3. Monitor blob usage:
   • Check Vercel dashboard for storage metrics
   • Set up alerts for quota warnings
   • Clean up old images periodically

═══════════════════════════════════════════════════════════════════
`);
}

auditBlobStorage();
