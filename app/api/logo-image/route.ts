import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to serve logo images
 * Accepts image data and returns it as a PNG
 * This allows Farcaster to properly display the image in casts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Support both 'dataUrl' (old format) and 'data' (new format)
    const dataParam = searchParams.get('data') || searchParams.get('dataUrl');
    
    if (!dataParam) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Handle both full data URL and base64 string
    let base64Data: string;
    if (dataParam.startsWith('data:')) {
      base64Data = dataParam.split(',')[1];
    } else {
      // Already base64 encoded
      base64Data = decodeURIComponent(dataParam);
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

    // Create a URL that can serve the image via GET
    // We'll use the seed as identifier and encode the base64 data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    
    // Create HTTP URL that will serve the image
    // The GET endpoint will decode and serve it
    const imageUrl = `${baseUrl}/api/logo-image?seed=${seed || Date.now()}&data=${encodeURIComponent(base64Data)}`;
    
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
