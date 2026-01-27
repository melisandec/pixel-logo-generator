"use client";

interface DebugInfoProps {
  debugInfo: Record<string, unknown> | null;
  isGenerating: boolean;
}

export function DebugInfo({ debugInfo, isGenerating }: DebugInfoProps) {
  if (!debugInfo) return null;

  return (
    <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
      <h3 className="text-sm font-mono font-bold text-green-400 mb-3">
        Debug Information
      </h3>

      <div className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-500">Mode:</span>{" "}
            <span className="text-cyan-400">
              {String(debugInfo.mode) || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Seed Used:</span>{" "}
            <span className="text-cyan-400">
              {String(debugInfo.seedUsed) || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Render Time:</span>{" "}
            <span className="text-green-400">
              {String(debugInfo.renderTime) || "0"}ms
            </span>
          </div>

          <div>
            <span className="text-slate-500">Total Time:</span>{" "}
            <span className="text-green-400">
              {String(debugInfo.totalTime) || "0"}ms
            </span>
          </div>

          <div>
            <span className="text-slate-500">Preset Applied:</span>{" "}
            <span
              className={
                debugInfo.presetApplied ? "text-green-400" : "text-yellow-400"
              }
            >
              {String(debugInfo.presetApplied) || "false"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Has Demo Style:</span>{" "}
            <span
              className={
                debugInfo.hasDemoStyle ? "text-green-400" : "text-yellow-400"
              }
            >
              {String(debugInfo.hasDemoStyle) || "false"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Has Filters:</span>{" "}
            <span
              className={
                debugInfo.hasFilters ? "text-green-400" : "text-yellow-400"
              }
            >
              {String(debugInfo.hasFilters) || "false"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
