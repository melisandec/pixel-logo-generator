import { useState, useCallback } from "react";
import { LogoResult } from "@/lib/logoGenerator";

/**
 * Manages core logo generation state:
 * - Input text and custom seed
 * - Generated logo result
 * - Current entry ID in database
 * - Loading states for generation/sharing/casting
 */
export function useGeneratorState() {
  const [inputText, setInputText] = useState("");
  const [customSeed, setCustomSeed] = useState<string>("");
  const [seedError, setSeedError] = useState<string>("");
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  const resetForNewGeneration = useCallback(() => {
    setLogoResult(null);
    setCurrentEntryId(null);
    setSeedError("");
  }, []);

  const setGenerationInProgress = useCallback((inProgress: boolean) => {
    setIsGenerating(inProgress);
  }, []);

  const setSharingInProgress = useCallback((inProgress: boolean) => {
    setIsSharing(inProgress);
  }, []);

  const setCastingInProgress = useCallback((inProgress: boolean) => {
    setIsCasting(inProgress);
  }, []);

  return {
    inputText,
    setInputText,
    customSeed,
    setCustomSeed,
    seedError,
    setSeedError,
    logoResult,
    setLogoResult,
    currentEntryId,
    setCurrentEntryId,
    isGenerating,
    setGenerationInProgress,
    isSharing,
    setSharingInProgress,
    isCasting,
    setCastingInProgress,
    resetForNewGeneration,
  };
}
