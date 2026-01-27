import { useState, useCallback } from "react";
import {
  generateLogo as generateLogoLib,
  type LogoConfig,
  type LogoResult,
} from "@/lib/logoGenerator";
import {
  DEMO_PRESET_CONFIG,
  DEMO_SEED_BASE,
  DEMO_SEED_TOTAL,
} from "@/lib/demoMode";
import { applyFingerprintToConfig } from "@/lib/demoFingerprintToConfig";
import { generateDemoSvg, svgToDataUrl } from "@/lib/demoSvgRenderer";
import {
  generateNeonFingerprint,
  isValidNeonDemoStyle,
  enforceNeonConstraints,
} from "@/lib/demoNeonStyleVariants";

export interface TestGeneratorState {
  mode: "normal" | "demo";
  text: string;
  seed: number;
  customConfig: Partial<LogoConfig> | null;
  logoResult: LogoResult | null;
  isGenerating: boolean;
  error: string | null;
  debugInfo: Record<string, unknown> | null;
  demoStyle: Record<string, unknown> | null;
  filters: string | null;
}

interface GenerationRecord {
  seed: number;
  text: string;
  mode: "normal" | "demo";
  rarity: string | null;
  timestamp: number;
}

interface ComparisonResult {
  mode: "normal" | "demo";
  logoUrl: string;
  seed: number;
  text: string;
  rarity?: string;
}

export function useTestGenerator() {
  const [state, setState] = useState<TestGeneratorState>({
    mode: "normal",
    text: "",
    seed: Math.floor(Math.random() * 2147483647),
    customConfig: null,
    logoResult: null,
    isGenerating: false,
    error: null,
    debugInfo: null,
    demoStyle: null,
    filters: null,
  });

  const [history, setHistory] = useState<GenerationRecord[]>([]);

  // Comparison state
  const [normalComparison, setNormalComparison] =
    useState<ComparisonResult | null>(null);
  const [demoComparison, setDemoComparison] = useState<ComparisonResult | null>(
    null,
  );

  const generateLogo = useCallback(
    async (text: string, seed?: number, mode?: "normal" | "demo") => {
      const finalMode = mode || state.mode;
      const finalSeed = seed ?? state.seed;
      const finalText = text || state.text;

      if (!finalText.trim()) {
        setState((prev) => ({ ...prev, error: "Text is required" }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      try {
        // Generate logo client-side first
        const clientStartTime = Date.now();

        // Determine config based on mode and customization
        let config: LogoConfig = {
          text: finalText,
          seed: finalSeed,
          ...state.customConfig,
        };

        let demoFingerprint = null;
        let logoDataUrl = "";

        console.log(
          `[generateLogo] Starting generation - mode: ${finalMode}, text: ${finalText}, customConfig: ${!!state.customConfig}`,
        );

        // DEMO MODE: Use new SVG text rendering (not canvas)
        // Demo mode should work regardless of customConfig - SVG takes priority
        if (finalMode === "demo") {
          console.log(
            "[generateLogo] Entering DEMO MODE with SVG text renderer",
          );
          console.log(
            "[generateLogo] Demo mode check - finalMode:",
            finalMode,
            "customConfig:",
            state.customConfig,
          );
          // Constrain seed to demo seed pool
          const constrainedSeed =
            DEMO_SEED_BASE + (finalSeed % DEMO_SEED_TOTAL);
          console.log(
            "[generateLogo] Seed constrained from",
            finalSeed,
            "to",
            constrainedSeed,
          );

          // Generate or fetch demo fingerprint
          try {
            console.log(
              "[generateLogo] Fetching fingerprint from /api/admin/demo-fingerprint for seed:",
              constrainedSeed,
            );
            const fingerprintResponse = await fetch(
              "/api/admin/demo-fingerprint",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-admin-user": "ladymel",
                },
                body: JSON.stringify({ seed: constrainedSeed }),
              },
            );

            console.log(
              "[generateLogo] Fingerprint response status:",
              fingerprintResponse.status,
            );
            if (fingerprintResponse.ok) {
              const fingerprintData = await fingerprintResponse.json();
              demoFingerprint = fingerprintData.fingerprint;
              console.log(
                "[generateLogo] Fingerprint received:",
                demoFingerprint,
              );
            } else {
              console.warn(
                "[generateLogo] Fingerprint response not ok:",
                fingerprintResponse.status,
              );
              throw new Error(
                `Fingerprint API returned ${fingerprintResponse.status}`,
              );
            }
          } catch (error) {
            console.error("Error fetching fingerprint:", error);
            // Generate a random one if fetch fails
            console.log(
              "[generateLogo] Generating local fingerprint as fallback",
            );
            demoFingerprint = generateNeonFingerprint();
            console.log(
              "[generateLogo] Generated fingerprint:",
              demoFingerprint,
            );
            if (!isValidNeonDemoStyle(demoFingerprint)) {
              console.log(
                "[generateLogo] Fingerprint not valid, enforcing constraints",
              );
              demoFingerprint = enforceNeonConstraints(demoFingerprint);
              console.log(
                "[generateLogo] Constrained fingerprint:",
                demoFingerprint,
              );
            }
          }

          // Generate SVG text logo using fingerprint
          if (demoFingerprint) {
            try {
              console.log(
                "[generateLogo] Generating SVG with fingerprint:",
                demoFingerprint,
              );
              const svgString = generateDemoSvg({
                text: finalText,
                fingerprint: demoFingerprint,
                width: 512,
                height: 512,
              });
              console.log(
                "[generateLogo] SVG generated, length:",
                svgString.length,
              );
              if (!svgString || svgString.length === 0) {
                console.warn(
                  "[generateLogo] SVG generation returned empty string",
                );
              } else {
                logoDataUrl = svgToDataUrl(svgString);
                console.log(
                  "[generateLogo] SVG converted to data URL, length:",
                  logoDataUrl.length,
                );
              }
            } catch (error) {
              console.error("Error generating demo SVG:", error);
              // Continue with whatever SVG we have, don't throw
            }
          } else {
            console.warn(
              "[generateLogo] No fingerprint generated for demo mode",
            );
          }

          config = {
            text: finalText,
            seed: constrainedSeed,
            rarity: "LEGENDARY", // Demo logos are special
          };
        } else {
          // NORMAL MODE: Use standard canvas generation
          console.log(
            "[generateLogo] FALLING BACK TO NORMAL MODE with canvas rendering",
          );
          console.log(
            "[generateLogo] Fallback reason - finalMode:",
            finalMode,
            "customConfig:",
            state.customConfig ? "present" : "null",
          );
          try {
            config = {
              text: finalText,
              seed: finalSeed,
              // Don't apply DEMO_PRESET_CONFIG here - use clean canvas config
              ...state.customConfig,
            };
            console.log(
              "[generateLogo] Canvas config constructed:",
              JSON.stringify(config).substring(0, 200),
            );

            // Generate on client side using canvas
            const result: LogoResult = await generateLogoLib(config);
            logoDataUrl = result.dataUrl;
            console.log(
              "[generateLogo] Canvas generated, dataUrl length:",
              logoDataUrl.length,
            );
            if (!logoDataUrl) {
              throw new Error("Canvas generation returned empty dataUrl");
            }
          } catch (error) {
            console.error("Error in canvas generation:", error);
            throw error;
          }
        }

        const clientRenderTime = Date.now() - clientStartTime;
        console.log(
          "[generateLogo] Client render completed in",
          clientRenderTime,
          "ms",
        );
        console.log(
          "[generateLogo] About to send to API - mode:",
          finalMode,
          "isDemoSvg:",
          finalMode === "demo" && !state.customConfig,
        );

        // Now send to API for enrichment
        try {
          console.log(
            "[generateLogo] Posting to /api/admin/test-logo with mode:",
            finalMode,
            "isDemoSvg:",
            finalMode === "demo" && !state.customConfig,
          );
        } catch {}
        const response = await fetch("/api/admin/test-logo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-user": "ladymel", // In production, get from session
          },
          body: JSON.stringify({
            text: finalText,
            seed: config.seed,
            mode: finalMode,
            dataUrl: logoDataUrl,
            rarity: config.rarity,
            demoFingerprint, // Include the style fingerprint for demo mode
            isDemoSvg: finalMode === "demo", // Flag for API to know it's already styled SVG
          }),
        });

        console.log(
          "[generateLogo] API response status:",
          response.status,
          response.statusText,
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[generateLogo] API error response:", errorText);
          throw new Error(
            `API error: ${response.statusText} - ${errorText.substring(0, 200)}`,
          );
        }

        const data = await response.json();
        console.log(
          "[generateLogo] API response data received:",
          JSON.stringify(data).substring(0, 300),
        );
        const totalTime = Date.now() - clientStartTime;

        setState((prev) => ({
          ...prev,
          mode: finalMode,
          text: finalText,
          seed: config.seed || finalSeed,
          logoResult: {
            dataUrl: data.result.dataUrl, // Use API's processed dataUrl for consistency
            rarity: (config.rarity || data.result.rarity) as any,
            seed: config.seed || finalSeed,
            config: config as LogoConfig, // Include full config
          },
          debugInfo: {
            ...data.debugInfo,
            renderTime: clientRenderTime,
            totalTime,
            isDemoSvg: finalMode === "demo",
          },
          demoStyle: data.demoStyle,
          filters: data.filters,
          isGenerating: false,
          error: null,
        }));

        // Add to history
        setHistory((prev) => [
          {
            seed: config.seed || finalSeed,
            text: finalText,
            mode: finalMode,
            rarity: data.result.rarity || null,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 49), // Keep last 50
        ]);

        // Store for comparison if needed
        const comparisonResult: ComparisonResult = {
          mode: finalMode,
          logoUrl: logoDataUrl,
          seed: config.seed || finalSeed,
          text: finalText,
          rarity: data.result.rarity || (config.rarity as string),
        };

        if (finalMode === "normal") {
          setNormalComparison(comparisonResult);
        } else {
          setDemoComparison(comparisonResult);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : String(error),
          isGenerating: false,
        }));
      }
    },
    [state.mode, state.seed, state.text, state.customConfig],
  );

  const setMode = useCallback((mode: "normal" | "demo") => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const setText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, text }));
  }, []);

  const setSeed = useCallback((seed: number) => {
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const setCustomConfig = useCallback((config: Partial<LogoConfig> | null) => {
    setState((prev) => ({ ...prev, customConfig: config }));
  }, []);

  const randomizeSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 2147483647);
    setState((prev) => {
      // If in demo mode, constrain to demo seed pool
      if (prev.mode === "demo") {
        const constrainedSeed = DEMO_SEED_BASE + (newSeed % DEMO_SEED_TOTAL);
        return { ...prev, seed: constrainedSeed };
      }
      return { ...prev, seed: newSeed };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    state,
    history,
    normalComparison,
    demoComparison,
    generateLogo,
    setMode,
    setText,
    setSeed,
    setCustomConfig,
    randomizeSeed,
    clearHistory,
  };
}
