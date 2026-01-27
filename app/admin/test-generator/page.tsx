"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTestGenerator } from "./hooks/useTestGenerator";
import { ModeSelector } from "./components/ModeSelector";
import { TextInputForm } from "./components/TextInputForm";
import { SeedControl } from "./components/SeedControl";
import { LogoPreview } from "./components/LogoPreview";
import { DebugInfo } from "./components/DebugInfo";
import ConfigDisplay from "./components/ConfigDisplay";
import QuickComparisonButton from "./components/QuickComparisonButton";
import { HistoryPanel } from "./components/HistoryPanel";
import { ComparisonView } from "./components/ComparisonView";
import "../styles/admin-dashboard.css";

export default function AdminTestGenerator() {
  const router = useRouter();
  const {
    state,
    history,
    normalComparison,
    demoComparison,
    generateLogo,
    setMode,
    setText,
    setSeed,
    randomizeSeed,
  } = useTestGenerator();

  // Verify admin access - in production, this would check a session
  useEffect(() => {
    const isAdmin = localStorage.getItem("admin-mode");
    if (!isAdmin) {
      // Allow for now, but could redirect to /admin/login
      console.log("Admin mode activated");
    }
  }, []);

  const [viewMode, setViewMode] = useState<"debug" | "comparison">("debug");

  const handleGenerate = () => {
    generateLogo(state.text, state.seed, state.mode);
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-title">
            <h1>
              <span className="cyan">Admin</span>{" "}
              <span className="magenta">Test Generator</span>
            </h1>
            <p className="admin-header-subtitle">
              Unlimited logo generation for debugging and testing
            </p>
          </div>
          <Link href="/admin" className="admin-header-link">
            ← Back to Admin
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div className="admin-layout">
        {/* Left Column - Controls */}
        <aside className="admin-controls">
          <section className="admin-section">
            <h2 className="admin-section-title cyan">🎮 Controls</h2>

            <div className="admin-control-group">
              <ModeSelector
                mode={state.mode}
                onModeChange={setMode}
                isGenerating={state.isGenerating}
              />
            </div>

            <div className="admin-control-group">
              <TextInputForm
                text={state.text}
                onTextChange={setText}
                isGenerating={state.isGenerating}
                onGenerate={handleGenerate}
              />
            </div>

            <div className="admin-control-group">
              <SeedControl
                seed={state.seed}
                onSeedChange={setSeed}
                onRandomize={randomizeSeed}
              />
            </div>

            {state.logoResult && (
              <div className="admin-control-group">
                <QuickComparisonButton
                  currentMode={state.mode}
                  currentSeed={state.logoResult.seed}
                  isGenerating={state.isGenerating}
                  onCompare={(mode, seed) =>
                    generateLogo(state.text, seed, mode)
                  }
                />
              </div>
            )}
          </section>

          {/* History */}
          <section className="admin-section admin-mt-3">
            <h2 className="admin-section-title magenta">📜 History</h2>
            <HistoryPanel
              records={history}
              onSelectRecord={(record) => {
                setSeed(record.seed);
                setText(record.text);
                setMode(record.mode);
              }}
              onClearHistory={() => {}}
            />
          </section>
        </aside>

        {/* Right Column - Preview & Debug */}
        <main className="admin-preview-column">
          <section className="admin-section">
            <h2 className="admin-section-title cyan">🎨 Logo Preview</h2>

            <div className="admin-preview">
              <LogoPreview
                logoResult={state.logoResult}
                isGenerating={state.isGenerating}
                error={state.error}
              />
            </div>

            {/* View Mode Tabs */}
            <div className="admin-tabs">
              <button
                onClick={() => setViewMode("debug")}
                className={`admin-tab ${viewMode === "debug" ? "active" : ""}`}
              >
                🔧 Debug
              </button>
              <button
                onClick={() => setViewMode("comparison")}
                className={`admin-tab ${viewMode === "comparison" ? "active" : ""}`}
              >
                🔄 Comparison
              </button>
            </div>

            {/* Debug View */}
            <div
              className={`admin-tab-content ${viewMode === "debug" ? "active" : ""}`}
            >
              <div className="admin-mt-2">
                <DebugInfo
                  debugInfo={state.debugInfo}
                  isGenerating={state.isGenerating}
                />

                {state.demoStyle && (
                  <div className="admin-mt-3">
                    <ConfigDisplay
                      demoStyle={state.demoStyle as any}
                      logoConfig={
                        state.logoResult
                          ? { seed: state.logoResult.seed }
                          : undefined
                      }
                      isGenerating={state.isGenerating}
                    />
                  </div>
                )}

                {state.filters && (
                  <details className="admin-details admin-mt-3">
                    <summary className="admin-text-magenta">
                      📊 SVG Filter Definitions (
                      {state.filters.split("<").length - 1} filters)
                    </summary>
                    <div className="admin-details-content">
                      <div className="admin-code">
                        <pre>{state.filters}</pre>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(state.filters || "");
                          alert("Filters copied to clipboard!");
                        }}
                        className="admin-button admin-mt-2"
                      >
                        📋 Copy Filters
                      </button>
                    </div>
                  </details>
                )}

                {state.logoResult && (
                  <details className="admin-details admin-mt-3">
                    <summary className="admin-text-cyan">
                      ⚙️ Full Config
                    </summary>
                    <div className="admin-details-content">
                      <div className="admin-code">
                        <pre>
                          {JSON.stringify(
                            {
                              seed: state.logoResult.seed,
                              rarity: state.logoResult.rarity,
                              mode: state.mode,
                            },
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>

            {/* Comparison View */}
            <div
              className={`admin-tab-content ${viewMode === "comparison" ? "active" : ""}`}
            >
              <div className="admin-mt-2">
                <ComparisonView
                  normalLogo={normalComparison}
                  demoLogo={demoComparison}
                  isLoading={state.isGenerating}
                />
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <p>
          Admin Test Generator | Phase 1-3 Complete | Admin auth via
          x-admin-user header
        </p>
      </footer>
    </div>
  );
}
