"use client";

import { useState, useEffect } from "react";
import type { LogoConfig } from "@/lib/logoGenerator";

interface StylingFormProps {
  onConfigChange: (config: Partial<LogoConfig>) => void;
  isGenerating: boolean;
  onApply: () => void;
}

export function StylingForm({
  onConfigChange,
  isGenerating,
  onApply,
}: StylingFormProps) {
  const [config, setConfig] = useState<Partial<LogoConfig>>({});
  const [presets, setPresets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch("/api/admin/styling-presets", {
          headers: { "x-admin-user": "ladymel" },
        });
        if (response.ok) {
          const data = await response.json();
          setPresets(data);
        }
      } catch (error) {
        console.error("Failed to fetch presets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleColorSystemChange = (system: any) => {
    updateConfig("colorSystem", system);
  };

  const handleBackgroundStyleChange = (style: any) => {
    updateConfig("backgroundStyle", style);
  };

  const handleCompositionChange = (comp: any) => {
    updateConfig("compositionMode", comp);
  };

  const handleGlowChange = (value: number) => {
    updateConfig("glowIntensity", value);
  };

  const handleChromeChange = (chrome: string) => {
    updateConfig("chromeStyle", chrome);
  };

  const handleBloomChange = (value: number) => {
    updateConfig("bloomLevel", value);
  };

  const handleTextureChange = (texture: string) => {
    updateConfig("texture", texture);
  };

  const handleLightingChange = (direction: string) => {
    updateConfig("lighting", direction);
  };

  return (
    <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
      <h3 className="text-sm font-mono font-bold text-magenta-400 mb-4">
        Styling Controls (Phase 2 - Full)
      </h3>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {/* Color System */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Color System
          </label>
          <select
            value={config.colorSystem || ""}
            onChange={(e) => handleColorSystemChange(e.target.value)}
            className="
              w-full px-3 py-2 text-xs font-mono bg-slate-900 text-cyan-100
              border border-slate-700 rounded focus:outline-none
              focus:border-cyan-400 hover:border-slate-600
            "
          >
            <option value="">Default</option>
            <option value="vaporwave">Vaporwave</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="pastel">Pastel</option>
            <option value="neon">Neon</option>
            <option value="retro">Retro</option>
            {presets?.colorSystem?.map((sys: string) => (
              <option key={sys} value={sys}>
                {sys}
              </option>
            ))}
          </select>
        </div>

        {/* Background Style */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Background Style
          </label>
          <select
            value={config.backgroundStyle || ""}
            onChange={(e) => handleBackgroundStyleChange(e.target.value)}
            className="
              w-full px-3 py-2 text-xs font-mono bg-slate-900 text-cyan-100
              border border-slate-700 rounded focus:outline-none
              focus:border-cyan-400 hover:border-slate-600
            "
          >
            <option value="">Default</option>
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
            <option value="pattern">Pattern</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>

        {/* Composition Mode */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Composition Mode
          </label>
          <select
            value={config.compositionMode || ""}
            onChange={(e) => handleCompositionChange(e.target.value)}
            className="
              w-full px-3 py-2 text-xs font-mono bg-slate-900 text-cyan-100
              border border-slate-700 rounded focus:outline-none
              focus:border-cyan-400 hover:border-slate-600
            "
          >
            <option value="">Default</option>
            <option value="centered">Centered</option>
            <option value="asymmetric">Asymmetric</option>
            <option value="dynamic">Dynamic</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        {/* Glow Intensity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-slate-400">
              Glow Intensity
            </label>
            <span className="text-xs font-mono text-cyan-400">
              {((config as any).glowIntensity as number)?.toFixed(1) || "0.0"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={((config as any).glowIntensity as number) || 0}
            onChange={(e) => handleGlowChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Chrome Style */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Chrome Style
          </label>
          <select
            value={((config as any).chromeStyle as string) || ""}
            onChange={(e) => handleChromeChange(e.target.value)}
            className="
              w-full px-3 py-2 text-xs font-mono bg-slate-900 text-cyan-100
              border border-slate-700 rounded focus:outline-none
              focus:border-cyan-400 hover:border-slate-600
            "
          >
            <option value="">None</option>
            <option value="glossy">Glossy</option>
            <option value="matte">Matte</option>
            <option value="metallic">Metallic</option>
            <option value="mirror">Mirror</option>
          </select>
        </div>

        {/* Bloom Level Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-slate-400">
              Bloom Level
            </label>
            <span className="text-xs font-mono text-magenta-400">
              {((config as any).bloomLevel as number)?.toFixed(1) || "0.0"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={((config as any).bloomLevel as number) || 0}
            onChange={(e) => handleBloomChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-magenta-400"
          />
        </div>

        {/* Texture */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Texture
          </label>
          <select
            value={((config as any).texture as string) || ""}
            onChange={(e) => handleTextureChange(e.target.value)}
            className="
              w-full px-3 py-2 text-xs font-mono bg-slate-900 text-cyan-100
              border border-slate-700 rounded focus:outline-none
              focus:border-cyan-400 hover:border-slate-600
            "
          >
            <option value="">None</option>
            <option value="smooth">Smooth</option>
            <option value="rough">Rough</option>
            <option value="grain">Grain</option>
            <option value="fabric">Fabric</option>
            <option value="noise">Noise</option>
          </select>
        </div>

        {/* Lighting Direction (9-point) */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">
            Lighting Direction
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "↖", value: "top-left" },
              { label: "↑", value: "top" },
              { label: "↗", value: "top-right" },
              { label: "←", value: "left" },
              { label: "◉", value: "center" },
              { label: "→", value: "right" },
              { label: "↙", value: "bottom-left" },
              { label: "↓", value: "bottom" },
              { label: "↘", value: "bottom-right" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleLightingChange(value)}
                className={`
                  py-2 text-xs font-mono rounded transition-all
                  ${
                    (config as any).lighting === value
                      ? "bg-cyan-500 text-white border-cyan-300"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }
                  border
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
        <button
          onClick={() => {
            setConfig({});
            onConfigChange({});
          }}
          disabled={isGenerating}
          className="
            flex-1 px-3 py-2 text-xs font-mono rounded transition-all
            bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Reset
        </button>

        <button
          onClick={onApply}
          disabled={isGenerating || Object.keys(config).length === 0}
          className="
            flex-1 px-3 py-2 text-xs font-mono font-bold rounded transition-all
            bg-magenta-500 text-white hover:bg-magenta-400
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Apply & Generate
        </button>
      </div>
    </div>
  );
}
