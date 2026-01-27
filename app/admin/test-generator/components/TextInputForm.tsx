"use client";

import { useState } from "react";

interface TextInputFormProps {
  text: string;
  onTextChange: (text: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function TextInputForm({
  text,
  onTextChange,
  isGenerating,
  onGenerate,
}: TextInputFormProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-950 border border-cyan-500 rounded-lg">
      <label className="text-sm font-mono text-cyan-400">Logo Text</label>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Enter text for logo generation..."
        className={`
          w-full h-24 p-3 font-mono text-sm bg-slate-900 text-cyan-100
          border rounded transition-colors resize-none
          ${
            isFocused
              ? "border-cyan-400 bg-slate-800"
              : "border-slate-700 hover:border-slate-600"
          }
          focus:outline-none
        `}
      />

      <button
        onClick={onGenerate}
        disabled={isGenerating || !text.trim()}
        className={`
          px-4 py-2 font-mono text-sm font-bold rounded transition-all
          ${
            isGenerating || !text.trim()
              ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
              : "bg-cyan-500 text-slate-900 hover:bg-cyan-400 active:scale-95"
          }
        `}
      >
        {isGenerating ? "Generating..." : "Generate Logo"}
      </button>
    </div>
  );
}
