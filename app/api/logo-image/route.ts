import { NextRequest, NextResponse } from "next/server";

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
    const id = searchParams.get("id");
    const download = searchParams.get("download");
    const filenameParam = searchParams.get("filename");
    // Support both 'dataUrl' (old format) and 'data' (new format)
    const dataParam = searchParams.get("data") || searchParams.get("dataUrl");

    if (!id && !dataParam) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 },
      );
    }

    let base64Data: string | undefined;

    if (id) {
      const store = getStore();
      cleanupStore(store);
      const entry = store.get(id);
      if (!entry) {
        return NextResponse.json(
          { error: "Image not found or expired" },
          { status: 404 },
        );
      }
      base64Data = entry.base64;
    } else if (dataParam) {
      // Handle both full data URL and base64 string
      if (dataParam.startsWith("data:")) {
        base64Data = dataParam.split(",")[1];
      } else {
        // Already base64 encoded
        base64Data = decodeURIComponent(dataParam);
      }
    }

    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid image data format" },
        { status: 400 },
      );
    }

    const imageBuffer = Buffer.from(base64Data, "base64");
    const safeFilename = filenameParam
      ? decodeURIComponent(filenameParam)
      : "pixel-logo.png";
    const contentDisposition =
      download === "1"
        ? `attachment; filename="${safeFilename}"`
        : `inline; filename="${safeFilename}"`;

    // Return the image with proper headers for Farcaster
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": contentDisposition,
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Logo image error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}

/**
 * POST endpoint to generate both logo and card images
 * Returns URLs for both raw logo (gallery display) and card image (social sharing)
 */
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, cardDataUrl, text, seed, isCardImage } =
      await request.json();

    if (!dataUrl) {
      return NextResponse.json(
        { error: "No data URL provided" },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Process logo image (raw pixel logo)
    const logoBase64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    if (!logoBase64) {
      return NextResponse.json(
        { error: "Invalid data URL format" },
        { status: 400 },
      );
    }

    const logoBuffer = Buffer.from(logoBase64, "base64");
    const logoFilename = `logos/${seed || Date.now()}-${Math.random().toString(36).slice(2)}.png`;

    // Upload logo image
    let logoImageUrl: string | null = null;
    let logoBlobSucceeded = false;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobModule = await import("@vercel/blob").catch(() => null);
        if (blobModule?.put) {
          const logoArrayBuffer = logoBuffer.buffer.slice(
            logoBuffer.byteOffset,
            logoBuffer.byteOffset + logoBuffer.byteLength,
          );
          const logoBlob = await blobModule.put(logoFilename, logoArrayBuffer, {
            access: "public",
            contentType: "image/png",
          });
          logoImageUrl = logoBlob.url;
          logoBlobSucceeded = true;
        }
      } catch (blobError) {
        console.log(
          "Logo blob upload failed:",
          blobError instanceof Error ? blobError.message : "Unknown error",
        );
      }
    }

    // Store logo in memory as fallback
    const store = getStore();
    cleanupStore(store);
    const logoId = `logo-${id}`;
    store.set(logoId, { base64: logoBase64, createdAt: Date.now() });

    if (!logoBlobSucceeded) {
      logoImageUrl = `${baseUrl}/api/logo-image?id=${encodeURIComponent(logoId)}`;
    }

    // Process card image (framed, branded card for sharing)
    let cardImageUrl: string | null = null;
    if (cardDataUrl || isCardImage) {
      const cardBase64 = cardDataUrl
        ? cardDataUrl.includes(",")
          ? cardDataUrl.split(",")[1]
          : cardDataUrl
        : logoBase64;

      const cardBuffer = Buffer.from(cardBase64, "base64");
      const cardFilename = `cards/${seed || Date.now()}-${Math.random().toString(36).slice(2)}.png`;

      let cardBlobSucceeded = false;

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blobModule = await import("@vercel/blob").catch(() => null);
          if (blobModule?.put) {
            const cardArrayBuffer = cardBuffer.buffer.slice(
              cardBuffer.byteOffset,
              cardBuffer.byteOffset + cardBuffer.byteLength,
            );
            const cardBlob = await blobModule.put(
              cardFilename,
              cardArrayBuffer,
              {
                access: "public",
                contentType: "image/png",
              },
            );
            cardImageUrl = cardBlob.url;
            cardBlobSucceeded = true;
          }
        } catch (blobError) {
          console.log(
            "Card blob upload failed:",
            blobError instanceof Error ? blobError.message : "Unknown error",
          );
        }
      }

      // Store card in memory as fallback
      const cardId = `card-${id}`;
      store.set(cardId, { base64: cardBase64, createdAt: Date.now() });

      if (!cardBlobSucceeded) {
        cardImageUrl = `${baseUrl}/api/logo-image?id=${encodeURIComponent(cardId)}`;
      }
    } else {
      // If no card image provided, use logo as card fallback
      cardImageUrl = logoImageUrl;
    }

    if (!logoImageUrl) {
      return NextResponse.json(
        { error: "Failed to generate logo image URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: logoImageUrl, // Legacy field - use logoImageUrl going forward
      logoImageUrl: logoImageUrl, // Raw pixel logo for gallery/preview
      cardImageUrl: cardImageUrl, // Framed card for social sharing
      viewUrl: `${baseUrl}/api/logo-image?id=${encodeURIComponent(`logo-${id}`)}`,
      downloadUrl: `${baseUrl}/api/logo-image?id=${encodeURIComponent(`logo-${id}`)}&download=1&filename=${encodeURIComponent(logoFilename)}`,
      shareUrl: `${baseUrl}?text=${encodeURIComponent(text || "")}&seed=${seed || ""}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}
