"use client";

import React from "react";

interface StyleFingerprint {
  palette?: string;
  gradient?: string;
  glow?: number;
  chrome?: string;
  bloom?: number;
  texture?: string;
  lighting?: string;
}

interface ConfigDisplayProps {
  demoStyle?: StyleFingerprint | null;
  logoConfig?: Record<string, unknown> | null;
  isGenerating?: boolean;
}

export default function ConfigDisplay({
  demoStyle,
  logoConfig,
  isGenerating = false,
}: ConfigDisplayProps) {
  if (!demoStyle && !logoConfig) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-400">No configuration generated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo Style Fingerprint */}
      {demoStyle && (
        <div className="rounded-lg border border-cyan-500/30 bg-slate-900/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-cyan-400">
            📊 Demo Style Fingerprint
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(demoStyle).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-slate-400">{key}:</span>
                <span className="ml-2 font-mono text-cyan-300">
                  {typeof value === "number" ? value.toFixed(2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logo Config */}
      {logoConfig && (
        <div className="rounded-lg border border-magenta-500/30 bg-slate-900/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-magenta-400">
            ⚙️ Logo Config
          </h3>
          <div className="max-h-64 overflow-y-auto">
            <pre className="font-mono text-xs text-slate-300">
              {JSON.stringify(logoConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="h-1 w-1 animate-pulse rounded-full bg-cyan-400"></div>
          <span>Generating configuration...</span>
        </div>
      )}
    </div>
  );
}
