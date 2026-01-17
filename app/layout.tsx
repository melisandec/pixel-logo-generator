import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Logo Forge - Retro Arcade Logo Generator',
  description: 'Generate retro pixelated logos with arcade aesthetics',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="fc:miniapp"
          content={JSON.stringify({
            version: "1",
            imageUrl: "https://pixel-logo-generator.vercel.app/og-image.png",
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
