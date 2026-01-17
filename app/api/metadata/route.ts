import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Pixel Logo Forge',
    description: 'Generate retro pixelated logos with arcade aesthetics',
    imageUrl: '/og-image.png', // You can add an OG image later
    button: {
      text: 'Generate Logo',
      action: {
        type: 'launch_frame',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
    },
  });
}
