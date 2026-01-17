// Deterministic random number generator using seed
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  random(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }

  pick<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }
}

// Generate seed from string
function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Rarity tiers
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

// Color system modes
const COLOR_SYSTEMS = {
  NES: ['#7C7C7C', '#0000FC', '#0000BC', '#4428BC', '#940084', '#A80020', '#A81000', '#881400', '#503000', '#007800', '#006800', '#005800', '#004058', '#000000', '#000000', '#000000', '#BCBCBC', '#0078F8', '#0058F8', '#6844FC', '#D800CC', '#E40058', '#F83800', '#E45C10', '#AC7C00', '#00B800', '#00A800', '#00A844', '#008888', '#000000', '#000000', '#000000', '#F8F8F8', '#3CBCFC', '#6888FC', '#9878F8', '#F878F8', '#F85898', '#F87858', '#FCA044', '#F8B800', '#B8F818', '#58D854', '#58F898', '#00E8D8', '#787878', '#000000', '#000000', '#FCFCFC', '#A4E4FC', '#B8B8F8', '#D8B8F8', '#F8B8F8', '#F8A4C0', '#F0D0B0', '#FCE0A8', '#F8D878', '#D8F878', '#B8F8B8', '#B8F8D8', '#00FCFC', '#F8D8F8', '#000000', '#000000'],
  GameBoy: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
  CGA: ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA', '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'],
  Vaporwave: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B', '#FB5607', '#FF006E', '#FF9F00', '#FFB703', '#FFD60A'],
  Cyberpunk: ['#000000', '#1A0033', '#330066', '#4D0099', '#6600CC', '#7F00FF', '#00FF41', '#00FF88', '#00FFCC', '#00FFFF'],
  Sepia: ['#1C1C1C', '#2D2D2D', '#3D3D3D', '#4D4D2D', '#5D5D3D', '#6D6D4D', '#7D7D5D', '#8D8D6D', '#9D9D7D', '#ADAD8D', '#BDBD9D', '#CDCDAD'],
  Classic: ['#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'],
};

type ColorSystem = keyof typeof COLOR_SYSTEMS;

// Background styles
type BackgroundStyle = 
  | 'solid' 
  | 'crt-scanlines' 
  | 'starfield' 
  | 'grid-horizon' 
  | 'checkerboard' 
  | 'pixel-noise' 
  | 'sunset-gradient' 
  | 'terminal-green' 
  | 'paper-texture' 
  | 'dos-boot' 
  | 'vaporwave-sky';

// Frame styles
type FrameStyle = 
  | 'none' 
  | 'arcade-bezel' 
  | 'computer-window' 
  | 'cartridge-label' 
  | 'floppy-disk' 
  | 'trading-card' 
  | 'terminal-box' 
  | 'nes-title' 
  | 'sega-plaque';

// Composition modes
type CompositionMode = 
  | 'centered' 
  | 'top-heavy' 
  | 'wide-cinematic' 
  | 'badge-emblem' 
  | 'vertical-stacked' 
  | 'curved-baseline';

// Text effects
interface TextEffects {
  gradient: boolean;
  doubleShadow: boolean;
  chunkyOutline: boolean;
  invertedPixels: boolean;
  metallic: boolean;
  cracked: boolean;
  stacked3D: boolean;
  slanted: boolean;
  waveDistortion: boolean;
  cartridgePrint: boolean;
}

// Badge types
type BadgeType = 'star' | 'bolt' | 'flame' | 'skull' | 'coin' | 'player1' | 'ready' | 'insert-coin' | 'version' | 'year' | 'rating';

interface LogoConfig {
  text: string;
  seed?: number;
  pixelSize?: number;
  colorSystem?: ColorSystem;
  backgroundColor?: string;
  backgroundStyle?: BackgroundStyle;
  frameStyle?: FrameStyle;
  compositionMode?: CompositionMode;
  textEffects?: TextEffects;
  rarity?: Rarity;
  badges?: BadgeType[];
}

export interface LogoResult {
  dataUrl: string;
  seed: number;
  rarity: Rarity;
  config: LogoConfig;
}

// Determine rarity based on features
function determineRarity(rng: SeededRandom, hasAdvancedEffects: boolean, hasSpecialFrame: boolean, hasSpecialBackground: boolean): Rarity {
  const roll = rng.next();
  if (roll < 0.5) return 'COMMON';
  if (roll < 0.8) return 'RARE';
  if (roll < 0.95) return 'EPIC';
  return 'LEGENDARY';
}

// Select features based on rarity
function selectFeaturesByRarity(rarity: Rarity, rng: SeededRandom) {
  const features: {
    textEffects: Partial<TextEffects>;
    backgroundStyle: BackgroundStyle;
    frameStyle: FrameStyle;
    colorSystem: ColorSystem;
    compositionMode: CompositionMode;
    badges: BadgeType[];
  } = {
    textEffects: {},
    backgroundStyle: 'solid',
    frameStyle: 'none',
    colorSystem: 'Classic',
    compositionMode: 'centered',
    badges: [],
  };

  // COMMON: Basic features
  if (rarity === 'COMMON') {
    features.backgroundStyle = rng.pick(['solid', 'crt-scanlines']);
    features.frameStyle = rng.pick(['none', 'arcade-bezel']);
    features.colorSystem = rng.pick(['Classic', 'CGA']);
    features.compositionMode = 'centered';
  }
  
  // RARE: Add glow, gradients, special backgrounds
  if (rarity === 'RARE') {
    features.textEffects.gradient = rng.next() > 0.5;
    features.textEffects.doubleShadow = rng.next() > 0.6;
    features.backgroundStyle = rng.pick(['starfield', 'grid-horizon', 'checkerboard', 'sunset-gradient']);
    features.frameStyle = rng.pick(['arcade-bezel', 'computer-window', 'terminal-box']);
    features.colorSystem = rng.pick(['NES', 'GameBoy', 'Vaporwave']);
    features.compositionMode = rng.pick(['centered', 'top-heavy', 'wide-cinematic']);
    if (rng.next() > 0.5) {
      features.badges.push(rng.pick(['version', 'year', 'rating']));
    }
  }
  
  // EPIC: Advanced effects, special frames
  if (rarity === 'EPIC') {
    features.textEffects.gradient = true;
    features.textEffects.doubleShadow = true;
    features.textEffects.chunkyOutline = rng.next() > 0.4;
    features.textEffects.metallic = rng.next() > 0.5;
    features.textEffects.stacked3D = rng.next() > 0.6;
    features.backgroundStyle = rng.pick(['vaporwave-sky', 'dos-boot', 'paper-texture', 'pixel-noise']);
    features.frameStyle = rng.pick(['cartridge-label', 'floppy-disk', 'trading-card', 'nes-title']);
    features.colorSystem = rng.pick(['NES', 'Vaporwave', 'Cyberpunk']);
    features.compositionMode = rng.pick(['badge-emblem', 'vertical-stacked', 'curved-baseline']);
    features.badges.push(rng.pick(['star', 'bolt', 'flame', 'skull', 'coin']));
    if (rng.next() > 0.3) {
      features.badges.push(rng.pick(['player1', 'ready', 'insert-coin']));
    }
  }
  
  // LEGENDARY: All the effects
  if (rarity === 'LEGENDARY') {
    features.textEffects = {
      gradient: true,
      doubleShadow: true,
      chunkyOutline: true,
      invertedPixels: rng.next() > 0.5,
      metallic: true,
      cracked: rng.next() > 0.6,
      stacked3D: true,
      slanted: rng.next() > 0.5,
      waveDistortion: rng.next() > 0.6,
      cartridgePrint: rng.next() > 0.7,
    };
    features.backgroundStyle = rng.pick(['vaporwave-sky', 'dos-boot', 'starfield']);
    features.frameStyle = rng.pick(['sega-plaque', 'trading-card', 'nes-title']);
    features.colorSystem = rng.pick(['NES', 'Vaporwave', 'Cyberpunk']);
    features.compositionMode = rng.pick(['curved-baseline', 'badge-emblem', 'vertical-stacked']);
    features.badges = [
      rng.pick(['star', 'bolt', 'flame', 'skull', 'coin']),
      rng.pick(['player1', 'ready', 'insert-coin']),
      'version',
      'year',
      'rating',
    ];
  }

  return features;
}

export function generateLogo(config: LogoConfig): LogoResult {
  const seed = config.seed ?? stringToSeed(config.text);
  const rng = new SeededRandom(seed);

  // Determine rarity
  const rarity = config.rarity ?? determineRarity(rng, false, false, false);
  
  // Select features based on rarity
  const features = selectFeaturesByRarity(rarity, rng);
  
  // Override with config if provided
  const colorSystem = config.colorSystem ?? features.colorSystem;
  const colorPalette = COLOR_SYSTEMS[colorSystem];
  const pixelSize = config.pixelSize ?? rng.randomInt(3, 6);
  const backgroundStyle = config.backgroundStyle ?? features.backgroundStyle;
  const frameStyle = config.frameStyle ?? features.frameStyle;
  const compositionMode = config.compositionMode ?? features.compositionMode;
  const textEffects = config.textEffects ?? features.textEffects;
  const badges = config.badges ?? features.badges;

  // Background color
  const backgroundColor = config.backgroundColor ?? (rng.next() > 0.3 
    ? rng.pick(colorPalette.slice(0, Math.floor(colorPalette.length / 2))) 
    : colorPalette[0]);

  // Text color (high contrast)
  const textColors = colorPalette.filter(c => {
    const bgLum = getLuminance(backgroundColor);
    const textLum = getLuminance(c);
    return Math.abs(bgLum - textLum) > 0.3;
  });
  const textColor = textColors.length > 0 ? rng.pick(textColors) : colorPalette[colorPalette.length - 1];

  // Canvas setup
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.imageSmoothingEnabled = false;

  // Measure text
  const fontSize = pixelSize * 12;
  ctx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;
  const metrics = ctx.measureText(config.text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;

  // Calculate dimensions based on composition
  let padding = pixelSize * 12;
  let borderWidth = frameStyle !== 'none' ? pixelSize * 6 : 0;
  
  if (compositionMode === 'wide-cinematic') {
    padding = pixelSize * 8;
  } else if (compositionMode === 'badge-emblem') {
    padding = pixelSize * 16;
  }

  const totalWidth = Math.ceil(textWidth) + padding * 2 + borderWidth * 2;
  const totalHeight = Math.ceil(textHeight) + padding * 2 + borderWidth * 2;

  canvas.width = Math.ceil(totalWidth / pixelSize) * pixelSize;
  canvas.height = Math.ceil(totalHeight / pixelSize) * pixelSize;

  // Draw background
  drawBackground(ctx, canvas.width, canvas.height, backgroundStyle, backgroundColor, colorPalette, rng, pixelSize);

  // Draw frame
  if (frameStyle !== 'none') {
    drawFrame(ctx, frameStyle, borderWidth, canvas.width, canvas.height, colorPalette, rng, pixelSize);
  }

  // Calculate text position based on composition
  let textX = borderWidth + padding;
  let textY = borderWidth + padding;
  
  if (compositionMode === 'centered' || compositionMode === 'badge-emblem') {
    textY = borderWidth + (canvas.height - borderWidth * 2 - textHeight) / 2;
  } else if (compositionMode === 'top-heavy') {
    textY = borderWidth + padding;
  } else if (compositionMode === 'wide-cinematic') {
    textX = borderWidth + (canvas.width - borderWidth * 2 - textWidth) / 2;
    textY = borderWidth + padding;
  }

  // Draw badges
  drawBadges(ctx, badges, canvas.width, canvas.height, colorPalette, rng, pixelSize);

  // Draw text with effects
  renderTextWithEffects(
    ctx,
    config.text,
    textX,
    textY,
    pixelSize,
    textColor,
    textEffects,
    colorPalette,
    rng,
    compositionMode
  );

  // Apply final effects
  applyFinalEffects(ctx, canvas.width, canvas.height, rng, pixelSize, backgroundStyle);

  const finalConfig: LogoConfig = {
    text: config.text,
    seed,
    pixelSize,
    colorSystem,
    backgroundColor,
    backgroundStyle,
    frameStyle,
    compositionMode,
    textEffects,
    rarity,
    badges,
  };

  return {
    dataUrl: canvas.toDataURL('image/png'),
    seed,
    rarity,
    config: finalConfig,
  };
}

// Draw background styles
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: BackgroundStyle,
  baseColor: string,
  palette: string[],
  rng: SeededRandom,
  pixelSize: number
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  switch (style) {
    case 'crt-scanlines':
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += pixelSize * 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;

    case 'starfield':
      ctx.fillStyle = rng.pick(palette);
      for (let i = 0; i < 50; i++) {
        const x = rng.randomInt(0, width);
        const y = rng.randomInt(0, height);
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
      break;

    case 'grid-horizon':
      ctx.strokeStyle = rng.pick(palette);
      ctx.lineWidth = pixelSize;
      const horizonY = height * 0.7;
      for (let x = 0; x < width; x += pixelSize * 4) {
        ctx.beginPath();
        ctx.moveTo(x, horizonY);
        ctx.lineTo(x + pixelSize * 2, height);
        ctx.stroke();
      }
      break;

    case 'checkerboard':
      const checkSize = pixelSize * 4;
      for (let y = 0; y < height; y += checkSize) {
        for (let x = 0; x < width; x += checkSize) {
          const isEven = ((x / checkSize) + (y / checkSize)) % 2 === 0;
          ctx.fillStyle = isEven ? baseColor : rng.pick(palette);
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
      break;

    case 'pixel-noise':
      for (let i = 0; i < width * height / (pixelSize * pixelSize) * 0.1; i++) {
        const x = rng.randomInt(0, width);
        const y = rng.randomInt(0, height);
        ctx.fillStyle = rng.pick(palette);
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
      break;

    case 'sunset-gradient':
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, palette[palette.length - 1]);
      gradient.addColorStop(0.5, palette[Math.floor(palette.length / 2)]);
      gradient.addColorStop(1, palette[0]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'terminal-green':
      ctx.fillStyle = '#0D2818';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#00FF00';
      for (let y = 0; y < height; y += pixelSize * 3) {
        for (let x = 0; x < width; x += pixelSize * 2) {
          if (rng.next() > 0.95) {
            ctx.fillRect(x, y, pixelSize, pixelSize);
          }
        }
      }
      break;

    case 'paper-texture':
      ctx.fillStyle = '#F5E6D3';
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 200; i++) {
        const x = rng.randomInt(0, width);
        const y = rng.randomInt(0, height);
        ctx.fillStyle = `rgba(0, 0, 0, ${rng.random(0.05, 0.15)})`;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
      break;

    case 'dos-boot':
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#00FF00';
      ctx.font = `${pixelSize * 4}px monospace`;
      ctx.fillText('MS-DOS Version 6.22', pixelSize * 2, pixelSize * 4);
      ctx.fillText('Copyright (C) Microsoft Corp', pixelSize * 2, pixelSize * 8);
      break;

    case 'vaporwave-sky':
      const vGradient = ctx.createLinearGradient(0, 0, 0, height);
      vGradient.addColorStop(0, '#FF006E');
      vGradient.addColorStop(0.5, '#8338EC');
      vGradient.addColorStop(1, '#3A86FF');
      ctx.fillStyle = vGradient;
      ctx.fillRect(0, 0, width, height);
      // Add grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += pixelSize * 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += pixelSize * 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      break;
  }
}

// Draw frame styles
function drawFrame(
  ctx: CanvasRenderingContext2D,
  style: FrameStyle,
  width: number,
  totalWidth: number,
  totalHeight: number,
  palette: string[],
  rng: SeededRandom,
  pixelSize: number
) {
  ctx.imageSmoothingEnabled = false;
  ctx.strokeStyle = rng.pick(palette);
  ctx.lineWidth = width;

  switch (style) {
    case 'arcade-bezel':
      // Thick bezel
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = rng.pick(palette);
      ctx.lineWidth = pixelSize * 2;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      break;

    case 'computer-window':
      // Mac OS 1 style
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(0, 0, totalWidth, pixelSize * 4);
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = pixelSize;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      break;

    case 'cartridge-label':
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.fillStyle = rng.pick(palette);
      ctx.fillRect(width, width, totalWidth - width * 2, pixelSize * 6);
      ctx.strokeStyle = rng.pick(palette);
      ctx.lineWidth = pixelSize;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      break;

    case 'floppy-disk':
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(width, width, totalWidth - width * 2, pixelSize * 3);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = pixelSize;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      break;

    case 'trading-card':
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = pixelSize * 2;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      break;

    case 'terminal-box':
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = pixelSize;
      const corner = pixelSize * 4;
      ctx.beginPath();
      ctx.moveTo(corner, width);
      ctx.lineTo(width, width);
      ctx.lineTo(width, corner);
      ctx.moveTo(totalWidth - corner, width);
      ctx.lineTo(totalWidth - width, width);
      ctx.lineTo(totalWidth - width, corner);
      ctx.moveTo(totalWidth - width, totalHeight - corner);
      ctx.lineTo(totalWidth - width, totalHeight - width);
      ctx.lineTo(totalWidth - corner, totalHeight - width);
      ctx.moveTo(width, totalHeight - corner);
      ctx.lineTo(width, totalHeight - width);
      ctx.lineTo(corner, totalHeight - width);
      ctx.stroke();
      break;

    case 'nes-title':
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = pixelSize * 2;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = pixelSize;
      ctx.strokeRect(width * 2, width * 2, totalWidth - width * 4, totalHeight - width * 4);
      break;

    case 'sega-plaque':
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = pixelSize * 3;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(width * 2, width * 2, totalWidth - width * 4, pixelSize * 4);
      break;
  }
}

// Draw badges and icons
function drawBadges(
  ctx: CanvasRenderingContext2D,
  badges: BadgeType[],
  width: number,
  height: number,
  palette: string[],
  rng: SeededRandom,
  pixelSize: number
) {
  ctx.imageSmoothingEnabled = false;
  let badgeX = pixelSize * 2;
  let badgeY = height - pixelSize * 8;

  for (const badge of badges) {
    ctx.fillStyle = rng.pick(palette);
    
    switch (badge) {
      case 'star':
        drawStar(ctx, badgeX, badgeY, pixelSize * 3);
        break;
      case 'bolt':
        drawBolt(ctx, badgeX, badgeY, pixelSize * 3);
        break;
      case 'flame':
        drawFlame(ctx, badgeX, badgeY, pixelSize * 3);
        break;
      case 'skull':
        drawSkull(ctx, badgeX, badgeY, pixelSize * 3);
        break;
      case 'coin':
        drawCoin(ctx, badgeX, badgeY, pixelSize * 3);
        break;
      case 'player1':
        ctx.font = `${pixelSize * 3}px 'Press Start 2P', monospace`;
        ctx.fillText('P1', badgeX, badgeY);
        break;
      case 'ready':
        ctx.font = `${pixelSize * 3}px 'Press Start 2P', monospace`;
        ctx.fillText('READY', badgeX, badgeY);
        break;
      case 'insert-coin':
        ctx.font = `${pixelSize * 2}px 'Press Start 2P', monospace`;
        ctx.fillText('INSERT COIN', badgeX, badgeY);
        break;
      case 'version':
        const version = `v${rng.randomInt(1, 9)}.${rng.randomInt(0, 9)}`;
        ctx.font = `${pixelSize * 2}px 'Press Start 2P', monospace`;
        ctx.fillText(version, badgeX, badgeY);
        break;
      case 'year':
        const years = [1984, 1987, 1990, 1992, 1995, 1997, 1999, 2000];
        ctx.font = `${pixelSize * 2}px 'Press Start 2P', monospace`;
        ctx.fillText(rng.pick(years).toString(), badgeX, badgeY);
        break;
      case 'rating':
        const stars = '★★★★☆';
        ctx.font = `${pixelSize * 3}px monospace`;
        ctx.fillText(stars, badgeX, badgeY);
        break;
    }
    
    badgeX += pixelSize * 20;
    if (badgeX > width - pixelSize * 20) {
      badgeX = pixelSize * 2;
      badgeY -= pixelSize * 6;
    }
  }
}

// Simple icon drawing functions
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const points = 5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const radius = i % 2 === 0 ? size : size / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawBolt(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size / 2, y + size / 2);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + size / 2, y + size / 2);
  ctx.closePath();
  ctx.fill();
}

function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x + size / 2, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + size / 3, y + size * 0.7);
  ctx.lineTo(x + size / 2, y + size);
  ctx.lineTo(x + size * 2 / 3, y + size * 0.7);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();
}

function drawSkull(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  // Simple skull shape
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 3, size / 3, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + size / 3, y + size / 4, size / 6, size / 6);
  ctx.fillRect(x + size * 2 / 3, y + size / 4, size / 6, size / 6);
}

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.fill();
}

// Render text with all effects
function renderTextWithEffects(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  pixelSize: number,
  textColor: string,
  effects: Partial<TextEffects>,
  palette: string[],
  rng: SeededRandom,
  compositionMode: CompositionMode
) {
  ctx.imageSmoothingEnabled = false;
  
  // Create high-res text canvas
  const scale = 4;
  const tempCanvas = document.createElement('canvas');
  const fontSize = pixelSize * 12 * scale;
  tempCanvas.width = 800 * scale;
  tempCanvas.height = 200 * scale;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.fillStyle = '#FFFFFF';
  tempCtx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;
  tempCtx.textBaseline = 'top';
  tempCtx.textAlign = 'left';
  
  // Apply composition transforms
  if (effects.slanted) {
    tempCtx.transform(1, 0, -0.2, 1, 0, 0);
  }
  if (compositionMode === 'curved-baseline') {
    // Curved baseline effect
    const textWidth = tempCtx.measureText(text.toUpperCase()).width;
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      const charWidth = tempCtx.measureText(char).width;
      const offset = Math.sin((i / text.length) * Math.PI) * fontSize * 0.3;
      tempCtx.fillText(char, i * charWidth, offset);
    }
  } else {
    tempCtx.fillText(text.toUpperCase(), 0, 0);
  }
  
  const metrics = tempCtx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;
  
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = Math.ceil(textWidth);
  croppedCanvas.height = Math.ceil(textHeight);
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) return;
  
  croppedCtx.imageSmoothingEnabled = false;
  croppedCtx.drawImage(tempCanvas, 0, 0, textWidth, textHeight, 0, 0, croppedCanvas.width, croppedCanvas.height);
  
  const imageData = croppedCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
  const data = imageData.data;
  const scaledPixelSize = pixelSize * scale;
  
  // Draw effects
  if (effects.doubleShadow) {
    const shadowColor1 = palette[0];
    const shadowColor2 = palette[Math.floor(palette.length / 2)];
    drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize + pixelSize * 3,
      Math.floor(y / pixelSize) * pixelSize + pixelSize * 3,
      pixelSize, scaledPixelSize, shadowColor1);
    drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize + pixelSize * 2,
      Math.floor(y / pixelSize) * pixelSize + pixelSize * 2,
      pixelSize, scaledPixelSize, shadowColor2);
  }
  
  if (effects.stacked3D) {
    // 3D stacked effect
    for (let layer = 3; layer >= 0; layer--) {
      ctx.globalAlpha = 0.3 + (layer * 0.2);
      const offset = layer * pixelSize;
      drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
        Math.floor(x / pixelSize) * pixelSize + offset,
        Math.floor(y / pixelSize) * pixelSize + offset,
        pixelSize, scaledPixelSize, textColor);
    }
    ctx.globalAlpha = 1;
  }
  
  if (effects.chunkyOutline) {
    const outlineColor = palette[0] === textColor ? palette[palette.length - 1] : palette[0];
    const outlineWidth = rng.randomInt(1, 4);
    for (let ox = -outlineWidth; ox <= outlineWidth; ox++) {
      for (let oy = -outlineWidth; oy <= outlineWidth; oy++) {
        if (ox !== 0 || oy !== 0) {
          drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
            Math.floor(x / pixelSize) * pixelSize + ox * pixelSize,
            Math.floor(y / pixelSize) * pixelSize + oy * pixelSize,
            pixelSize, scaledPixelSize, outlineColor);
        }
      }
    }
  }
  
  // Main text with gradient or solid
  if (effects.gradient) {
    const gradient = ctx.createLinearGradient(x, y, x, y + textHeight);
    gradient.addColorStop(0, palette[palette.length - 1]);
    gradient.addColorStop(0.5, textColor);
    gradient.addColorStop(1, palette[0]);
    ctx.fillStyle = gradient;
    drawPixelatedTextGradient(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize,
      Math.floor(y / pixelSize) * pixelSize,
      pixelSize, scaledPixelSize, gradient);
  } else {
    ctx.fillStyle = textColor;
    drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize,
      Math.floor(y / pixelSize) * pixelSize,
      pixelSize, scaledPixelSize, textColor);
  }
  
  if (effects.metallic) {
    // Metallic bands
    for (let band = 0; band < 3; band++) {
      const bandY = y + (textHeight / 4) * band;
      ctx.fillStyle = band % 2 === 0 ? palette[palette.length - 1] : palette[0];
      ctx.fillRect(x, bandY, textWidth, pixelSize * 2);
    }
  }
  
  if (effects.cracked) {
    // Random missing pixels
    for (let i = 0; i < 20; i++) {
      const px = x + rng.randomInt(0, textWidth);
      const py = y + rng.randomInt(0, textHeight);
      ctx.fillStyle = palette[0];
      ctx.fillRect(px, py, pixelSize, pixelSize);
    }
  }
  
  if (effects.cartridgePrint) {
    // RGB channel offset
    const offset = pixelSize;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#FF0000';
    drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize - offset,
      Math.floor(y / pixelSize) * pixelSize,
      pixelSize, scaledPixelSize, '#FF0000');
    ctx.fillStyle = '#00FF00';
    drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize,
      Math.floor(y / pixelSize) * pixelSize,
      pixelSize, scaledPixelSize, '#00FF00');
    ctx.fillStyle = '#0000FF';
    drawPixelatedText(ctx, data, croppedCanvas.width, croppedCanvas.height,
      Math.floor(x / pixelSize) * pixelSize + offset,
      Math.floor(y / pixelSize) * pixelSize,
      pixelSize, scaledPixelSize, '#0000FF');
    ctx.globalAlpha = 1;
  }
  
  if (effects.waveDistortion) {
    // Wave effect on rows
    const waveCanvas = document.createElement('canvas');
    waveCanvas.width = croppedCanvas.width;
    waveCanvas.height = croppedCanvas.height;
    const waveCtx = waveCanvas.getContext('2d');
    if (waveCtx) {
      for (let sy = 0; sy < croppedCanvas.height; sy++) {
        const waveOffset = Math.sin(sy / 10) * pixelSize * 2;
        waveCtx.drawImage(croppedCanvas, 0, sy, croppedCanvas.width, 1, waveOffset, sy, croppedCanvas.width, 1);
      }
      const waveData = waveCtx.getImageData(0, 0, waveCanvas.width, waveCanvas.height);
      drawPixelatedText(ctx, waveData.data, waveCanvas.width, waveCanvas.height,
        Math.floor(x / pixelSize) * pixelSize,
        Math.floor(y / pixelSize) * pixelSize,
        pixelSize, scaledPixelSize, textColor);
    }
  }
}

function drawPixelatedText(
  ctx: CanvasRenderingContext2D,
  imageData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  destX: number,
  destY: number,
  pixelSize: number,
  scaledPixelSize: number,
  color: string
) {
  ctx.fillStyle = color;
  
  for (let sy = 0; sy < sourceHeight; sy += scaledPixelSize) {
    for (let sx = 0; sx < sourceWidth; sx += scaledPixelSize) {
      const sampleX = Math.min(sx + Math.floor(scaledPixelSize / 2), sourceWidth - 1);
      const sampleY = Math.min(sy + Math.floor(scaledPixelSize / 2), sourceHeight - 1);
      const idx = (sampleY * sourceWidth + sampleX) * 4;
      
      if (imageData[idx + 3] > 100) {
        const px = Math.floor(destX + (sx / scaledPixelSize) * pixelSize);
        const py = Math.floor(destY + (sy / scaledPixelSize) * pixelSize);
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
  }
}

function drawPixelatedTextGradient(
  ctx: CanvasRenderingContext2D,
  imageData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  destX: number,
  destY: number,
  pixelSize: number,
  scaledPixelSize: number,
  gradient: CanvasGradient
) {
  for (let sy = 0; sy < sourceHeight; sy += scaledPixelSize) {
    for (let sx = 0; sx < sourceWidth; sx += scaledPixelSize) {
      const sampleX = Math.min(sx + Math.floor(scaledPixelSize / 2), sourceWidth - 1);
      const sampleY = Math.min(sy + Math.floor(scaledPixelSize / 2), sourceHeight - 1);
      const idx = (sampleY * sourceWidth + sampleX) * 4;
      
      if (imageData[idx + 3] > 100) {
        const px = Math.floor(destX + (sx / scaledPixelSize) * pixelSize);
        const py = Math.floor(destY + (sy / scaledPixelSize) * pixelSize);
        ctx.fillStyle = gradient;
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
  }
}

function measurePixelText(text: string, pixelSize: number): { width: number; height: number } {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return { width: 0, height: 0 };
  
  const fontSize = pixelSize * 12;
  tempCtx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;
  const metrics = tempCtx.measureText(text.toUpperCase());
  
  return {
    width: metrics.width,
    height: fontSize * 1.2
  };
}

function applyFinalEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: SeededRandom,
  pixelSize: number,
  backgroundStyle: BackgroundStyle
) {
  // Additional scanlines if not already applied
  if (backgroundStyle !== 'crt-scanlines' && rng.next() > 0.7) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += pixelSize * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  
  // Vignette
  if (rng.next() > 0.5) {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
