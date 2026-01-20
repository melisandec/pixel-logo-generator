"use client";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingWizard({
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "8px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        backgroundColor: "#0a0e27",
        border: "1px solid #00ff00",
        padding: "8px 12px",
        fontSize: "11px",
        lineHeight: "1.3",
        maxWidth: "calc(100% - 16px)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, fontFamily: "monospace", color: "#aaa" }}>
          <strong style={{ color: "#00ff00" }}>Tip:</strong> Same text + seed =
          same logo. Rarity is random. 3 tries/day.
        </div>
        <button
          onClick={onSkip}
          style={{
            minWidth: "20px",
            fontSize: "16px",
            lineHeight: "1",
            color: "#888",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
