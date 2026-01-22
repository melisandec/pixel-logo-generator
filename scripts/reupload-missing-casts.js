const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fetchBuffer(url) {
  try {
    if (!url) return null;
    // If data URL
    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const base64 = parts[1];
      return Buffer.from(base64, 'base64');
    }

    // If relative path, try to resolve against NEXT_PUBLIC_APP_URL or localhost
    if (url.startsWith('/')) {
      const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      url = base.replace(/\/$/, '') + url;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
      return null;
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    console.warn('fetchBuffer error for', url, err && err.message ? err.message : err);
    return null;
  }
}

async function tryUpload(buffer, filename) {
  if (!buffer) return null;
  // Prefer blob upload when token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobModule = await import('@vercel/blob').catch(() => null);
      if (blobModule && blobModule.put) {
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        );
        const result = await blobModule.put(filename, arrayBuffer, {
          access: 'public',
          contentType: 'image/png',
        });
        if (result && result.url) return result.url;
      } else {
        console.log('No @vercel/blob available even though token present');
      }
    } catch (err) {
      console.warn('Blob upload failed:', err && err.message ? err.message : err);
    }
  }

  // Blob not available or failed — let caller try the app API fallback
  return null;
}

async function fallbackPostToApi(buffer, baseUrl, text, seed) {
  try {
    if (!baseUrl) return null;
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/logo-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, cardDataUrl: dataUrl, text: text || '', seed: seed || 0, isCardImage: false }),
    });
    if (!res.ok) {
      console.warn('Fallback POST failed:', res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return json.logoImageUrl || json.imageUrl || json.viewUrl || null;
  } catch (err) {
    console.warn('Fallback POST error:', err && err.message ? err.message : err);
    return null;
  }
}

async function main() {
  console.log('\n=== Re-upload missing cast images to blob and populate castUrl ===\n');

  // Find generated logos that are not marked casted or have no castUrl but have some image
  const candidates = await prisma.generatedLogo.findMany({
    where: {
      AND: [
        { castUrl: null },
        {
          OR: [
            { logoImageUrl: { not: null } },
            { cardImageUrl: { not: null } },
            { mediumImageUrl: { not: null } },
            { imageUrl: { not: null } },
          ],
        },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${candidates.length} GeneratedLogo rows missing castUrl`);

  let updated = 0;
  const failures = [];

  for (const g of candidates) {
    const src = g.logoImageUrl || g.mediumImageUrl || g.cardImageUrl || g.imageUrl;
    if (!src) {
      failures.push({ id: g.id, reason: 'no source image URL' });
      continue;
    }

    console.log(`Processing ${g.id} (user=${g.username}) -> ${src}`);

    const buffer = await fetchBuffer(src);
    if (!buffer) {
      failures.push({ id: g.id, reason: `failed to fetch ${src}` });
      continue;
    }

    const filename = `casts/${g.id}-${Date.now()}.png`;
    // Try blob upload first
    let finalUrl = await tryUpload(buffer, filename);

    // If blob upload not available or failed, try posting to the running app's API
    if (!finalUrl) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      console.log('Attempting fallback POST to', baseUrl);
      const fallbackUrl = await fallbackPostToApi(buffer, baseUrl, g.text, g.seed);
      if (fallbackUrl) finalUrl = fallbackUrl;
    }

    if (!finalUrl) {
      failures.push({ id: g.id, reason: 'blob upload failed or not configured and fallback failed' });
      continue;
    }

    try {
      await prisma.generatedLogo.update({ where: { id: g.id }, data: { castUrl: finalUrl, casted: true } });
      console.log(`Updated ${g.id} -> ${finalUrl}`);
      updated += 1;
    } catch (err) {
      console.warn('DB update failed for', g.id, err && err.message ? err.message : err);
      failures.push({ id: g.id, reason: 'db update failed' });
    }
  }

  console.log(`\nDone. Updated ${updated} rows. Failures: ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failures sample:', failures.slice(0, 10));
  }

  await prisma.$disconnect();
  console.log('\n=== Finished ===\n');
}

main().catch((e) => {
  console.error('Script error:', e && e.message ? e.message : e);
  process.exit(1);
});
