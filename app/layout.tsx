import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Logo Forge - Retro Arcade Logo Generator',
  description: 'Generate retro pixelated logos with arcade aesthetics',
  openGraph: {
    title: 'Pixel Logo Forge',
    description: 'Generate retro arcade-style pixelated logos with collectible rarity system',
    images: [
      {
        url: 'https://pixel-logo-generator.vercel.app/display.png',
        width: 1200,
        height: 630,
        alt: 'Pixel Logo Forge - Retro Arcade Logo Generator',
      },
    ],
    url: 'https://pixel-logo-generator.vercel.app',
    siteName: 'Pixel Logo Forge',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Logo Forge',
    description: 'Generate retro arcade-style pixelated logos with collectible rarity system',
    images: ['https://pixel-logo-generator.vercel.app/display.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Pixel Logo Forge" />
        <meta
          property="og:description"
          content="Generate retro arcade-style pixelated logos with collectible rarity system"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pixel-logo-generator.vercel.app" />
        <meta
          property="og:image"
          content="https://pixel-logo-generator.vercel.app/display.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://pixel-logo-generator.vercel.app/display.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Pixel Logo Forge - Retro Arcade Logo Generator" />
        <meta
          name="fc:miniapp"
          content={JSON.stringify({
            version: "1",
            imageUrl: "https://pixel-logo-generator.vercel.app/display.png",
            button: {
              title: "Generate Logo",
              action: {
                type: "launch_miniapp",
                url: "https://pixel-logo-generator.vercel.app",
                name: "Pixel Logo Forge",
                splashImageUrl: "https://pixel-logo-generator.vercel.app/splash.png",
                splashBackgroundColor: "#000000"
              }
            }
          })}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
