"use client";

import Image from "next/image";
import { LogoResult } from "@/lib/logoGenerator";

interface LogoPreviewProps {
  logoResult: LogoResult | null;
  isGenerating: boolean;
  error: string | null;
}

export function LogoPreview({
  logoResult,
  isGenerating,
  error,
}: LogoPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-slate-950 border border-cyan-500 rounded-lg">
        <div className="flex items-center justify-center bg-slate-900 rounded aspect-square min-h-[256px] overflow-hidden">
          {error ? (
            <div className="text-center text-red-400 p-6 font-mono text-sm">
              <div className="mb-2">❌ Generation Failed</div>
              <div className="text-xs text-slate-400 break-words">{error}</div>
            </div>
          ) : isGenerating ? (
            <div className="text-cyan-400 font-mono text-sm">
              <div className="animate-pulse">Generating...</div>
            </div>
          ) : logoResult ? (
            <>
              <img
                src={logoResult.dataUrl}
                alt="Generated logo"
                width={256}
                height={256}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Image failed to load");
                  console.error("Error event:", e);
                  console.error("Image element:", e.target);
                  console.error("Data URL length:", logoResult.dataUrl?.length);
                  console.error("Data URL first 100 chars:", logoResult.dataUrl?.substring(0, 100));
                  (e.target as HTMLImageElement).style.border = "2px solid red";
                }}
                onLoad={(e) => {
                  console.log("Image loaded successfully!");
                  console.log("Image element:", e.target);
                }}
              />
            </>
          ) : (
            <div className="text-slate-500 font-mono text-sm">
              No logo generated yet
            </div>
          )}
        </div>
      </div>

      {logoResult && (
        <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500">Seed:</span>{" "}
              <span className="text-cyan-400">{logoResult.seed}</span>
            </div>
            <div>
              <span className="text-slate-500">Rarity:</span>{" "}
              <span className="text-magenta-400">{logoResult.rarity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
