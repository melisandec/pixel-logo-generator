# Pixel Logo Forge: Technical Logo Generation & Rarity System

## 1. Seed Generation: Deterministic Uniqueness

- **Input**: Any string (word/phrase, up to 30 chars).
- **Hashing**: The string is hashed to a 32-bit integer using a custom function (`stringToSeed`). Example: `"LADYMEL"` → `1032844`.
- **Seeded Random**: All random choices (colors, effects, etc.) use a custom `SeededRandom` class, so the same input always yields the same logo.

## 2. Feature Combinations: What Makes Each Logo Unique?

Each logo is a combination of multiple independently randomized (but seed-driven) features:

### a. Color System (Palette)

- **Options**: NES, GameBoy, CGA, Vaporwave, Cyberpunk, Sepia, Classic, etc.
- **Each palette**: 4–64+ colors.
- **Selection**: 1 palette per logo.

### b. Background Style

- **Options**: solid, crt-scanlines, starfield, grid-horizon, checkerboard, pixel-noise, sunset-gradient, vaporwave-sky, dos-boot, etc.
- **Selection**: 1 per logo.

### c. Frame Style

- **Options**: none, arcade-bezel, computer-window, cartridge-label, floppy-disk, trading-card, terminal-box, nes-title, sega-plaque.
- **Selection**: 1 per logo.

### d. Composition Mode

- **Options**: centered, top-heavy, wide-cinematic, badge-emblem, vertical-stacked, curved-baseline.
- **Selection**: 1 per logo.

### e. Text Effects (each is on/off, some with params)

- **Options**: gradient, doubleShadow, chunkyOutline, invertedPixels, metallic, cracked, stacked3D, slanted, waveDistortion, cartridgePrint.
- **Selection**: 0–all per logo, depending on rarity.

### f. Depth & Lighting

- **Depth Presets**: none, arcade-marquee, cartridge-plastic, cyber-neon, stone-temple, gold-trophy, crt-glass.
- **Each preset**: controls 3D extrusion, lighting, glow, texture, shadow, etc.

### g. Badges

- **Options**: star, bolt, flame, skull, coin, player1, ready, insert-coin, version, year, rating.
- **Selection**: 0–5 per logo, depending on rarity.

### h. Pixel Size

- **Options**: 3–6 px (randomized per logo).

### i. Other Parameters

- **Text color**: Chosen for contrast from palette.
- **Background color**: Chosen from palette, with contrast logic.

---

## 3. Combinatorial Explosion: How Many Unique Logos?

- **Palettes**: ~8
- **Backgrounds**: ~10
- **Frames**: ~8
- **Compositions**: ~6
- **Text Effects**: 10+ (each on/off, so 2^10 = 1024 combos)
- **Depth Presets**: ~6
- **Badges**: 10+ (0–5, order random)
- **Pixel Size**: 4

**Rough estimate** (ignoring text input and some dependencies):

$$
8 \times 10 \times 8 \times 6 \times 1024 \times 6 \times 100 \times 4 \approx 1.2 \text{ billion}
$$

- **With text input**: Effectively infinite, since each string hashes to a different seed.

---

## 4. Rarity System: What Makes a Logo COMMON, RARE, EPIC, or LEGENDARY?

### a. Rarity Assignment

- **Roll**: Each logo gets a rarity based on a seeded random roll and the presence of advanced features.
- **Probabilities** (approximate, can be tuned):
  - COMMON: 50%
  - RARE: 30%
  - EPIC: 15%
  - LEGENDARY: 5%

### b. Rarity Effects

- **COMMON**: Simple palette, basic background/frame, minimal/no text effects, no depth, no badges.
- **RARE**: More backgrounds/frames, gradients, double shadows, some depth, 1 badge.
- **EPIC**: Advanced effects (metallic, 3D, chunkyOutline), special backgrounds/frames, multiple badges, more depth.
- **LEGENDARY**: All effects enabled, rarest backgrounds/frames, all depth/lighting, up to 5 badges, wildest combinations.

### c. Feature Unlocks by Rarity

| Feature      | COMMON | RARE | EPIC | LEGENDARY |
| ------------ | ------ | ---- | ---- | --------- |
| Palettes     | 2      | 3    | 3    | 3         |
| Backgrounds  | 2      | 4    | 4    | 3         |
| Frames       | 2      | 3    | 4    | 3         |
| Text Effects | 0–1    | 1–2  | 3–5  | 8–10      |
| Depth        | none   | some | more | all       |
| Badges       | 0      | 1    | 2–3  | 5         |

---

## 5. Rendering Pipeline

1. **Seeded feature selection** (see above).
2. **Canvas setup**: Size, pixel size, smoothing off.
3. **Background**: Layered drawing (far/mid/near), with effects.
4. **Frame**: Drawn if selected.
5. **Text**: Rendered with all effects, depth, and lighting.
6. **Badges**: Drawn in corners or below.
7. **Final effects**: Vignette, scanlines, glow, etc.
8. **Export**: PNG data URL.

---

## 6. Example: `"LADYMEL"`

- **Seed**: 1032844
- **Palette**: Vaporwave
- **Background**: CRT scanlines
- **Frame**: Arcade bezel
- **Text Effects**: Gradient, double shadow, 3D
- **Depth**: Arcade-marquee
- **Badges**: star, player1
- **Rarity**: EPIC

---

## 7. Summary

- **Every logo is unique**: Determined by both the input string and the huge combinatorial space of features.
- **Rarity is both random and feature-driven**: The rarest logos are visually the most complex and striking.
- **Combinations**: Billions of possible logos, with effectively infinite variety due to text input.

---

For full technical details, see `lib/logoGenerator.ts`.
