"use client";

/**
 * Demo Logo Display Component
 *
 * Retrieves stored demo style fingerprint from database and applies
 * SVG filters to render the exclusive 80s neon effects.
 *
 * This component bridges the gap between:
 * - Canvas-based logo generation (returns PNG)
 * - Demo style storage (saves fingerprint to DB)
 * - Display-time styling (applies filters to the PNG)
 */

import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import type { LogoResult } from "@/lib/logoGenerator";
import {
  generateFilterDefsFromFingerprint,
  type StyleFingerprint,
} from "@/lib/demoStyleVariants";
import { IS_DEMO_MODE, DEMO_SEED_BASE } from "@/lib/demoMode";

/**
 * Props for DemoLogoDisplay component
 */
interface DemoLogoDisplayProps {
  logoResult: LogoResult;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  unoptimized?: boolean;
}

/**
 * Represents the demo style fingerprint retrieved from DB
 */
interface DemoStyleFromDB {
  palette: string;
  gradient: string;
  glow: string;
  chrome: string;
  bloom: string;
  texture: string;
  lighting: string;
}

/**
 * DemoLogoDisplay Component
 *
 * Renders a logo with demo styling applied via SVG filters when in demo mode.
 * Retrieves the saved style fingerprint from the database for the given seed
 * and applies appropriate SVG filter definitions.
 *
 * @param logoResult - The generated logo result containing dataUrl and seed
 * @param className - CSS classes to apply to wrapper
 * @param alt - Alt text for the image
 * @param width - Image width
 * @param height - Image height
 * @param unoptimized - Whether to use Next.js Image optimization
 */
export function DemoLogoDisplay({
  logoResult,
  className,
  alt = "Demo logo",
  width = 512,
  height = 512,
  unoptimized = true,
}: DemoLogoDisplayProps): React.ReactElement {
  const [demoStyle, setDemoStyle] = useState<DemoStyleFromDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Retrieve demo style from database when component mounts or seed changes
  useEffect(() => {
    let isMounted = true;

    const retrieveDemoStyle = async () => {
      // Only retrieve in demo mode and for demo seeds
      if (
        !IS_DEMO_MODE ||
        logoResult.seed < DEMO_SEED_BASE ||
        logoResult.seed >= DEMO_SEED_BASE + 9000
      ) {
        setDemoStyle(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch demo style from server action
        const response = await fetch(
          `/api/demo-logo-style/${logoResult.seed.toString()}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Style not found - this is OK, use fallback
            if (isMounted) {
              setDemoStyle(null);
              setIsLoading(false);
            }
            return;
          }
          throw new Error(`Failed to fetch demo style: ${response.statusText}`);
        }

        const data = (await response.json()) as DemoStyleFromDB | null;
        if (isMounted) {
          setDemoStyle(data);
          setError(null);
        }
      } catch (err) {
        console.warn(
          `Failed to retrieve demo style for seed ${logoResult.seed}:`,
          err,
        );
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setDemoStyle(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void retrieveDemoStyle();

    return () => {
      isMounted = false;
    };
  }, [logoResult.seed]);

  // Convert DB style to StyleFingerprint format for filter generation
  const convertToFingerprint = (style: DemoStyleFromDB): StyleFingerprint => ({
    palette: style.palette as any,
    gradient: style.gradient as any,
    glow: style.glow as any,
    chrome: style.chrome as any,
    bloom: style.bloom as any,
    texture: style.texture as any,
    lighting: style.lighting as any,
  });

  // If no demo style available, render plain image
  if (!IS_DEMO_MODE || !demoStyle || isLoading) {
    return (
      <NextImage
        src={logoResult.dataUrl}
        alt={alt}
        className={className}
        width={width}
        height={height}
        unoptimized={unoptimized}
      />
    );
  }

  // Generate SVG filter definitions from fingerprint
  const filterDefs = generateFilterDefsFromFingerprint(
    convertToFingerprint(demoStyle),
  );

  // Render with SVG filter wrapper
  return (
    <div className={`demo-logo-wrapper ${className || ""}`}>
      <svg
        className="demo-logo-svg-container"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      >
        {/* SVG Filter Definitions */}
        <defs dangerouslySetInnerHTML={{ __html: filterDefs }} />

        {/* Logo Image with Filters Applied */}
        <image
          href={logoResult.dataUrl}
          x="0"
          y="0"
          width={width}
          height={height}
          className="demo-logo-image"
          style={{
            filter: "url(#demo-filter-stack)",
          }}
        />
      </svg>

      {/* Fallback for browsers without SVG support */}
      <noscript>
        <NextImage
          src={logoResult.dataUrl}
          alt={alt}
          className={className}
          width={width}
          height={height}
          unoptimized={unoptimized}
        />
      </noscript>
    </div>
  );
}

export default DemoLogoDisplay;
