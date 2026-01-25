import { useState, useCallback } from "react";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface MomentState {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

/**
 * Manages UI state:
 * - Toast notifications
 * - Modals (onboarding, feedback, how it works, boot screen)
 * - Moments (celebratory popups)
 * - Sound preferences
 * - Mobile detection
 * - Download menu visibility
 * - Display modes (simple vs advanced)
 */
export function useUIState() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showDailyBoot, setShowDailyBoot] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [activeMoment, setActiveMoment] = useState<MomentState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [uiMode, setUiMode] = useState<"simple" | "advanced">("simple");

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type });
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    },
    [],
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      localStorage.setItem("plf:soundEnabled", JSON.stringify(!prev));
      return !prev;
    });
  }, []);

  const showMoment = useCallback((moment: MomentState) => {
    setActiveMoment(moment);
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => setActiveMoment(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismissMoment = useCallback(() => {
    setActiveMoment(null);
  }, []);

  return {
    toast,
    showToast,
    dismissToast,
    showDailyBoot,
    setShowDailyBoot,
    showOnboardingModal,
    setShowOnboardingModal,
    onboardingDone,
    setOnboardingDone,
    showFeedbackModal,
    setShowFeedbackModal,
    showHowItWorks,
    setShowHowItWorks,
    activeMoment,
    showMoment,
    dismissMoment,
    soundEnabled,
    toggleSound,
    showDownloadOptions,
    setShowDownloadOptions,
    isMobile,
    setIsMobile,
    uiMode,
    setUiMode,
  };
}
