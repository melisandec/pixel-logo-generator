"use client";

interface ModeSelectorProps {
  mode: "normal" | "demo";
  onModeChange: (mode: "normal" | "demo") => void;
  isGenerating: boolean;
}

export function ModeSelector({
  mode,
  onModeChange,
  isGenerating,
}: ModeSelectorProps) {
  return (
    <div className="flex gap-2 p-4 bg-slate-950 border border-slate-700 rounded-lg">
      <button
        onClick={() => onModeChange("normal")}
        disabled={isGenerating}
        className={`
          flex-1 px-4 py-2 font-mono font-bold text-sm rounded transition-all
          ${
            mode === "normal"
              ? "bg-cyan-500 text-slate-900 border-2 border-cyan-400"
              : "bg-slate-800 text-cyan-300 border-2 border-slate-700 hover:border-slate-600"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        Normal Mode
      </button>

      <button
        onClick={() => onModeChange("demo")}
        disabled={isGenerating}
        className={`
          flex-1 px-4 py-2 font-mono font-bold text-sm rounded transition-all
          ${
            mode === "demo"
              ? "bg-magenta-500 text-white border-2 border-magenta-400"
              : "bg-slate-800 text-magenta-300 border-2 border-slate-700 hover:border-slate-600"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        80s Demo Mode
      </button>
    </div>
  );
}
