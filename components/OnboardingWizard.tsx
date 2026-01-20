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
      className="fixed top-2 left-2 right-2 z-50 bg-[#0a0e27] border border-[#00ff00] p-2"
      style={{
        fontSize: "11px",
        lineHeight: "1.3",
        maxWidth: "600px",
        margin: "0 auto",
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto",
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 font-mono" style={{ color: "#aaa" }}>
          <strong style={{ color: "#00ff00" }}>Tip:</strong> Same text + seed =
          same logo. Rarity is random. 3 tries/day.
        </div>
        <button
          onClick={onSkip}
          className="hover:text-white font-bold"
          style={{
            minWidth: "20px",
            fontSize: "14px",
            lineHeight: "1",
            color: "#888",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
