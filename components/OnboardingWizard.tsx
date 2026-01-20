"use client";

import { useState, useEffect } from "react";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS = [
  {
    title: "🎮 Welcome to Pixel Logo Forge",
    content: "Transform words into unique pixel art logos. Every creation is one-of-a-kind!",
    visual: "✨",
  },
  {
    title: "🎲 Seeds = Determinism",
    content: "Your text becomes a seed number. Same input = same logo every time. Think of it as your logo's DNA!",
    visual: "🧬",
  },
  {
    title: "💎 Rarity System",
    content: "Every logo has a rarity: COMMON, RARE, EPIC, or LEGENDARY. The rarer, the more special!",
    visual: "⭐",
  },
  {
    title: "🕹️ Daily Limits",
    content: "You get 3 tries per day to keep things fair and fun. Make each one count!",
    visual: "🎯",
  },
];

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
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
        className={`relative bg-gradient-to-br from-[#0a0e27] to-[#1a1e37] border-4 border-[#00ff00] rounded-xl p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)",
        }}
      >
        {/* CRT Scanlines Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 rounded-lg"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)",
          }}
        />

        {/* Visual Icon */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-pulse">{step.visual}</div>
          <h2 className="text-2xl font-bold text-[#00ff00] mb-2 font-mono tracking-wider">
            {step.title}
          </h2>
        </div>

        {/* Content */}
        <p className="text-white/90 text-center mb-8 leading-relaxed font-mono text-sm">
          {step.content}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-[#00ff00] w-6"
                  : index < currentStep
                  ? "bg-[#00ff00]/50"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkipClick}
            className="flex-1 px-4 py-3 border-2 border-white/30 text-white/70 rounded-lg font-mono text-sm hover:bg-white/10 transition-all"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-[#00ff00] text-[#0a0e27] rounded-lg font-mono font-bold text-sm hover:bg-[#00ff00]/90 transition-all shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          >
            {currentStep < ONBOARDING_STEPS.length - 1 ? "Next →" : "Let's Go! 🚀"}
          </button>
        </div>

        {/* Step Counter */}
        <div className="text-center mt-4 text-white/40 text-xs font-mono">
          {currentStep + 1} / {ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}
