"use client";

import { useState, useEffect } from "react";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS = [
  {
    title: "🎮 Welcome to Pixel Logo Forge",
    content:
      "Transform words into unique pixel art logos. Every creation is one-of-a-kind!",
    visual: "✨",
  },
  {
    title: "🎲 Seeds = Determinism",
    content:
      "Your text becomes a seed number. Same input = same logo every time. Think of it as your logo's DNA!",
    visual: "🧬",
  },
  {
    title: "💎 Rarity System",
    content:
      "Every logo has a rarity: COMMON, RARE, EPIC, or LEGENDARY. The rarer, the more special!",
    visual: "⭐",
  },
  {
    title: "🕹️ Daily Limits",
    content:
      "You get 3 tries per day to keep things fair and fun. Make each one count!",
    visual: "🎯",
  },
];

export default function OnboardingWizard({
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay for entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkipClick = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleSkipClick}
    >
      <div
        className={`relative bg-gradient-to-br from-[#0a0e27] to-[#1a1e37] border-2 border-[#00ff00] rounded-lg p-4 max-w-sm w-full shadow-[0_0_20px_rgba(0,255,0,0.2)] transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 20px rgba(0, 255, 0, 0.2), inset 0 0 10px rgba(0, 255, 0, 0.05)",
        }}
      >
        {/* CRT Scanlines Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5 rounded-lg"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)",
          }}
        />

        {/* Visual Icon */}
        <div className="text-center mb-3">
          <div className="text-3xl mb-2">{step.visual}</div>
          <h2 className="text-base font-bold text-[#00ff00] mb-1 font-mono">
            {step.title}
          </h2>
        </div>

        {/* Content */}
        <p className="text-white/80 text-center mb-4 leading-snug font-mono text-xs">
          {step.content}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mb-3">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-[#00ff00] w-4"
                  : index < currentStep
                    ? "bg-[#00ff00]/50"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSkipClick}
            className="flex-1 px-3 py-1.5 border border-white/30 text-white/70 rounded font-mono text-xs hover:bg-white/10 transition-all"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-3 py-1.5 bg-[#00ff00] text-[#0a0e27] rounded font-mono font-bold text-xs hover:bg-[#00ff00]/90 transition-all shadow-[0_0_10px_rgba(0,255,0,0.3)]"
          >
            {currentStep < ONBOARDING_STEPS.length - 1 ? "Next" : "Go! 🚀"}
          </button>
        </div>

        {/* Step Counter */}
        <div className="text-center mt-2 text-white/30 text-[10px] font-mono">
          {currentStep + 1}/{ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}
