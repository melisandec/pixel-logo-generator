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
      className="fixed top-2 left-2 right-2 z-50 bg-[#0a0e27] border border-[#00ff00] rounded p-2 shadow-lg"
      style={{
        fontSize: "0.7rem",
        lineHeight: "1.2",
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 text-white/80 font-mono">
          <strong className="text-[#00ff00]">Tip:</strong> Same text + seed = same logo. Rarity is random. 3 tries/day.
        </div>
        <button
          onClick={onSkip}
          className="text-white/50 hover:text-white font-bold text-sm leading-none"
          style={{ minWidth: "20px" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
