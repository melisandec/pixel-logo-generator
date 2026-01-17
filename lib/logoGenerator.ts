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
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Retro color palettes
const COLOR_PALETTES = [
  // CGA Palette
  ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA', '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'],
  // EGA Palette
  ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA', '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'],
  // Retro Game Palette
  ['#1A1A2E', '#16213E', '#0F3460', '#533483', '#E94560', '#F39C12', '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#E67E22'],
  // CRT Green
  ['#0D2818', '#1A4D2E', '#2D5F3D', '#4A7C59', '#6B9B7A', '#8FBC8F', '#B8E6B8', '#E0FFE0'],
  // Arcade Neon
  ['#000000', '#1A0033', '#330066', '#4D0099', '#6600CC', '#7F00FF', '#FF00FF', '#FF33FF', '#FF66FF', '#FF99FF'],
  // Terminal Amber
  ['#1C1C1C', '#2D2D2D', '#3D3D3D', '#4D4D2D', '#5D5D3D', '#6D6D4D', '#7D7D5D', '#8D8D6D', '#9D9D7D', '#ADAD8D'],
];

// Border styles
type BorderStyle = 'arcade' | 'terminal' | 'badge' | 'none';

interface LogoConfig {
  text: string;
  seed?: number;
  pixelSize?: number;
  colorPalette?: string[];
  borderStyle?: BorderStyle;
  shadowIntensity?: number;
  glowIntensity?: number;
  backgroundColor?: string;
}

export interface LogoResult {
  dataUrl: string;
  seed: number;
  config: LogoConfig;
}

export function generateLogo(config: LogoConfig): LogoResult {
  const seed = config.seed ?? stringToSeed(config.text);
  const rng = new SeededRandom(seed);

  // Generate configuration
  const pixelSize = config.pixelSize ?? rng.randomInt(4, 8);
  const colorPalette = config.colorPalette ?? rng.pick(COLOR_PALETTES);
  const borderStyle = config.borderStyle ?? rng.pick(['arcade', 'terminal', 'badge', 'none'] as BorderStyle[]);
  const shadowIntensity = config.shadowIntensity ?? rng.random(0.3, 0.8);
  const glowIntensity = config.glowIntensity ?? rng.random(0, 0.5);
  
  // Background color
  const backgroundColor = config.backgroundColor ?? (rng.next() > 0.3 
    ? rng.pick(colorPalette.slice(0, Math.floor(colorPalette.length / 2))) 
    : '#000000');

  // Text color (contrasting)
  const textColors = colorPalette.filter(c => c !== backgroundColor);
  const textColor = rng.pick(textColors);
  const shadowColor = rng.pick(colorPalette);

  // Canvas setup
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Set up pixel font - use larger size for better quality, then pixelate
  const baseFontSize = Math.max(24, pixelSize * 8);
  ctx.font = `bold ${baseFontSize}px 'Press Start 2P', monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.imageSmoothingEnabled = false;

  // Measure text
  const metrics = ctx.measureText(config.text);
  const textWidth = metrics.width;
  const textHeight = baseFontSize * 1.4;

  // Calculate dimensions with padding
  const padding = pixelSize * 8;
  const borderWidth = borderStyle !== 'none' ? pixelSize * 4 : 0;
  const totalWidth = Math.ceil(textWidth) + padding * 2 + borderWidth * 2;
  const totalHeight = Math.ceil(textHeight) + padding * 2 + borderWidth * 2;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  // Clear and set background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw border
  if (borderStyle !== 'none') {
    drawBorder(ctx, borderStyle, borderWidth, totalWidth, totalHeight, colorPalette, rng);
  }

  // Draw text with pixel effect
  const textX = borderWidth + padding;
  const textY = borderWidth + padding;

  // Draw glow effect
  if (glowIntensity > 0) {
    ctx.shadowBlur = pixelSize * 4 * glowIntensity;
    ctx.shadowColor = textColor;
    ctx.fillStyle = textColor;
    ctx.fillText(config.text, textX, textY);
    ctx.shadowBlur = 0;
  }

  // Draw shadow
  if (shadowIntensity > 0) {
    const shadowOffset = pixelSize * 2;
    ctx.fillStyle = shadowColor;
    ctx.globalAlpha = shadowIntensity;
    ctx.fillText(config.text, textX + shadowOffset, textY + shadowOffset);
    ctx.globalAlpha = 1;
  }

  // Draw main text
  ctx.fillStyle = textColor;
  ctx.fillText(config.text, textX, textY);

  // Apply pixelation effect - this will make everything pixelated
  pixelateCanvas(canvas, ctx, pixelSize);
  
  // Re-enable smoothing for final effects
  ctx.imageSmoothingEnabled = true;

  // Apply CRT scanline effect
  applyCRTEffect(ctx, totalWidth, totalHeight, rng);

  const finalConfig: LogoConfig = {
    text: config.text,
    seed,
    pixelSize,
    colorPalette,
    borderStyle,
    shadowIntensity,
    glowIntensity,
    backgroundColor,
  };

  return {
    dataUrl: canvas.toDataURL('image/png'),
    seed,
    config: finalConfig,
  };
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  style: BorderStyle,
  width: number,
  totalWidth: number,
  totalHeight: number,
  palette: string[],
  rng: SeededRandom
) {
  ctx.strokeStyle = rng.pick(palette);
  ctx.lineWidth = width;

  switch (style) {
    case 'arcade':
      // Double border arcade style
      ctx.strokeRect(width / 2, width / 2, totalWidth - width, totalHeight - width);
      ctx.strokeStyle = rng.pick(palette);
      ctx.lineWidth = width / 2;
      ctx.strokeRect(width, width, totalWidth - width * 2, totalHeight - width * 2);
      break;
    case 'terminal':
      // Terminal window style with corners
      const cornerSize = width * 2;
      ctx.beginPath();
      // Top-left corner
      ctx.moveTo(width / 2, width / 2 + cornerSize);
      ctx.lineTo(width / 2, width / 2);
      ctx.lineTo(width / 2 + cornerSize, width / 2);
      // Top-right corner
      ctx.moveTo(totalWidth - width / 2 - cornerSize, width / 2);
      ctx.lineTo(totalWidth - width / 2, width / 2);
      ctx.lineTo(totalWidth - width / 2, width / 2 + cornerSize);
      // Bottom-right corner
      ctx.moveTo(totalWidth - width / 2, totalHeight - width / 2 - cornerSize);
      ctx.lineTo(totalWidth - width / 2, totalHeight - width / 2);
      ctx.lineTo(totalWidth - width / 2 - cornerSize, totalHeight - width / 2);
      // Bottom-left corner
      ctx.moveTo(width / 2 + cornerSize, totalHeight - width / 2);
      ctx.lineTo(width / 2, totalHeight - width / 2);
      ctx.lineTo(width / 2, totalHeight - width / 2 - cornerSize);
      ctx.stroke();
      break;
    case 'badge':
      // Rounded badge style
      const radius = width * 2;
      const x = width / 2;
      const y = width / 2;
      const w = totalWidth - width;
      const h = totalHeight - width;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.stroke();
      break;
  }
}

function pixelateCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  pixelSize: number
) {
  // Get the current canvas content
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Create a temporary canvas to store pixelated result
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // Create pixelated version
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Average color in the pixel block for better quality
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      let count = 0;
      
      for (let py = 0; py < pixelSize && y + py < height; py++) {
        for (let px = 0; px < pixelSize && x + px < width; px++) {
          const idx = ((y + py) * width + (x + px)) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          aSum += data[idx + 3];
          count++;
        }
      }
      
      if (count > 0) {
        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);
        const a = aSum / count;
        
        // Fill the pixel block
        tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        tempCtx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  // Copy pixelated result back to original canvas
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(tempCanvas, 0, 0);
}

function applyCRTEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: SeededRandom
) {
  // Subtle scanlines
  if (rng.next() > 0.5) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Vignette effect
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
