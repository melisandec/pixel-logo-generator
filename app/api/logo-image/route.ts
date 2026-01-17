import { NextRequest, NextResponse } from 'next/server';

type StoredImage = { base64: string; createdAt: number };

const STORE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getStore(): Map<string, StoredImage> {
  const globalStore = globalThis as typeof globalThis & {
    __logoImageStore?: Map<string, StoredImage>;
  };
  if (!globalStore.__logoImageStore) {
    globalStore.__logoImageStore = new Map<string, StoredImage>();
  }
  return globalStore.__logoImageStore;
}

function cleanupStore(store: Map<string, StoredImage>) {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now - value.createdAt > STORE_TTL_MS) {
      store.delete(key);
    }
  }
}

/**
 * API route to serve logo images
 * Accepts image data and returns it as a PNG
 * This allows Farcaster to properly display the image in casts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    // Support both 'dataUrl' (old format) and 'data' (new format)
    const dataParam = searchParams.get('data') || searchParams.get('dataUrl');
    
    if (!id && !dataParam) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    let base64Data: string | undefined;

    if (id) {
      const store = getStore();
      cleanupStore(store);
      const entry = store.get(id);
      if (!entry) {
        return NextResponse.json(
          { error: 'Image not found or expired' },
          { status: 404 }
        );
      }
      base64Data = entry.base64;
    } else if (dataParam) {
      // Handle both full data URL and base64 string
      if (dataParam.startsWith('data:')) {
        base64Data = dataParam.split(',')[1];
      } else {
        // Already base64 encoded
        base64Data = decodeURIComponent(dataParam);
      }
    }
    
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Return the image with proper headers for Farcaster
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Logo image error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to generate a shareable image URL
 * Returns a URL that can be used to retrieve the image via GET
 */
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, text, seed } = await request.json();
    
    if (!dataUrl) {
      return NextResponse.json(
        { error: 'No data URL provided' },
        { status: 400 }
      );
    }

    // Extract base64 data
    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid data URL format' },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Try to upload to Vercel Blob first, fallback to in-memory store
    let imageUrl: string | null = null;
    const filename = `logo-${seed || Date.now()}-${Math.random().toString(36).slice(2)}.png`;
    
    // Try Vercel Blob first, fallback to in-memory store
    let blobUploadSucceeded = false;
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        // Lazy import to avoid build-time issues
        const blobModule = await import('@vercel/blob').catch(() => null);
        if (blobModule?.put) {
          // Convert Buffer to ArrayBuffer (which is explicitly supported by Vercel Blob)
          const arrayBuffer = imageBuffer.buffer.slice(
            imageBuffer.byteOffset,
            imageBuffer.byteOffset + imageBuffer.byteLength
          );
          const blob = await blobModule.put(filename, arrayBuffer, {
            access: 'public',
            contentType: 'image/png',
          });
          imageUrl = blob.url;
          blobUploadSucceeded = true;
        }
      } catch (blobError) {
        // Blob upload failed, will use fallback
        console.log('Vercel Blob upload failed:', blobError instanceof Error ? blobError.message : 'Unknown error');
      }
    }
    
    // Use fallback if Blob upload didn't succeed
    if (!blobUploadSucceeded) {
      const store = getStore();
      cleanupStore(store);
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      store.set(id, { base64: base64Data, createdAt: Date.now() });
      imageUrl = `${baseUrl}/api/logo-image?id=${encodeURIComponent(id)}`;
    }
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl, // HTTP URL that serves the image
      shareUrl: `${baseUrl}?text=${encodeURIComponent(text || '')}&seed=${seed || ''}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
