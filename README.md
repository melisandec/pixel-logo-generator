# Pixel Logo Forge

A Farcaster mini app that generates retro pixelated logos with arcade aesthetics. Transform any word or phrase into a nostalgic 8-bit style logo reminiscent of classic arcade games and early computer graphics.

## Features

- 🎮 **Retro Arcade Aesthetics**: 8-bit typography, pixelated graphics, CRT effects
- 🎨 **Randomized Variations**: Each logo has unique color palettes, pixel density, shadows, glows, and border styles
- 🔄 **Deterministic Generation**: Same input text generates the same logo (seed-based)
- 📥 **Export Options**: Download as PNG or share directly to Farcaster
- 🎯 **Multiple Border Styles**: Arcade frames, terminal windows, badges, and more

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Usage

1. Enter a word or phrase (max 30 characters)
2. Click "GENERATE" to create your retro pixel logo
3. Download as PNG or share to Farcaster

## Technical Details

- **Framework**: Next.js 14 with React
- **Rendering**: Canvas-based pixel art generation
- **Fonts**: Press Start 2P (pixel font) + Courier New (monospace)
- **Styling**: Custom CSS with CRT effects, scanlines, and retro color schemes

## Logo Generation

The logo generator uses:
- Deterministic seeded random number generation
- Multiple retro color palettes (CGA, EGA, CRT Green, Arcade Neon, Terminal Amber)
- Pixelation algorithms for authentic 8-bit look
- CRT scanline and vignette effects
- Multiple border styles (arcade, terminal, badge)

## License

MIT
