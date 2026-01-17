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

    // For now, we'll create a URL that includes the data URL as a parameter
    // In production, you'd upload to S3/Cloudinary and return that URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const imageUrl = `${baseUrl}/api/logo-image?dataUrl=${encodeURIComponent(dataUrl)}`;
    
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
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
