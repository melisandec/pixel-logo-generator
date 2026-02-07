import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to convert data URL to a shareable image
 * In production, you'd want to upload to a CDN or storage service
 * For now, we'll return the data URL as-is (clients can use it directly)
 */
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, text, seed, rarity } = await request.json();
    
    if (!dataUrl) {
      return NextResponse.json(
        { error: 'No data URL provided' },
        { status: 400 }
      );
    }

    // In a production app, you'd upload to S3, Cloudinary, etc.
    // For now, we'll return the data URL
    // The client can use this directly in embeds
    
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl, // In production, return the uploaded URL
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pixel-logo-generator.vercel.app'}?text=${encodeURIComponent(text)}&seed=${seed}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
