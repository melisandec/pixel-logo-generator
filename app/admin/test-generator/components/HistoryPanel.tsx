"use client";

interface HistoryRecord {
  seed: number;
  text: string;
  mode: "normal" | "demo";
  rarity: string | null;
  timestamp: number;
}

interface HistoryPanelProps {
  records: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  records,
  onSelectRecord,
  onClearHistory,
}: HistoryPanelProps) {
  if (records.length === 0) {
    return (
      <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg text-slate-500 font-mono text-sm text-center">
        No generation history yet
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono font-bold text-green-400">
          History (Phase 3)
        </h3>
        <button
          onClick={onClearHistory}
          className="
            text-xs font-mono px-2 py-1 rounded
            bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200
            transition-colors
          "
        >
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {records.map((record, idx) => (
          <button
            key={idx}
            onClick={() => onSelectRecord(record)}
            className="
              w-full text-left p-3 rounded text-xs font-mono
              bg-slate-900 hover:bg-slate-800 transition-colors
              border border-slate-700 hover:border-slate-600
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-cyan-400 truncate mb-1">{record.text}</div>
                <div className="text-slate-500 grid grid-cols-2 gap-2">
                  <span>
                    {record.mode === "demo" ? "🌆 Demo" : "📝 Normal"}
                  </span>
                  <span>#{record.seed}</span>
                </div>
              </div>
              {record.rarity && (
                <div className="ml-2 text-magenta-400 font-bold text-xs">
                  {record.rarity}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
        {records.length} total generations
      </div>
    </div>
  );
}
