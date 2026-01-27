"use client";

import Image from "next/image";

interface ComparisonRecord {
  mode: "normal" | "demo";
  logoUrl: string;
  seed: number;
  text: string;
  rarity?: string;
}

interface ComparisonViewProps {
  normalLogo: ComparisonRecord | null;
  demoLogo: ComparisonRecord | null;
  isLoading: boolean;
}

export function ComparisonView({
  normalLogo,
  demoLogo,
  isLoading,
}: ComparisonViewProps) {
  if (!normalLogo && !demoLogo) {
    return (
      <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg text-slate-500 font-mono text-sm text-center">
        Generate with both modes to compare
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
      <h3 className="text-sm font-mono font-bold text-cyan-400 mb-4">
        Side-by-Side Comparison (Phase 3)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Normal Mode */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-cyan-400 font-bold">
            📝 Normal Mode
          </div>

          <div className="bg-slate-900 rounded aspect-square overflow-hidden flex items-center justify-center min-h-[256px]">
            {isLoading ? (
              <div className="text-slate-500 text-sm">Loading...</div>
            ) : normalLogo ? (
              <img
                src={normalLogo.logoUrl}
                alt="Normal logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-500 text-sm">No logo yet</div>
            )}
          </div>

          {normalLogo && (
            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>
                Text: <span className="text-cyan-300">{normalLogo.text}</span>
              </div>
              <div>
                Seed: <span className="text-cyan-300">{normalLogo.seed}</span>
              </div>
              {normalLogo.rarity && (
                <div>
                  Rarity:{" "}
                  <span className="text-green-400">{normalLogo.rarity}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo Mode */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-magenta-400 font-bold">
            🌆 80s Demo Mode
          </div>

          <div className="bg-slate-900 rounded aspect-square overflow-hidden flex items-center justify-center min-h-[256px]">
            {isLoading ? (
              <div className="text-slate-500 text-sm">Loading...</div>
            ) : demoLogo ? (
              <img
                src={demoLogo.logoUrl}
                alt="Demo logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-500 text-sm">No logo yet</div>
            )}
          </div>

          {demoLogo && (
            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>
                Text: <span className="text-magenta-300">{demoLogo.text}</span>
              </div>
              <div>
                Seed: <span className="text-magenta-300">{demoLogo.seed}</span>
              </div>
              {demoLogo.rarity && (
                <div>
                  Rarity:{" "}
                  <span className="text-green-400">{demoLogo.rarity}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {normalLogo && demoLogo && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs font-mono text-slate-500">
            {normalLogo.seed === demoLogo.seed
              ? "✅ Same seed - Visually compare styling differences"
              : "⚠️ Different seeds - Use same seed for fair comparison"}
          </div>
        </div>
      )}
    </div>
  );
}
