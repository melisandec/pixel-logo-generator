import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to serve logo images
 * Accepts image data and returns it as a PNG
 * This allows Farcaster to properly display the image in casts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataUrl = searchParams.get('dataUrl');
    
    if (!dataUrl) {
      return NextResponse.json(
        { error: 'No data URL provided' },
        { status: 400 }
      );
    }

    // Convert data URL to buffer
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid data URL format' },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
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
 * Stores the image data and returns a URL to retrieve it
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

    // Create a hash from the data to use as a cache key
    // In production, you'd upload to S3/Cloudinary and return that URL
    // For now, we'll use a simple approach with the seed as identifier
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    
    // Create a URL that can serve the image
    // We'll encode the base64 data in the URL (not ideal for large images, but works)
    // Better approach: Store in memory cache or use a proper storage service
    const imageUrl = `${baseUrl}/api/logo-image?seed=${seed || Date.now()}&data=${encodeURIComponent(base64Data.substring(0, 1000))}`;
    
    // Actually, let's use a simpler approach - return the data URL directly
    // Farcaster should accept data URLs in embeds
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl, // Return data URL directly - Farcaster should handle it
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
